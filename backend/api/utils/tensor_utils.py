import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler, MinMaxScaler, RobustScaler
import math

def duplicate_outputs(node):

    raw_outputs = dict(node["content"]["ports"]["outputs"])
    outputs = {}
    for handleId, handle in raw_outputs.items():
        outputs[handleId] = handle["value"]

    return outputs

def batch_tensor(features: tf.Tensor, batch_size: int):
    total_size = tf.shape(features)[0]
    features_dim = features.shape[1:]

    # Nombre total de batches nécessaires
    num_batches = math.ceil(total_size.numpy() / batch_size)  # ou tf.math.ceil

    batches = []
    for i in range(num_batches):
        start = i * batch_size
        end = min((i + 1) * batch_size, int(total_size))
        batch = features[start:end]

        # Si le batch est plus petit que batch_size, répéter les données depuis le début
        current_batch_size = tf.shape(batch)[0]
        if current_batch_size < batch_size:
            needed = batch_size - current_batch_size
            # Répéter autant de fois que nécessaire
            repeat_times = math.ceil(needed.numpy() / total_size.numpy())
            repeat_slice = tf.tile(features, [repeat_times, 1])[:needed]
            batch = tf.concat([batch, repeat_slice], axis=0)

        batches.append(batch)

    return tf.stack(batches)  # renvoie un seul tensor [num_batches, batch_size, features_dim]

def apply_math(method, a, b):
    """
    Apply basic math operations between a and b.
    
    Parameters:
        method (str): "Add", "Multiply", "Subtract", "Divide"
        a, b: numbers (int, float, or convertible to float)
    
    Returns:
        float: result of the operation
    """

    if method == "Add":
        return tf.add(a, b)
    elif method == "Multiply":
        return tf.multiply(a, b)
    elif method == "Subtract":
        return tf.subtract(a, b)
    elif method == "Divide":
        return tf.divide(a, b)
    else:
        raise ValueError(f"Unknown method '{method}'")

def apply_scaling(method: str, reference, features):

    # Sauvegarde de la forme originale
    original_shape = tf.shape(features)
    n_features = features.shape[-1]  # nombre de colonnes/features

    # Flatten vers 2D : (num_samples, n_features)
    features_flat = tf.reshape(features, [-1, n_features])
    reference_flat = tf.reshape(reference, [-1, n_features])

    # Convertir en numpy pour scikit-learn
    features_np = features_flat.numpy()
    reference_np = reference_flat.numpy()

    # Choisir le scaler
    if method == "standardization":
        scaler = StandardScaler()
    elif method == "normalization":
        scaler = MinMaxScaler()
    elif method == "robust":
        scaler = RobustScaler()
    else:
        raise ValueError(f"Unknown scaling method '{method}'")

    # Fit sur la référence et transformer les features
    scaler.fit(reference_np)
    scaled_np = scaler.transform(features_np)

    # Convertir en TensorFlow et reshape à la shape originale
    scaled_tf = tf.constant(scaled_np, dtype=tf.float32)
    scaled_tf = tf.reshape(scaled_tf, original_shape)

    return scaled_tf


def apply_label_encoding(method: str, reference, labels: tf.Tensor):

    # Sauvegarde la forme originale
    original_shape = tf.shape(labels)

    # Aplatir les labels
    labels_flat = tf.reshape(labels, [-1])

    # Aplatir la référence aussi
    if reference is None:
        reference_flat = labels_flat
    else:
        reference_flat = tf.reshape(reference, [-1])

    # Conversion en numpy array (nécessaire pour sklearn)
    labels_np = labels_flat.numpy().astype(str)
    reference_np = reference_flat.numpy().astype(str)

    # --- LABEL ENCODING ---
    if method == "label encoding":
        encoder = LabelEncoder()
        encoder.fit(reference_np)
        encoded = encoder.transform(labels_np)
        encoded_tf = tf.reshape(tf.constant(encoded, dtype=tf.int32), original_shape)
        return encoded_tf

    # --- ONE HOT ENCODING ---
    elif method == "one hot":
        label_enc = LabelEncoder()
        label_enc.fit(reference_np)
        integer_encoded = label_enc.transform(labels_np).reshape(-1, 1)

        onehot_enc = OneHotEncoder(sparse_output=False)
        onehot_enc.fit(np.arange(len(label_enc.classes_)).reshape(-1, 1))
        onehot = onehot_enc.transform(integer_encoded).astype(np.int32)  # ✅ cast ici !

        num_classes = onehot.shape[1]
        reshaped = tf.reshape(onehot, tf.concat([original_shape[:-1], [num_classes]], axis=0))
        return tf.constant(reshaped, dtype=tf.int32)

    # --- LABEL DECODING ---
    elif method == "label decoding":
        label_enc = LabelEncoder()
        label_enc.fit(reference_np)
        decoded = label_enc.inverse_transform(np.array(labels_np, dtype=int))
        decoded_tf = tf.reshape(tf.constant(decoded, dtype=tf.string), original_shape)
        return decoded_tf

    else:
        raise ValueError(f"Unknown labelEncoding method '{method}'")


def latent_vector_batch(batch_size, latent_dim, distribution="normal", dtype=tf.float32, **params):
    """
    Crée un batch de vecteurs latents avec forme (batch_size, latent_dim)
    """
    if distribution == "normal":
        mu = params.get("mu", 0)
        sigma = params.get("sigma", 1)
        arr = np.random.normal(mu, sigma, (batch_size, latent_dim))
    elif distribution == "uniform":
        low = params.get("low", 0)
        high = params.get("high", 1)
        arr = np.random.uniform(low, high, (batch_size, latent_dim))
    else:
        raise ValueError(f"Distribution '{distribution}' non supportée")

    return tf.convert_to_tensor(arr, dtype=dtype)


def batch_inference(model, features):
    """
    Effectue une inférence batchée tout en préservant la structure des batches.

    Parameters:
        model: modèle TensorFlow / Keras
        features: tf.Tensor de shape (num_batches, batch_size, n_features)
    Returns:
        tf.Tensor avec la sortie du modèle pour chaque batch, shape = (num_batches, batch_size, output_dim)
    """

    num_batches = features.shape[0]
    batch_outputs = []

    for i in range(num_batches):
        batch_features = features[i]  # shape: (batch_size, n_features)
        out = model(batch_features)   # shape: (batch_size, output_dim)
        batch_outputs.append(out)

    # Stack pour reconstruire la dimension batch
    all_outputs = tf.stack(batch_outputs, axis=0)  # shape: (num_batches, batch_size, output_dim)
    return all_outputs