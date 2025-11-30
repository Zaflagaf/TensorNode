import traceback
import tensorflow as tf
from keras.models import Model

from backend.core.socket import sio
from backend.core.caches import cache

from backend.utils.graph_utils import compute_outputs

from backend.core.socket import sio

import asyncio



async def compose_service(nodes, edges, hyperparameters, metrics):
    cache.total_epochs = hyperparameters.epochs
    cache.batch_size = hyperparameters.batchSize
    cache.learning_rate = hyperparameters.learningRate

    history = {}
    nodes_cache = {}
    cache.models = {}
    cache.generators = {}
    cache.next_cache = {}


    model_ids = {n["content"]["ports"]["inputs"]["in-modelId"]["value"] for nid, n in nodes.items() if n["type"] == "model"}
    model_ids = list(model_ids)

    if (len(model_ids) == 0):
        return {
            "data": None,
            "message": "No model node detected. You need at least one model node to compose a model.",
            "status": "error"
        }

    for model_id in model_ids:
        model: Model = cache.blank_models[model_id]

        config = model.get_config()
        new_model = Model.from_config(config)

        cache.models[model_id] = new_model

    score_nodes = [nid for nid, n in nodes.items() if n["type"] == "score"]

    if (len(score_nodes) == 0):
        return {
            "data": None,
            "message": "No score node detected. You need at least one score node to compose a model.",
            "status": "error"
        }

    models_score = {}
    for node_id in score_nodes:
        try:
            model_id = nodes[node_id]["content"]["ports"]["inputs"]["in-modelId"]["value"]
        except (KeyError, TypeError):
            return {
                "data": None,
                "message": f"No model specified for the score node '{node_id}'",
                "status": "error",
            }
        models_score[node_id] = model_id 

    optimizers = {model_id: tf.keras.optimizers.Adam(learning_rate=cache.learning_rate)
                for model_id in cache.models}

    try :
        output_package = {
            "data": None,
            "message": None,
            "status": None,
        }
        for epoch in range(cache.total_epochs):
            nodes_cache.clear()
            cache.current_epoch = epoch
            print(epoch)

            await sio.emit("train_progress", {
                "epoch": epoch + 1,
                "total_epochs": cache.total_epochs,
                "history": history,
            })

            problem_nodes = set()
            paths_for_models = {}

            for node_score_id, model_id in models_score.items():
                path_nodes = []  # on récupère les nodes traversés pour ce score
                with tf.GradientTape() as tape:
                    output_package = compute_outputs(node_score_id, nodes, edges, output_package, nodes_cache, history, path_collector=path_nodes)
                    if output_package["status"] == "error":
                        return output_package

                print(output_package)
                score = output_package["data"]["out-score"]

                model = cache.models[model_id]

                grads = tape.gradient(score, model.trainable_weights)
                none_grad_indices = [i for i, g in enumerate(grads) if g is None]
                if none_grad_indices:
                    print(f"Gradient None detected! Model {model_id}, weight indices {none_grad_indices}, node_score_id {node_score_id}")
                    problem_nodes.update(path_nodes) 

                grads_and_vars = [(g, w) for g, w in zip(grads, model.trainable_weights) if g is not None]
                optimizers[model_id].apply_gradients(grads_and_vars)


            cache.trained_models.update(cache.models)
            await sio.emit("train_progress", {
                "epoch": epoch + 1,
                "total_epochs": cache.total_epochs,
                "history": history
            })
    

    except Exception as e:
        traceback.print_exc()
        return output_package

    await sio.emit("train_complete", {
        "epoch": epoch + 1,
        "total_epochs": cache.total_epochs,
        "history": history
    })


    return { 
        "data" :{
            "epoch": epoch + 1,
            "total_epochs": cache.total_epochs,
            "history": history
        }, 
        "message": "Composition successfully completed",
        "status": "success"
    }