import tensorflow as tf
import numpy as np
from keras import Model
import os
import shutil
import os
from collections.abc import Generator

from backend.core.constants import LAYER_CONSTRUCTORS, LOSS_MAP
from backend.core.caches import cache

from backend.utils.tensor_utils import latent_vector_batch, batch_tensor, duplicate_outputs, apply_math, apply_scaling, apply_label_encoding
from backend.utils.csv_utils import make_dataset_from_csv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "temp")


def topological_sort(nodes, edges):
    from collections import defaultdict, deque

    in_degree = defaultdict(int)
    adj_list = defaultdict(list)

    for edge in edges.values():
        source = edge["source"]["nodeId"]
        target = edge["target"]["nodeId"]
        adj_list[source].append(target)
        in_degree[target] += 1

    queue = deque([nid for nid in nodes if in_degree[nid] == 0])
    topo_order = []

    while queue:
        nid = queue.popleft()
        topo_order.append(nid)
        for neighbor in adj_list[nid]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    # Les nodes qui restent avec un in-degree > 0 sont problématiques
    problematic_nodes = [nid for nid, deg in in_degree.items() if deg > 0]

    return topo_order, problematic_nodes

def build_model_from_graph(nodes, edges, target_model_id=None):
    layers_map = {}
    computed_outputs = {}
    problematic_nodes = []

    # Étape 0 : Filtrage si target_model_id
    if target_model_id:
        relevant_nodes = set()
        relevant_edges = set()

        def reverse_dfs(node_id):
            if node_id in relevant_nodes:
                return
            relevant_nodes.add(node_id)
            for edge_id, edge in edges.items():
                if edge["target"]["nodeId"] == node_id:
                    relevant_edges.add(edge_id)
                    reverse_dfs(edge["source"]["nodeId"])

        reverse_dfs(target_model_id)
        nodes = {nid: node for nid, node in nodes.items() if nid in relevant_nodes}
        edges = {eid: edge for eid, edge in edges.items() if eid in relevant_edges}

    # Étape 1 : Tri topologique avec récupération des nodes problématiques
    topo_order, topo_problem_nodes = topological_sort(nodes, edges)
    problematic_nodes.extend(topo_problem_nodes)

    for node_id in topo_order:
        node = nodes[node_id]
        node_type = node["type"]

        try:
            if node_type == "output":
                incoming = [e["source"]["nodeId"] for e in edges.values() if e["target"]["nodeId"] == node_id]
                if not incoming:
                    problematic_nodes.append(node_id)
                    continue
                computed_outputs[node_id] = computed_outputs[incoming[0]]
                continue

            if node_type not in LAYER_CONSTRUCTORS:
                continue

            params = node["content"]["ports"]["inputs"]
            layer = LAYER_CONSTRUCTORS[node_type](node_id, params)

            if node_type == "input":
                output_tensor = layer
            else:
                incoming = [e["source"]["nodeId"] for e in edges.values() if e["target"]["nodeId"] == node_id]
                if not incoming:
                    problematic_nodes.append(node_id)
                    continue
                input_tensor = computed_outputs[incoming[0]]
                try:
                    output_tensor = layer(input_tensor)
                except Exception:
                    problematic_nodes.append(node_id)
                    continue

            layers_map[node_id] = layer
            computed_outputs[node_id] = output_tensor
        except Exception:
            problematic_nodes.append(node_id)

    # Étape 3 : Inputs et Outputs
    inputs = [computed_outputs[nid] for nid, node in nodes.items() if node["type"] == "input"]
    used_as_source = set(edge["source"]["nodeId"] for edge in edges.values())
    output_node_ids = [nid for nid in computed_outputs if nid not in used_as_source]
    outputs = [computed_outputs[nid] for nid in output_node_ids]

    if not outputs:
        return {"model": None, "problematic_nodes": problematic_nodes, "error": "No valid output layers found"}

    model = Model(inputs=inputs, outputs=outputs, name=f"GeneratedModel_{target_model_id or 'full'}")
    return {"model": model, "problematic_nodes": problematic_nodes}

def find_trainable_nodes(nodes, edges):
    """Identifie les nodes 'model' en amont des losses."""
    trainable_nodes = set()
    loss_nodes = [nid for nid, n in nodes.items() if n["type"] == "lossFunction"]

    def backtrack(node_id):
        for edge in get_input_edges(node_id, edges):
            src_id = edge["source"]["nodeId"]
            src_node = nodes[src_id]
            if src_node["type"] == "model":
                trainable_nodes.add(src_id)
            backtrack(src_id)

    for loss_id in loss_nodes:
        backtrack(loss_id)

    return trainable_nodes

def get_input_edges(node_id, edges):
    """Retourne toutes les edges entrantes d'un node."""
    return [e for e in edges.values() if e["target"]["nodeId"] == node_id]

def compute_outputs(node_id, nodes, edges, output_package, nodes_cache=None, history=None, path_collector=None):
    if path_collector is not None:
        path_collector.append(node_id)
    """ if node_id in nodes_cache:
        return nodes_cache[node_id] """

    node = nodes[node_id]
    node_type = node["type"]
    inputs = {}

    # --- 1. Inputs reliés par un edge ---
    for edge in get_input_edges(node_id, edges):
        source_node_id = edge["source"]["nodeId"]
        source_handle_id = edge["source"]["handleId"]
        target_handle_id = edge["target"]["handleId"]

        output_package = compute_outputs(source_node_id, nodes, edges, output_package, nodes_cache, history)
        source_outputs = output_package["data"]
        if (not source_outputs):
            print(output_package["message"])
            return output_package
        print("prop: ", source_handle_id, "and", source_outputs)
        cand = source_outputs[source_handle_id]
        if isinstance(cand, dict) and "value" in cand:
            value = cand["value"]
        else:
            value = cand


        inputs[target_handle_id] = value

    # --- 2. Inputs constants (non reliés par un edge) ---
    for h_id, handle in node["content"]["ports"]["inputs"].items():
        if h_id not in inputs:
            value = handle.get("value", handle)
            inputs[h_id] = value

    outputs = {}

    try:
        # --- 3. Calcul selon le type de node ---
        if node_type == "latentVector":
            latent_dim = inputs["in-vectorSize"]
            distribution = inputs["in-distribution"]

            if isinstance(latent_dim, (tuple, list)):
                latent_dim = latent_dim[0]
            elif isinstance(latent_dim, int):
                pass
            else:
                raise ValueError(f"latent_dim inattendu: {latent_dim}")

            vector = latent_vector_batch(batch_size=cache.batch_size, latent_dim=latent_dim, distribution=distribution)
            outputs["out-vector"] = vector

        elif node_type == "viewer":
            data = inputs["in-data"]
            print("DATA ...", data)

            outputs["out-data"] = data
        
        elif node_type == "tensor":
            data = inputs["in-data"]
            data = tf.convert_to_tensor(data)
            outputs["out-data"] = data


        elif node_type == "table":
            fileName = inputs["in-fileName"]
            batch_size = cache.batch_size
            
            columns_type = cache.hodgepodge["columns_type"].get(fileName, None)
            print(" ---: ", fileName, columns_type, cache.file_paths)

            if fileName not in cache.file_paths:
                os.makedirs(UPLOAD_DIR, exist_ok=True)
                file_path = os.path.join(UPLOAD_DIR, fileName)
                if os.path.exists(file_path):
                    print(f"{file_path} already exists, skipping creation")
                else:
                    with open(file_path, "wb") as f:
                        shutil.copyfileobj(cache.data[fileName].file, f)
                cache.file_paths[fileName] = file_path


            file_path = cache.file_paths[fileName]
            print(file_path)
            print(fileName, cache.generators)

        # --- Créer dataset si pas encore fait ---
            if fileName not in cache.generators:
                print("---------------- used --------------------------")
                output_package = make_dataset_from_csv(file_path, columns_type, batch_size)
                if (output_package["status"] == "error"):
                    return output_package

                features_iter = output_package["data"]["features_iter"]
                labels_iter = output_package["data"]["labels_iter"]

                cache.generators[fileName] = {
                    "features_iter": features_iter,
                    "labels_iter": labels_iter
                }

            dataset_obj = cache.generators[fileName]
            features_iter = dataset_obj["features_iter"]
            labels_iter = dataset_obj["labels_iter"]

            outputs["out-features"] = features_iter
            outputs["out-labels"] = labels_iter

        elif node_type == "scaling": 
            features = inputs["in-data"]
            reference = inputs["in-reference"]
            method = inputs["in-method"]

            print("features:", features, "reference:", reference)

            scaled = apply_scaling(method, reference, features)
            outputs["out-data"] = scaled

        elif node_type == "labelEncoding":
            labels_gen = inputs["in-labels"]
            reference = None
            method = inputs["in-method"]

            encoded_label = apply_label_encoding(method, labels_gen, labels_gen)


            outputs["out-data"] = encoded_label

        elif node_type == "math":
            method = inputs["in-method"]
            a = tf.convert_to_tensor(inputs["in-a"], dtype=tf.float32)
            b = tf.convert_to_tensor(inputs["in-b"], dtype=tf.float32)
            
            c = apply_math(method, a, b)

            outputs["out-value"] = c

        elif node_type == "images":
            images_filename = inputs["in-images"]

            images = [cache.images[f] for f in images_filename if f in cache.images]
            images_tensor = tf.stack(images, axis=0)

            batched_images = batch_tensor(images_tensor, batch_size=cache.batch_size)

            outputs["out-images"] = tf.concat(batched_images, axis=0)

        elif node_type == "fill":
            data = inputs["in-data"]
            fill_number = inputs["in-fillNumber"]

            arr = np.array(data)

            shape = arr.shape

            filled = np.full(shape, fill_number, dtype=arr.dtype)

            outputs["out-data"] = tf.convert_to_tensor(filled)

        elif node_type == "model":
            model_id = inputs["in-modelId"]
            features = inputs["in-data"]
            model = cache.models[model_id]

            out_data = model(features)
            print("MODEL SOLITED", out_data)
            outputs["out-data"] = out_data

        elif node_type == "lossFunction":
            loss = inputs["in-loss"]
            pred = inputs["in-prediction"]
            labels = inputs["in-labels"]

            loss_fn = LOSS_MAP[loss]
            value = loss_fn(labels, pred)
            outputs["out-loss"] = value

        elif node_type == "score":
            score = inputs["in-score"]
            is_tracking = inputs["in-isTracking"]
            
            if is_tracking:
                tracking_name = inputs["in-trackingName"]

                if tracking_name not in history:
                    history[tracking_name] = []

                while len(history[tracking_name]) <= cache.current_epoch:
                    history[tracking_name].append(None)

                history[tracking_name][cache.current_epoch] = float(score)

            outputs["out-score"] = score

        else: outputs = duplicate_outputs(node)

    except Exception as e:
        print("error", str(e))
        return {"data": None, "message": f"Node {node_id} failed: {str(e)}", "status": "error"}

    # --- 4. Sauvegarde dans cache et retour ---

    return { "data" : outputs, "message": "Propagation...", "status": "info"}