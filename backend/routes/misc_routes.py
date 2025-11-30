from fastapi import APIRouter
import tensorflow as tf
import numpy as np
from backend.utils.graph_utils import compute_outputs
from backend.types.request_type import ComputeOutputsRequest

router = APIRouter()


@router.get('/')
def hello_from_backend():
    return {
        "message": "Backend Tensornode"
    }

@router.post('/compute_outputs')
def compute_node_outputs(data: ComputeOutputsRequest):
    node_id = data.nodeId
    nodes = data.nodes
    edges = data.edges
    output_package = {
        "data": None,
        "message": None,
        "status": None
    }

    print("----------------------- STARTED -----------------------")
    output_package = compute_outputs(
        node_id=node_id,
        nodes=nodes,
        edges=edges,
        output_package=output_package
    )

    # S'assurer que toutes les sous-clés de "data" sont JSONables
    if output_package.get("data") is not None:
        output_package["data"] = make_jsonable(output_package["data"])

    return output_package["data"]


def make_jsonable(obj):
    """Convertit un tensor, ndarray, ou récursivement dict/list en liste Python ou type JSONable."""
    if isinstance(obj, tf.Tensor):
        return obj.numpy().tolist()
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, dict):
        return {k: make_jsonable(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [make_jsonable(v) for v in obj]
    return obj  # int, float, str, bool, None
