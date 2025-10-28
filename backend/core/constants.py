from tensorflow.python.keras.losses import MeanSquaredError, MeanAbsoluteError, MeanAbsolutePercentageError, MeanSquaredLogarithmicError, Huber, LogCosh, BinaryCrossentropy, CategoricalCrossentropy, SparseCategoricalCrossentropy, KLDivergence, Poisson, CosineSimilarity, Hinge
from tensorflow.python.keras.metrics import CategoricalAccuracy, Precision, Recall

from keras.layers import Input, Dense, Dropout, Conv2D, Conv2DTranspose, Reshape, Activation, Lambda, Flatten, LeakyReLU, BatchNormalization
import tensorflow as tf

""" UNGRADIENTABLE = ["data", "scaling", "labelEncoding"]
GRADIENTABLE = ["model", "lossFunction"] # deprecated """

LOSS_MAP = {
    # Régression
    "mean_squared_error": MeanSquaredError(),
    "mean_absolute_error": MeanAbsoluteError(),
    "mean_absolute_percentage_error": MeanAbsolutePercentageError(),
    "mean_squared_logarithmic_error": MeanSquaredLogarithmicError(),
    "huber": Huber(),
    "log_cosh": LogCosh(),

    # Classification
    "binary_crossentropy": BinaryCrossentropy(),
    "categorical_crossentropy": CategoricalCrossentropy(),
    "sparse_categorical_crossentropy": SparseCategoricalCrossentropy(),
    "kullback_leibler_divergence": KLDivergence(),
    "poisson": Poisson(),

    # Similarité / probabilités
    "cosine_similarity": CosineSimilarity(),
    "kl_divergence": KLDivergence(),

    "hinge": Hinge(),

    # Généraux / expérimentaux
    "logcosh": LogCosh(),
    "mean_squared_log_error": MeanSquaredLogarithmicError(),
}

METRICS_MAP = {
    "accuracy": CategoricalAccuracy(),
    "precision": Precision(),
    "recall": Recall(),
}

class ActivationFactory:
    @staticmethod
    def get(activation: str, alpha: str, name: dict):
        """
        node_id: str, utilisé pour nommer la couche
        params: dict, doit contenir au moins 'in-activation' et éventuellement d'autres args
        """
        if activation == "relu":
            return Activation("relu", name=name)
        elif activation == "tanh":
            return Activation("tanh", name=name)
        elif activation == "sigmoid":
            return Activation("sigmoid", name=name)
        elif activation == "softmax":
            return Activation("softmax", name=name)
        elif activation == "softplus":
            return Activation("softplus", name=name)
        elif activation == "selu":
            return Activation("selu", name=name)
        elif activation == "elu":
            return Activation("elu", name=name)
        elif activation == "linear":
            return Activation("linear", name=name)
        elif activation == "exponential":
            return Activation("exponential", name=name)
        elif activation == "swish":
            return Activation(tf.nn.swish, name=name)
        elif activation == "gelu":
            return Activation(tf.nn.gelu, name=name)
        elif activation == "softsign":
            return Activation(tf.nn.softsign, name=name)
        elif activation == "mish":
            return Lambda(lambda x: x * tf.nn.tanh(tf.nn.softplus(x)), name=name)
        elif activation == "leaky_relu":
            return LeakyReLU(alpha=alpha, name=name)
        else:
            raise ValueError(f"Activation '{activation}' non reconnue.")

LAYER_CONSTRUCTORS = {
    "input": lambda node_id, params: Input(
        shape=tuple(params["in-shape"]["value"]),
        name=f"input_{node_id}",
    ),
    "activation": lambda node_id, params: ActivationFactory().get(
        activation=params["in-activation"]["value"].lower(),
        alpha=params["in-alpha"]["value"] if params.get("in-alpha") else 0.1,
        name=f"activation_{node_id}",
    ),
    "dense": lambda node_id, params: Dense(
        units=params["in-units"]["value"],
        activation=params["in-activation"]["value"],
        use_bias=params["in-useBias"]["value"],
        name=f"dense_{node_id}",
    ),
    "conv2d": lambda node_id, params: Conv2D(
        filters=params["in-filters"]["value"],
        kernel_size=tuple(params["in-kernelSize"]["value"]),
        strides=tuple(params["in-strides"]["value"]),
        padding=params["in-padding"]["value"],
        activation=params["in-activation"]["value"],
        name=f"conv2d_{node_id}",
    ),
    "conv2dTranspose": lambda node_id, params: Conv2DTranspose(
        filters=params["in-filters"]["value"],
        kernel_size=tuple(params["in-kernelSize"]["value"]),
        strides=tuple(params["in-strides"]["value"]),
        padding=params["in-padding"]["value"],
        activation=params["in-activation"]["value"],
        name=f"conv2d_{node_id}",
    ),
    "flatten": lambda node_id, params: Flatten(
        name=f"flatten_{node_id}"
    ),
    "reshape": lambda node_id, params: Reshape(
        target_shape=tuple(params["in-shape"]["value"]),
        name=f"reshape_{node_id}",
    ),
    "dropout": lambda node_id, params: Dropout(
        rate=params["in-rate"]["value"],
        name=f"dropout_{node_id}",
    ),  
    "batchNormalization": lambda node_id, params: BatchNormalization(
        axis=params.get("axis", -1),
        momentum=params["in-momentum"]["value"],
        name=f"batchNorm_{node_id}",
    ),
}