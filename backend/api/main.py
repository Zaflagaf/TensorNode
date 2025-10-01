import os
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"

import numpy as np
from api.build_model import build_model_from_graph

from keras.callbacks import Callback
from keras.losses import mean_squared_error

from pathlib import Path
import traceback

from api.request_type import BuildModelRequest, GetModelArchitectureRequest, CompileModelRequest, FitModelRequest, PredictRequest


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio

app = FastAPI()

origins = [
    "http://localhost:3000",  # ton frontend Next.js
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

sio = socketio.AsyncServer(
    cors_allowed_origins=origins,  # liste, pas string
    async_mode="asgi"
)

sio_app = socketio.ASGIApp(sio, app)

blank_models = {}
compiled_models = {}
trained_models = {}



@sio.event
async def connect(sid, environ):
    print("Client connecté:", sid)

@sio.event
async def disconnect(sid):
    print("Client déconnecté:", sid)

# Route FastAPI classique
@app.get("/")
async def index():
    return {"msg": "FastAPI + Socket.IO"}


@app.get('/api')
def hello():
    return {"msg": "API du backend tensornode"}

################################### BUILD MODEL ###################################
@app.post('/api/build_model')
def build_model(data: BuildModelRequest):
    global blank_models

    nodes = data.nodes
    edges = data.edges
    model_id = data.id

    if not model_id:
        return {"error": "(erreur 400) => ID manquant dans la requête"}
    
    model = build_model_from_graph(nodes=nodes, edges=edges, target_model_id=model_id)
    
    model.summary()
    blank_models[model_id] = model
    return {"message": "(message 201) => Modèle généré et stocké", "id": model_id}

################################### GET MODEL ARCHITECTURE ###################################
@app.post("/api/get_model_architecture")
def get_model_architecture(data: GetModelArchitectureRequest):
    global blank_models
    model_id = data.id

    if not model_id:
        return {"error": f"(erreur 404) => Modèle avec l'ID {model_id} introuvable"}

    model_architecture = []
    model = blank_models.get(model_id)
    
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
        print(f"Couche : {layer.__class__.__name__}, Forme de sortie : {layer.output.shape}, Paramètres : {layer.count_params()}")
    
    return model_architecture

################################### COMPILE MODEL ###################################
@app.post('/api/compile_model')
def compile_model(data: CompileModelRequest):
    global blank_models, compiled_models

    model_id = data.id
    optimizer = data.optimizer
    loss = data.loss
    metrics = data.metrics


    model = blank_models.get(model_id)
    if not model:
        return {"error": f"(erreur 404) => Modèle avec l'ID {model_id} introuvable"}

    try:
        model.compile(optimizer=optimizer, loss=mean_squared_error, metrics=metrics)
        
        compiled_models[model_id] = model

    except Exception as e:
        return {"error": f"(erreur 500) => Erreur lors de la compilation/sauvegarde: {str(e)}"}

    return {
        "message": f"(message 200) => Modèle {model_id} compilé et sauvegardé avec succès",
        "optimizer": optimizer,
        "loss": loss,
        "metrics": metrics,
    }

################################### TRAIN MODEL ###################################
class ProgressCallback(Callback):
    def __init__(self, socketio):
        super().__init__()
        self.socketio = socketio  # Envoie de données via SocketIO

    def on_epoch_end(self, epoch, logs=None):
        self.progress = epoch + 1
        print(f"Progression : Epoch {self.progress}")
        # Envoie la progression de l'epoch au frontend via WebSocket
        self.socketio.emit('progress', {'epoch': self.progress})
    
    

@app.post('/api/fit_model')
def fit_model(data: FitModelRequest):
    global compiled_models, trained_models

    model_id = data.id
    features = data.features
    labels = data.labels
    epochs = data.epochs
    batch_size = data.batchSize

    model = compiled_models.get(model_id)
    print(model_id,features,labels,epochs,batch_size,model)
    if not model:
        return {"error": f"(erreur 404) => Modèle avec l'ID {model_id} introuvable"}

    if not features or not labels:
        return {"error": "(erreur 400) => Les features et labels sont nécessaires pour l'entraînement"}

    try:
        # Convertir les features et labels en arrays NumPy
        features = np.array(features)
        labels = np.array(labels)

        # Entraînement du modèle avec le callback ProgressCallback
        # progress_callback = ProgressCallback(socketio)  # Passer SocketIO au callback
        model.fit(features, labels, epochs=epochs, batch_size=batch_size, ) #callbacks=[progress_callback]

        trained_models[model_id] = model
        print("TRAINED MODELS:", trained_models)

        return {
            "message": f"(message 200) => Modèle {model_id} entraîné et sauvegardé avec succès",
            "epochs": epochs,
            "batch_size": batch_size,
        }

    except Exception as e:
        print(e)
        return {"error": f"(erreur 500) => Erreur lors de l'entraînement: {str(e)}"}

################################### PREDICT ###################################
@app.post('/api/predict')
def predict(data: PredictRequest):
    global trained_models

    model_id = data.id
    features = data.features
    model = trained_models[model_id]

    try:
        if not model_id or features is None:
            return {"error": "(erreur 400) => Missing 'id' or 'input'"}


        input_array = np.array(features)
        prediction = model.predict(input_array)

        return {
            "message": "(message 200) => Prédiction établie", 
            "prediction": prediction.tolist()
        }

    except Exception as e:
        tb = traceback.format_exc()
        print(tb)
        return {"error": "(erreur 500) => " + str(e), "traceback": tb}