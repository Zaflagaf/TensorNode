import keras as k
import numpy as np


vector = np.array([[0.1,0.5,0.2,-0.1]])

model: k.Model = k.models.load_model("test\model_Model(1).keras")
model.summary()
pred = model.predict(vector)
# Convertir en pourcentages et arrondir
pred_percent = np.round(pred * 100, 2)  # arrondi à 2 décimales
print("Predictions in percentages:", pred_percent)