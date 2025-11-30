import tensorflow as tf
import csv
from backend.core.caches import cache
from backend.lib.generator import Generator

def stable_next(gen, epoch):
    if gen.id not in cache.next_cache:
        cache.next_cache[gen.id] = {}

    # Retourne la valeur déjà mémorisée pour cet epoch
    if epoch in cache.next_cache[gen.id]:
        return cache.next_cache[gen.id][epoch]

    try:
        print(f"-------------------------------------- GEN NEXTED: ${gen.id}")
        value = next(gen)
    except StopIteration:
        raise RuntimeError(f"Generator {gen.id} exhausted!")

    cache.next_cache[gen.id][epoch] = value
    return value

def infer_column_python_type(value):
    try:
        float(value)
        return "number"
    except:
        return "string"

def detect_csv_column_types(file_path):

    with open(file_path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        first_row = next(reader)

    print("\n=== DEBUG CSV HEADER ===")
    print(header)
    print("=== DEBUG FIRST ROW ===")
    print(first_row)
    print("========================\n")

    inferred_types = {}
    for col, value in zip(header, first_row):
        inferred_types[col] = infer_column_python_type(value)

    return header, inferred_types

def extract_unique_labels_streaming(file_path, label_cols):
    """Extraction de labels uniques sans charger le fichier, même sur 10+ Go."""

    unique = set()

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        header = f.readline().strip().split(",")

        # Indices des colonnes Label
        label_indexes = [header.index(col) for col in label_cols]

        # Parcours streamé
        for line in f:
            parts = line.rstrip("\n").split(",")
            for idx in label_indexes:
                if idx < len(parts):
                    v = parts[idx]
                    if v != "":
                        unique.add(v)

    return unique

def make_dataset_from_csv(file_path, columns_type, batch_size, shuffle=True):
    try:
        # --- Détection des colonnes CSV ---
        all_columns, inferred = detect_csv_column_types(file_path)

        column_defaults = []
        for col in all_columns:
            declared = columns_type.get(col, "Ignore")
            detected = inferred.get(col, "string")

            if declared == "Feature":
                column_defaults.append(0.0)
            elif declared == "Label":
                column_defaults.append("" if detected == "string" else 0.0)
            else:
                column_defaults.append("")

        # --- Création du dataset TF ---
        dataset = tf.data.experimental.make_csv_dataset(
            file_path,
            batch_size=batch_size,
            column_names=all_columns,
            column_defaults=column_defaults,
            num_epochs=cache.total_epochs,
            shuffle=shuffle,
            shuffle_buffer_size=10 * batch_size,
            header=True
        )

        feature_cols = [c for c, t in columns_type.items() if t == "Feature"]
        label_cols   = [c for c, t in columns_type.items() if t == "Label"]

        # Mapper chaque ligne vers (features, labels)
        dataset = dataset.map(lambda row: (
            tf.stack([row[col] for col in feature_cols], axis=1),
            tf.stack([row[col] for col in label_cols], axis=1)
        ))

        # Convertir en iterator unique
        dataset_iter = iter(dataset)

        features = []
        labels = []
        for x, y in dataset_iter:
            features.append(x)
            labels.append(y)

        # Wrapper Generator pour stable_next
        features_iter = Generator(features)
        labels_iter   = Generator(labels)

        return {
            "data": {
                "features_iter": features_iter,
                "labels_iter": labels_iter
            },
            "message": "Dataset loaded successfully",
            "status": "success"
        }

    except FileNotFoundError:
        return {
            "data": None,
            "message": f"CSV file not found: {file_path}",
            "status": "error"
        }
    except KeyError as e:
        return {
            "data": None,
            "message": f"Missing column in CSV or columns_type: {e}",
            "status": "error"
        }
    except tf.errors.OpError as e:
        return {
            "data": None,
            "message": f"TensorFlow error while creating dataset: {str(e)}",
            "status": "error"
        }
    except Exception as e:
        return {
            "data": None,
            "message": f"Unexpected error while processing CSV: {str(e)}",
            "status": "error"
        }