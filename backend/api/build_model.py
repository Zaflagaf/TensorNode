from keras.layers import Input, Dense, BatchNormalization, Dropout
from keras import Model
from collections import defaultdict, deque

def topological_sort(nodes, edges):
    in_degree = defaultdict(int)
    adj_list = defaultdict(list)

    for edge in edges.values():
        source = edge["sourceNode"]
        target = edge["targetNode"]
        adj_list[source].append(target)
        in_degree[target] += 1

    # Start with nodes having no incoming edges
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

    # Étape 0 : Si un ID de modèle est spécifié, trouver les nodes/edges nécessaires
    if target_model_id:
        relevant_nodes = set()
        relevant_edges = set()

        def reverse_dfs(node_id):
            if node_id in relevant_nodes:
                return
            relevant_nodes.add(node_id)
            for edge_id, edge in edges.items():
                if edge.get("targetNode") == node_id:
                    relevant_edges.add(edge_id)
                    source_node = edge.get("sourceNode")
                    if source_node:
                        reverse_dfs(source_node)

        reverse_dfs(target_model_id)
        nodes = {nid: node for nid, node in nodes.items() if nid in relevant_nodes}
        edges = {eid: edge for eid, edge in edges.items() if eid in relevant_edges}

    # Étape 1 : Tri topologique des nœuds (important pour l’ordre de traitement)
    topo_order = topological_sort(nodes, edges)

    # Étape 2 : Parcours des nœuds dans l’ordre topologique
    for node_id in topo_order:
        node = nodes[node_id]
        node_type = node["type"]

        if node_type == "input":
            shape = tuple(node["content"]["ports"]["inputs"]["shape"])
            input_layer = Input(shape=shape, name=f"input_{node_id}")
            layers_map[node_id] = input_layer
            computed_outputs[node_id] = input_layer

        elif node_type == "dense":
            params = node["content"]["ports"]["inputs"]
            dense_layer = Dense(
                units=params["units"],
                activation=params["activation"],
                use_bias=params["useBias"],
                name=f"dense_{node_id}"
            )

            # Trouver les sources (on prend la première si plusieurs)
            incoming = [e["sourceNode"] for e in edges.values() if e.get("targetNode") == node_id]
            if not incoming:
                raise ValueError(f"No input connection to dense node {node_id}")
            input_tensor = computed_outputs[incoming[0]]
            output_tensor = dense_layer(input_tensor)

            layers_map[node_id] = dense_layer
            computed_outputs[node_id] = output_tensor

        elif node_type == "batchNorm":
            params = node["content"]["ports"]["inputs"]
            batch_norm_layer = BatchNormalization(
                axis=params["axis"],
                momentum=params["momentum"],
                name=f"batchNorm_{node_id}"
            )

            # Trouver les sources (on prend la première si plusieurs)
            incoming = [e["sourceNode"] for e in edges.values() if e.get("targetNode") == node_id]
            if not incoming:
                raise ValueError(f"No input connection to dense node {node_id}")
            input_tensor = computed_outputs[incoming[0]]
            output_tensor = batch_norm_layer(input_tensor)

            layers_map[node_id] = batch_norm_layer
            computed_outputs[node_id] = output_tensor

        elif node_type == "model":
            # Pas de couche réelle — transmet simplement l'entrée vers la sortie
            incoming = [e["sourceNode"] for e in edges.values() if e.get("targetNode") == node_id]
            if not incoming:
                raise ValueError(f"No input to model node {node_id}")
            computed_outputs[node_id] = computed_outputs[incoming[0]]



        else:
            # Cas non gérés ici (ex: compile, fit...) — ignorer
            continue

    # Étape 3 : Déterminer les inputs et outputs du modèle
    inputs = [computed_outputs[nid] for nid, node in nodes.items() if node["type"] == "input"]

    # Sorties : tous les nœuds qui ne sont pas source d'une autre couche
    used_as_source = set(edge["sourceNode"] for edge in edges.values())
    output_node_ids = [nid for nid in computed_outputs if nid not in used_as_source]
    outputs = [computed_outputs[nid] for nid in output_node_ids]

    if not outputs:
        raise ValueError("No valid output layers found.")

    model = Model(inputs=inputs, outputs=outputs, name=f"GeneratedModel_{target_model_id or 'full'}")
    return model
