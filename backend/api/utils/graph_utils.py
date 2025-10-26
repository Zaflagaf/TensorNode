import tensorflow as tf
import numpy as np
from collections import defaultdict, deque
from keras import Model

from api.core.constants import LAYER_CONSTRUCTORS, LOSS_MAP

from api.core.caches import cache

from api.utils.tensor_utils import latent_vector_batch, batch_inference, batch_tensor, duplicate_outputs, apply_math, apply_scaling, apply_label_encoding

def topological_sort(nodes, edges):
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

    if len(topo_order) != len(nodes):
        raise ValueError("Graph has a cycle or is disconnected")

    return topo_order

def build_model_from_graph(nodes, edges, target_model_id=None):
    layers_map = {}
    computed_outputs = {}
    # Étape 0 : Si un ID de modèle est spécifié, on ne garde que les nodes/edges nécessaires
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
                    source_node = edge["source"]["nodeId"]
                    reverse_dfs(source_node)

        reverse_dfs(target_model_id)
        nodes = {nid: node for nid, node in nodes.items() if nid in relevant_nodes}
        edges = {eid: edge for eid, edge in edges.items() if eid in relevant_edges}

    # Étape 1 : Tri topologique
    topo_order = topological_sort(nodes, edges)

    for node_id in topo_order:
        node = nodes[node_id]
        node_type = node["type"]

        if node_type == "output":
            # Pass-through
            incoming = [
                e["source"]["nodeId"] for e in edges.values() if e["target"]["nodeId"] == node_id
            ]
            if not incoming:
                raise ValueError(f"No input to model node {node_id}")
            computed_outputs[node_id] = computed_outputs[incoming[0]]
            continue

        if node_type not in LAYER_CONSTRUCTORS:
            continue

        params = node["content"]["ports"]["inputs"]
        layer = LAYER_CONSTRUCTORS[node_type](node_id, params)

        # Pour Input, on n'a pas d'entrée
        if node_type == "input":
            output_tensor = layer
        else:
            incoming = [
                e["source"]["nodeId"] for e in edges.values() if e["target"]["nodeId"] == node_id
            ]
            if not incoming:
                raise ValueError(f"No input connection to {node_type} node {node_id}")
            input_tensor = computed_outputs[incoming[0]]
            output_tensor = layer(input_tensor)

        layers_map[node_id] = layer
        computed_outputs[node_id] = output_tensor

    # Étape 3 : Inputs et Outputs
    inputs = [computed_outputs[nid] for nid, node in nodes.items() if node["type"] == "input"]

    used_as_source = set(edge["source"]["nodeId"] for edge in edges.values())
    output_node_ids = [nid for nid in computed_outputs if nid not in used_as_source]
    outputs = [computed_outputs[nid] for nid in output_node_ids]

    if not outputs:
        raise ValueError("No valid output layers found.")

    model = Model(inputs=inputs, outputs=outputs, name=f"GeneratedModel_{target_model_id or 'full'}")
    return model


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


def compute_outputs(node_id, nodes, edges, nodes_cache, path_collector=None):
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

        source_outputs = compute_outputs(source_node_id, nodes, edges, nodes_cache)

        # Try to obtain the exact handle value first
        value = None
        if isinstance(source_outputs, dict) and source_handle_id in source_outputs:
            cand = source_outputs[source_handle_id]
            # unwrap {"value": ...} if present
            if isinstance(cand, dict) and "value" in cand:
                value = cand["value"]
            else:
                value = cand
        else:
            # If the upstream node returned a single-entry dict, unwrap it
            if isinstance(source_outputs, dict) and len(source_outputs) == 1:
                only = next(iter(source_outputs.values()))
                if isinstance(only, dict) and "value" in only:
                    value = only["value"]
                else:
                    value = only
            else:
                # Fallback: take the whole object (could be a raw tensor/array)
                value = source_outputs

        inputs[target_handle_id] = value

    # --- 2. Inputs constants (non reliés par un edge) ---
    for h_id, handle in node["content"]["ports"]["inputs"].items():
        if h_id not in inputs:
            value = handle.get("value", handle)
            inputs[h_id] = value

    outputs = {}

    # --- 3. Calcul selon le type de node ---
    if node_type == "latentVector":
        latent_dim = inputs["in-vectorSize"]
        distribution = inputs["in-distribution"]

        # si latent_dim est int, on le transforme en int
        if isinstance(latent_dim, (tuple, list)):
            latent_dim = latent_dim[0]
        elif isinstance(latent_dim, int):
            pass
        else:
            raise ValueError(f"latent_dim inattendu: {latent_dim}")

        vector = latent_vector_batch(batch_size=cache.batch_size, latent_dim=latent_dim, distribution=distribution)
        outputs["out-vector"] = vector  # forme (BATCH_SIZE, latent_dim) # (8, 100)

    elif node_type == "excel":
        features = inputs["in-features"]
        labels = inputs["in-labels"]
        batch_size = cache.batch_size

        features = tf.convert_to_tensor(features)
        labels = tf.convert_to_tensor(labels)

        features = batch_tensor(features, batch_size)
        labels = batch_tensor(labels, batch_size)

        outputs["out-features"] = features
        outputs["out-labels"] = labels

    elif node_type == "scaling": 
        features = inputs["in-data"]
        reference = inputs["in-reference"]
        method = inputs["in-method"]

        scaled = apply_scaling(method, reference, features)

        outputs["out-data"] = scaled


    elif node_type == "labelEncoding":
        labels = inputs["in-labels"]
        reference = None #inputs["in-reference"]
        method = inputs["in-method"]

        encoded_label = apply_label_encoding(method, reference, labels)

        outputs["out-data"] = encoded_label

    elif node_type == "math":
        method = inputs["in-method"]
        a = tf.convert_to_tensor(inputs["in-a"], dtype=tf.float32) # "A" est le loss
        b = tf.convert_to_tensor(inputs["in-b"], dtype=tf.float32) # "B" égale 2
        
        c = apply_math(method, a, b)

        outputs["out-value"] = c


    elif node_type == "images":            
        images_filename = inputs["in-images"]

        images = [cache.images[f] for f in images_filename if f in cache.images]
        images_tensor = tf.stack(images, axis=0)

        batched_images = batch_tensor(images_tensor, batch_size=cache.batch_size)

        outputs["out-images"] = tf.concat(batched_images, axis=0)

    elif node_type == "fill":
        data = inputs["in-data"]  # np.ndarray ou convertible en np.ndarray
        fill_number = inputs["in-fillNumber"]

        # S'assurer que c'est un array
        arr = np.array(data)
        
        # Récupérer la shape
        shape = arr.shape

        # Créer un nouveau tableau rempli avec fill_number
        filled = np.full(shape, fill_number, dtype=arr.dtype)

        outputs["out-data"] = tf.convert_to_tensor(filled)

    elif node_type == "model":
        model_id = inputs["in-modelId"]
        features = inputs["in-data"]

        model = cache.models[model_id]

        out_data = batch_inference(model, features)

        outputs["out-data"] = out_data

    elif node_type == "lossFunction":
        loss = inputs["in-loss"]
        pred = inputs["in-prediction"]
        labels = inputs["in-labels"]

        """ for metric_name, metric_obj in node_metrics["node-51"].items():
            metric_obj.update_state(labels, pred) """

        loss_fn = LOSS_MAP[loss]
        value = loss_fn(labels, pred)
        outputs["out-loss"] = value

    elif node_type == "score":
        score = inputs["in-score"]

        outputs["out-score"] = score

    else:
        outputs = duplicate_outputs(node)

    # --- 4 Mise en nodes_cache ---
    """ nodes_cache[node_id] = outputs """
    return outputs