from backend.core.caches import cache
from backend.utils.graph_utils import build_model_from_graph

def build_model_service(nodes, edges, model_id, model_name):

    result = build_model_from_graph(nodes=nodes, edges=edges, target_model_id=model_id)

    # Si build_model_from_graph renvoie None ou autre chose
    if not result:
        return {
            "data": None,
            "message": f"The model '{model_name}' does not have a valid architecture",
            "status": "error"
        }

    model = result.get("model")
    problematic_nodes = result.get("problematic_nodes", [])


    if problematic_nodes:
        return {
            "data": {
                "problematic_nodes": problematic_nodes,
            },
            "message": f"The model '{model_name}' is not an acyclic directed graph (certainly due to an input-output discontinuity).",
            "status": "error"
        }

    if model:
        cache.blank_models[model_id] = model
        cache.trained_models[model_id] = model  # pour reset côté frontend
        return {
            "data": {
                "problematic_nodes": [],
            },
            "message": f"The model '{model_name}' was built and saved successfully",
            "status": "success"
        }
    else:
        return {
            "data": None,
            "message": f"The model was never saved",
            "status": "error"
        }


def get_model_architecture_service(model_id):
    model_architecture = []
    model = cache.blank_models.get(model_id, None)

    if not model: return {}

    for layer in model.layers:
        try:
            layer_info = {
                "layer": layer.__class__.__name__,
                "output": str(layer.output.shape),
                "params": layer.count_params(),
            }
        except Exception as e:
            print(f"Erreur lors de l'accès aux informations de la couche {layer}: {e}")
            continue
        
        # Ajoute les informations sur la couche à la liste
        model_architecture.append(layer_info)

    total_params = model.count_params()
    trainable_params = sum([layer.count_params() for layer in model.layers if layer.trainable])
    non_trainable_params = total_params - trainable_params

    return {
        "architecture": model_architecture,
        "summary": {
            "total_params": total_params,
            "trainable_params": trainable_params,
            "non_trainable_params": non_trainable_params,
        }
    }