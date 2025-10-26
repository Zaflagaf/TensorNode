from api.core.caches import cache
from api.utils.graph_utils import build_model_from_graph


def build_model_service(nodes, edges, model_id, model_name):
    model = build_model_from_graph(nodes=nodes, edges=edges, target_model_id=model_id)
    model.summary()

    cache.blank_models[model_id] = model
    return {"title": f"Model builded", "message": f"'{model_name}' successfully generated and stored"}

def get_model_architecture_service(model_id):
    model_architecture = []
    model = cache.blank_models.get(model_id)
    
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