import tensorflow as tf
from typing import Dict
from keras.models import Model
from fastapi import UploadFile

# classe singleton
class Cache:
    blank_models: Dict[str, tf.keras.Model] = {}
    trained_models: Dict[str, tf.keras.Model] = {}
    images: Dict[str, tf.Tensor] = {}

    models: Dict[str, Model] = {}
    
    total_epochs: int
    current_epoch: int
    batch_size: int
    learning_rate: float

    data: Dict[str, UploadFile] = {}

    training_state: Dict[str, bool] = {
        "running": False,
        "paused": False,
        "cancelled": False
    }


    hodgepodge = {
        "mean_std": {},
        "label_encoder": {},
        "columns_type": {},
    }

    generators = {}
    file_paths = {}
    next_cache = {}

cache = Cache()