import tensorflow as tf
from typing import Dict
from keras.models import Model

# classe singleton
class Cache:
    blank_models: Dict[str, tf.keras.Model] = {}
    trained_models: Dict[str, tf.keras.Model] = {}
    images: Dict[str, tf.Tensor] = {}

    models: Dict[str, Model] = {}
    
    epochs: int
    batch_size: int
    learning_rate: float

cache = Cache()