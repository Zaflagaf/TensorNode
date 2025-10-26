from fastapi import APIRouter

from api.types.request_type import BuildModelRequest, GetModelArchitectureRequest, TrainStepRequest, Hyperparameters

from api.services.build_service import build_model_service, get_model_architecture_service
from api.services.train_service import compose_service

router = APIRouter()


@router.post('/build_model')
def build_model(data: BuildModelRequest):
    nodes = data.nodes
    edges = data.edges
    model_id = data.id

    return build_model_service(nodes, edges, model_id)


@router.post("/get_model_architecture")
def get_model_architecture(data: GetModelArchitectureRequest):
    model_id = data.id

    return get_model_architecture_service(model_id)

@router.post("/compose")
async def compose(data: TrainStepRequest):
    nodes = data.nodes
    edges = data.edges
    hyperparameters: Hyperparameters = data.hyperparameters
    metrics = data.metrics

    return await compose_service(nodes, edges, hyperparameters, metrics)




""" @router.post('/predict')
def predict(data: PredictRequest):
    model_id = data.id
    features = data.features
    model = cache.trained_models[model_id]

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
 """


"""
    TRASH

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
  
################################### FIT MODEL ###################################
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
"""