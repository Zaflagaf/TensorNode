import pandas as pd
import numpy as np
import keras as k
import keras.layers as layers
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

# 1. Charger le dataset Excel
df = pd.read_excel("FirstDatasetTM.xlsx")

# 2. Supposons que les colonnes sont nommées et que les features sont dans certaines colonnes,
#    et la colonne cible (label) s'appelle par exemple "target"

# Exemple, tu adaptes selon ton fichier Excel :
features = df.drop(columns=['Species']).values  # toutes colonnes sauf target comme features
labels = df['Species'].values  # colonne cible
encoder = LabelEncoder()
labels = encoder.fit_transform(labels)

# 3. Prétraitement des données
scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)

# 4. Diviser en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, labels, test_size=0.2, random_state=42)

# 5. Construire le modèle
input_layer = layers.Input(shape=(X_train.shape[1],))
x = layers.Dense(64, activation="relu")(input_layer)
x = layers.Dense(32, activation="relu")(x)
output_layer = layers.Dense(units=1)(x)
model = k.models.Model(inputs=input_layer, outputs=output_layer)
model.summary()
# 6. Compiler
model.compile(optimizer='adam', loss='mse', metrics=['mae'])

# 7. Entraîner
model.fit(X_train, y_train, epochs=100, batch_size=48, validation_split=0.2)

# 8. Évaluer
loss, mae = model.evaluate(X_test, y_test)
print(f"Test Loss: {loss}, Test MAE: {mae}")
input_raw = np.array([[5.10, 3.50, 1.40, 0.20]])
input_raw = np.array([[7.00, 3.20, 4.70, 1.40]])
input_scaled = scaler.transform(input_raw)

# Prédiction (float)
pred_float = model.predict(input_scaled)

# Arrondir la prédiction pour obtenir un label entier
pred_label = np.round(pred_float).astype(int).flatten()

# Décoder en nom d'espèce
decoded_species = encoder.inverse_transform(pred_label)

print(f"Prédiction numérique : {pred_float}")
print(f"Label arrondi : {pred_label}")
print(f"Espèce prédite : {decoded_species}")