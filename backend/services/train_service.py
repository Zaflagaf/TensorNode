import traceback
import tensorflow as tf
from keras.models import Model

from backend.core.socket import sio
from backend.core.caches import cache
from backend.core.constants import METRICS_MAP

from backend.utils.graph_utils import compute_outputs

async def compose_service(nodes, edges, hyperparameters, metrics):
    cache.epochs = hyperparameters.epochs
    cache.batch_size = hyperparameters.batchSize
    cache.learning_rate = hyperparameters.learningRate

    nodes_cache = {}
    cache.models = {}

    model_ids = {n["content"]["ports"]["inputs"]["in-modelId"]["value"]
                for nid, n in nodes.items() if n["type"] == "model"}
    model_ids = list(model_ids)

    score_nodes = [nid for nid, n in nodes.items() if n["type"] == "score"]
    node_metrics = {model_id: {m: METRICS_MAP[m] for m in metrics} for model_id in model_ids}
    metrics.append("score")
    history = {model_id: {m: [] for m in metrics} for model_id in model_ids}

    for model_id in model_ids:
        model: Model = cache.blank_models[model_id]

        config = model.get_config()
        new_model = Model.from_config(config)

        cache.models[model_id] = new_model

    models_score = {} # {nodeScoreId: modelId, ...}  { generator: id, discriminator: id}
    for node_id in score_nodes:
        model_id = nodes[node_id]["content"]["ports"]["inputs"]["in-modelId"]["value"]
        models_score[node_id] = model_id 

    optimizers = {model_id: tf.keras.optimizers.Adam(learning_rate=cache.learning_rate)
                for model_id in cache.models}
    

    try :
        for epoch in range(cache.epochs):
            nodes_cache.clear()

            await sio.emit("train_progress", {
                "epoch": epoch + 1,
                "total_epochs": cache.epochs,
                "history": history,
            })
            problem_nodes = set()  # tous les nodes problématiques
            paths_for_models = {}  # optionnel, pour debugger le chemin exact

            for node_score_id, model_id in models_score.items():
                path_nodes = []  # on récupère les nodes traversés pour ce score
                with tf.GradientTape() as tape:
                    outputs = compute_outputs(node_score_id, nodes, edges, nodes_cache, path_collector=path_nodes)

                score = outputs["out-score"]

                model = cache.models[model_id]
                grads = tape.gradient(score, model.trainable_weights)

                # Vérification des gradients None
                none_grad_indices = [i for i, g in enumerate(grads) if g is None]
                if none_grad_indices:
                    print(f"Gradient None detected! Model {model_id}, weight indices {none_grad_indices}, node_score_id {node_score_id}")
                    problem_nodes.update(path_nodes)  # tous les nodes du chemin sont problématiques

                # Appliquer les gradients normaux
                grads_and_vars = [(g, w) for g, w in zip(grads, model.trainable_weights) if g is not None]
                optimizers[model_id].apply_gradients(grads_and_vars)

                history[model_id]["score"].append(float(score.numpy()))
                """ print("score: ", float(score.numpy())) """
                for m, metric_obj in node_metrics[model_id].items():
                    value = float(metric_obj.result().numpy()) # float(score.numpy()) 

                    history[model_id][m].append(value)
                    
                    metric_obj.reset_state()  # reset pour la prochaine epoch


            await sio.emit("train_progress", {
                "epoch": epoch + 1,
                "total_epochs": cache.epochs,
                "history": history
            })
    
        cache.trained_models.update(cache.models)

    except Exception as e:
        problem_nodes_list = list(problem_nodes)
        print(e)
        traceback.print_exc()
        print("nodes!", problem_nodes_list)
        await sio.emit("training_problem_nodes", {
            "problem_nodes": problem_nodes_list
        })


    await sio.emit("train_complete", {
        "epoch": epoch + 1,
        "total_epochs": cache.epochs,
        "history": history
    })

    return {
        "epoch": epoch + 1,
        "total_epochs": cache.epochs,
        "history": history
    }