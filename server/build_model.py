import keras as k
from keras.api.layers import Input, Dense
from keras.api import Model

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
                if edge["target"] == node_id:
                    relevant_edges.add(edge_id)
                    reverse_dfs(edge["source"])

        reverse_dfs(target_model_id)
        nodes = {nid: node for nid, node in nodes.items() if nid in relevant_nodes}
        edges = {eid: edge for eid, edge in edges.items() if eid in relevant_edges}

    # Étape 1 : Créer les Inputs
    for node_id, node in nodes.items():
        if node["type"] == "input":
            shape = tuple(node["data"]["values"]["output"]["layer"])
            input_layer = Input(shape=shape, name=f"input_{node_id}")
            layers_map[node_id] = input_layer
            computed_outputs[node_id] = input_layer

    # Étape 2 : Créer les couches Dense
    for node_id, node in nodes.items():
        if node["type"] == "dense":
            params = node["data"]["values"]["input"]
            layer = Dense(
                units=params["units"],
                activation=params["activation"],
                use_bias=params["useBias"],
                name=f"dense_{node_id}"
            )
            layers_map[node_id] = layer
        elif node["type"] == "model":
            continue  # marqueur logique, pas une vraie couche

    # Étape 3 : Connecter les couches
    for edge_id, edge in edges.items():
        source = edge["source"]
        target = edge["target"]

        if source not in computed_outputs:
            raise ValueError(f"Source node {source} has no computed output")

        source_tensor = computed_outputs[source]

        if target in layers_map:
            target_layer = layers_map[target]
            output_tensor = target_layer(source_tensor)
            computed_outputs[target] = output_tensor
        else:
            # Peut être un node "model" ou autre, on transmet l'output
            computed_outputs[target] = source_tensor

    # Étape 4 : Inputs
    inputs = [computed_outputs[k] for k, v in nodes.items() if v["type"] == "input"]

    # Étape 5 : Outputs
    used_as_source = set(edge["source"] for edge in edges.values())
    output_node_ids = [nid for nid in computed_outputs if nid not in used_as_source]
    outputs = [computed_outputs[o] for o in output_node_ids]

    if not outputs:
        raise ValueError("No valid output layers found.")

    model = Model(inputs=inputs, outputs=outputs, name=f"GeneratedModel_{target_model_id or 'full'}")
    return model
