import numpy as np
import tensorflow as tf
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler, MinMaxScaler, RobustScaler
import math
from backend.utils.csv_utils import stable_next
from backend.core.caches import cache
from backend.lib.generator import Generator

# REVIEW the code need to be reviewed after the Class update

def compute_streaming_mean_std_stable(generator):
    """Compute mean & std over a generator of batches in a stable way using stable_next."""
    count = 0
    mean = None
    M2 = None  # somme des (x - mean)^2

    # On parcourt chaque epoch pour garantir stabilité
    for epoch in range(cache.total_epochs):
        batch = stable_next(generator, epoch)
        B = batch.numpy().reshape(-1, batch.shape[-1])  # flatten 2D

        if mean is None:
            mean = np.zeros(B.shape[1], dtype=np.float64)
            M2 = np.zeros(B.shape[1], dtype=np.float64)

        count_batch = B.shape[0]
        batch_mean = B.mean(axis=0)
        batch_var = B.var(axis=0)

        # Welford update
        delta = batch_mean - mean
        mean += delta * count_batch / (count + count_batch)
        M2 += batch_var * count_batch + delta**2 * count * count_batch / (count + count_batch)
        count += count_batch

    std = np.sqrt(M2 / count)
    return mean, std


def is_custom_generator(x):
    return isinstance(x, Generator)


def to_numpy_batch(x):
    if isinstance(x, tf.Tensor):
        return x.numpy()
    return np.array(x)


def apply_scaling(method: str, reference_gen, features_gen):
    """Scaling stable avec support tensor / generator."""

    # --- 0) Identification ---
    ref_is_gen = is_custom_generator(reference_gen)
    feat_is_gen = is_custom_generator(features_gen)

    # --- 1) Obtenir ID stable pour cache ---
    if ref_is_gen:
        ref_id = reference_gen.id
    else:
        ref_id = f"tensor-{id(reference_gen)}"

    # --- 2) Récupérer OU recalculer mean/std ---
    if ref_id not in cache.hodgepodge["mean_std"]:

        # Lire un batch SANS consommer la totalité du generator
        if ref_is_gen:
            ref_batch = stable_next(reference_gen, cache.current_epoch)
            ref_np = to_numpy_batch(ref_batch)
            ref_np = ref_np.reshape(-1, ref_np.shape[-1])
        else:
            ref_np = to_numpy_batch(reference_gen)
            ref_np = ref_np.reshape(-1, ref_np.shape[-1])

        mean = np.mean(ref_np, axis=0)
        std = np.std(ref_np, axis=0)

        cache.hodgepodge["mean_std"][ref_id] = (mean, std)

    else:
        mean, std = cache.hodgepodge["mean_std"][ref_id]

    # --- 3) Construire le scaler ---
    if method == "standardization":
        scaler = StandardScaler()
        scaler.mean_ = mean
        scaler.scale_ = std
        scaler.var_ = std ** 2

    elif method == "normalization":
        raise NotImplementedError("Normalization non implémenté.")
    else:
        raise ValueError(f"Unknown scaling method '{method}'")

    # --- 4) Charger features batch ---
    if feat_is_gen:
        feat_batch = stable_next(features_gen, cache.current_epoch)
        feat_np = to_numpy_batch(feat_batch)
        feat_np = feat_np.reshape(-1, feat_np.shape[-1])
    else:
        feat_np = to_numpy_batch(features_gen)
        feat_np = feat_np.reshape(-1, feat_np.shape[-1])

    # --- 5) Scaling ---
    scaled = scaler.transform(feat_np)
    scaled_tf = tf.constant(scaled, dtype=tf.float32)

    # --- 6) Remettre la forme originale du batch ---
    return tf.reshape(scaled_tf, tf.shape(feat_batch if feat_is_gen else features_gen))

def apply_label_encoding(method: str, reference_gen, labels_gen):
    """
    Label encoding ou one-hot stable sur un generator de batches.
    stable_next garantit que chaque epoch renvoie toujours le même batch.
    """

    # --- 1) Créer le LabelEncoder si pas encore fait ---
    if reference_gen.id not in cache.hodgepodge["label_encoder"]:
        classes_ordered = []

        for _ in range(cache.total_epochs):
            batch = stable_next(reference_gen, _)
            flat = tf.reshape(batch, [-1]).numpy().astype(str)
            for c in flat:
                if c not in classes_ordered:
                    classes_ordered.append(c)

        n_classes = len(classes_ordered)
        label_encoder = LabelEncoder()
        label_encoder.fit(classes_ordered)

        # On stocke encoder + n_classes pour tous les epochs
        cache.hodgepodge["label_encoder"][reference_gen.id] = (label_encoder, n_classes)
    else:
        label_encoder, n_classes = cache.hodgepodge["label_encoder"][reference_gen.id]

    # --- 2) Récupérer le batch de labels courant ---
    labels_batch = stable_next(labels_gen, cache.current_epoch)
    labels_flat = tf.reshape(labels_batch, [-1]).numpy().astype(str)

    # --- 3) Encodage ---
    if method == "label encoding":
        encoded = label_encoder.transform(labels_flat)
        encoded_tf = tf.reshape(tf.constant(encoded, dtype=tf.int32), tf.shape(labels_batch))
        return encoded_tf

    elif method == "one hot":
        # Transformation entière en one-hot
        integer_encoded = label_encoder.transform(labels_flat).reshape(-1, 1)
        onehot_enc = OneHotEncoder(sparse_output=False)
        onehot_enc.fit(np.arange(n_classes).reshape(-1, 1))  # stable mapping
        onehot = onehot_enc.transform(integer_encoded).astype(np.int32)

        # Reshape pour retrouver la shape originale + classes
        original_shape = tf.shape(labels_batch)
        reshaped = tf.reshape(onehot, tf.concat([original_shape[:-1], [n_classes]], axis=0))
        return tf.constant(reshaped, dtype=tf.int32)

    else:
        raise ValueError(f"Unknown label encoding method '{method}'")


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