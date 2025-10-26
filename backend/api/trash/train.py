import tensorflow as tf

def execute_node(node_id, nodes, edges, cache):
    if node_id in cache:
        return cache[node_id]

    node = nodes[node_id]
    input_edges = [e["source"] for e in edges if e["target"] == node_id]
    inputs = [execute_node(src.node, nodes, edges, cache) for src in input_edges]

    # Exécution selon le type
    if node["type"] == "input":
        result = node["fn"]()
    elif node["type"] == "operation":
        result = node["fn"](*inputs)
    elif node["type"] == "model":
        result = node["model"](*inputs)
    elif node["type"] == "loss":
        result = node["fn"](*inputs)
    else:
        raise ValueError(f"Unknown node type: {node['type']}")

    cache[node_id] = result
    return result

def find_trainable_nodes(nodes, edges):
    """
    Identifie les nœuds qui doivent être entraînés (ceux qui
    sont en amont d'une loss function).
    """
    trainable_nodes = set()
    loss_nodes = [nid for nid, n in nodes.items() if n["type"] == "loss"]

    def backtrack(node_id):
        incoming = [e["source"] for e in edges if e["target"].node == node_id]
        for src in incoming:
            src_node = nodes[src.node]
            if src_node["type"] == "model": #output est plus adapté dans la v4
                trainable_nodes.add(src)
            backtrack(src)

    for loss_node in loss_nodes:
        backtrack(loss_node)

    return trainable_nodes


def train_step(nodes, edges, optimizers):
    cache = {}
    losses = {}

    # Trouver tous les modèles qui participent à une loss
    trainable_nodes = find_trainable_nodes(nodes, edges)

    for node_id in trainable_nodes:
        with tf.GradientTape() as tape:
            # Réexécution complète du graphe pour chaque modèle (peut être optimisé)
            loss_nodes = [nid for nid, n in nodes.items() if n["type"] == "loss"]
            total_loss = 0.0
            for loss_id in loss_nodes:
                result = execute_node(loss_id, nodes, edges, cache)
                total_loss += tf.reduce_mean(result)

        grads = tape.gradient(total_loss, nodes[node_id]["model"].trainable_weights) # faux c'est plus models[node_id].trainable_weights
        optim = optimizers.get(node_id)
        if optim:
            optim.apply_gradients(zip(grads, nodes[node_id]["model"].trainable_weights))

        losses[node_id] = total_loss.numpy()

    return losses