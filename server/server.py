from flask import Flask, jsonify, request, Response
import numpy as np
from flask_cors import CORS
from build_model import build_model_from_graph
import keras as k
from keras.api.callbacks import Callback
from sklearn.preprocessing import LabelEncoder, StandardScaler
import json
import os
from flask_socketio import SocketIO, emit
#flask --app server:app run --host=0.0.0.0 --port=5000

app = Flask(__name__)

socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")
CORS(app, origins=["http://localhost:3000"])

models = {}

@app.route('/api/build_model', methods=['POST'])
def build_model():
    # Chargement des données initiales
    with open("C:/Users/zafir/OneDrive/TM2/client/nodes.json") as f:
        nodes = json.load(f)
    with open("C:/Users/zafir/OneDrive/TM2/client/edges.json") as f:
        edges = json.load(f)
        
    model_id = request.json.get('id')
    print(model_id)
    if not model_id:
        return jsonify({"error": "ID manquant dans la requête"}), 400
    model = build_model_from_graph(nodes=nodes, edges=edges, target_model_id=model_id)
    model.summary()
    models[model_id] = model
    return jsonify({"message": "Modèle généré et stocké", "id": model_id}), 201

@app.route('/api/get_model/<model_id>', methods=['GET'])
def get_model(model_id):
    model = models.get(model_id)
    if not model:
        return jsonify({"error": f"Modèle avec l'ID {model_id} introuvable"}), 404
    return jsonify(model)

@app.route('/api/get_model_architecture/<model_id>', methods=['GET'])
def get_model_architecture(model_id):
    print(f"Récupération de l'architecture pour le modèle ID: {model_id}")
    
    # Récupère le modèle à partir du dictionnaire "models"
    model = models.get(model_id)
    
    # Si le modèle n'est pas trouvé, on retourne une erreur
    if not model:
        return jsonify({"error": f"Modèle avec l'ID {model_id} introuvable"}), 404
    
    # Si le modèle est trouvé, on prépare l'architecture
    model_architecture = []
    
    for layer in model.layers:
        
        try:
            layer_info = {
                "layer": layer.__class__.__name__,           # Nom de la couche (e.g. Conv2D, Dense)
                "output": str(layer.output.shape),           # Forme de la sortie de la couche
                "params": layer.count_params(),              # Nombre de paramètres de la couche
            }
        except Exception as e:
            print(f"Erreur lors de l'accès aux informations de la couche {layer}: {e}")
            continue
        
        # Ajoute les informations sur la couche à la liste
        model_architecture.append(layer_info)
        print(f"Couche : {layer.__class__.__name__}, Forme de sortie : {layer.output.shape}, Paramètres : {layer.count_params()}")
    
    # Retourne l'architecture du modèle sous forme de JSON
    return jsonify(model_architecture)

@app.route('/api/compile_model', methods=['POST'])
def compile_model():
    data = request.json

    model_id = data.get("id")
    optimizer = data.get("optimizer", "adam")
    loss = data.get("loss", "mse")
    metrics = data.get("metrics", ["accuracy"])
    
    model = models.get(model_id)
    if not model:
        return jsonify({"error": f"Modèle avec l'ID {model_id} introuvable"}), 404

    try:
        print("IN 1.1")
        model.compile(optimizer=optimizer, loss=loss, metrics=metrics)
        print("IN 1.2")
        
        # Créer le dossier de sauvegarde s'il n'existe pas
        save_dir = os.path.join("saved_models", model_id)
        os.makedirs(save_dir, exist_ok=True)
        
        # Définir le chemin du fichier de sauvegarde
        save_path = os.path.join(save_dir, f"{model_id}.h5")  # Fichier .h5 pour Keras
        
        # Sauvegarder le modèle compilé
        print("IN 1.3")
        model.save(save_path)  # Sauvegarder le modèle dans un fichier .h5
        print("IN 1.4")
        print(f"Modèle {model_id} sauvegardé dans {save_path}")

    except Exception as e:
        return jsonify({"error": f"Erreur lors de la compilation/sauvegarde: {str(e)}"}), 500

    return jsonify({
        "message": f"Modèle {model_id} compilé et sauvegardé avec succès",
        "optimizer": optimizer,
        "loss": loss,
        "metrics": metrics,
        "saved_path": save_path
    }), 200

# Configuration de ProgressCallback pour envoyer des données via SocketIO
class ProgressCallback(Callback):
    def __init__(self, socketio):
        super().__init__()
        self.socketio = socketio  # Envoie de données via SocketIO

    def on_epoch_end(self, epoch, logs=None):
        self.progress = epoch + 1
        print(f"Progression : Epoch {self.progress}")
        # Envoie la progression de l'epoch au frontend via WebSocket
        self.socketio.emit('progress', {'epoch': self.progress})

@app.route('/api/train_model', methods=['POST'])
def train_model():
    data = request.json

    model_id = data.get("id")
    print("this is the model id", model_id)
    features = data.get("features")
    labels = data.get("labels")
    print("those are features: ", features)
    print("those are labels: ", labels)
    epochs = data.get("epochs", 10)
    batch_size = data.get("batch_size", 32)

    # Charger le modèle à partir du dictionnaire 'models'
    model = models.get(model_id)
    if not model:
        return jsonify({"error": f"Modèle avec l'ID {model_id} introuvable"}), 404

    if not features or not labels:
        return jsonify({"error": "Les features et labels sont nécessaires pour l'entraînement"}), 400

    # Encodage des labels et mise à l'échelle des données
    encoder = LabelEncoder()
    encoded_labels = encoder.fit_transform(labels)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(features)

    try:
        # Convertir les features et labels en arrays NumPy
        features = np.array(X_scaled)
        labels = np.array(encoded_labels)

        # Entraînement du modèle avec le callback ProgressCallback
        progress_callback = ProgressCallback(socketio)  # Passer SocketIO au callback
        model.fit(features, labels, epochs=epochs, batch_size=batch_size, callbacks=[progress_callback])

        # Sauvegarde du modèle entraîné
        save_dir = os.path.join("saved_models", model_id)
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, f"{model_id}_trained.h5")
        model.save(save_path)

        return jsonify({
            "message": f"Modèle {model_id} entraîné et sauvegardé avec succès",
            "epochs": epochs,
            "batch_size": batch_size,
            "saved_path": save_path
        }), 200

    except Exception as e:
        return jsonify({"error": f"Erreur lors de l'entraînement: {str(e)}"}), 500

# Lancer l'application Flask avec SocketIO
if __name__ == "__main__":
    socketio.run(app, debug=True, host="0.0.0.0", port=5000)
