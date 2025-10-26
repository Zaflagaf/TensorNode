import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from keras.models import Sequential
from keras.layers import Dense


# 1. Charger les données
data = pd.DataFrame({
    "Sepal length": [5.1, 4.9, 4.7, 4.6, 5.0, 7.0, 6.4, 6.9, 5.5, 6.5, 5.8, 7.1, 6.3, 6.5],
    "Sepal width": [3.5, 3.0, 3.2, 3.1, 3.6, 3.2, 3.2, 3.1, 2.3, 2.8, 2.7, 3.0, 2.9, 3.0],
    "Petal length": [1.4, 1.4, 1.3, 1.5, 1.4, 4.7, 4.5, 4.9, 4.0, 4.6, 5.1, 5.9, 5.6, 5.8],
    "Petal width": [0.2, 0.2, 0.2, 0.2, 0.2, 1.4, 1.5, 1.5, 1.3, 1.5, 1.9, 2.1, 1.8, 2.2],
    "Species": [
        "setosa", "setosa", "setosa", "setosa", "setosa",
        "versicolor", "versicolor", "versicolor", "versicolor",
        "virginica", "virginica", "virginica", "virginica", "virginica"
    ]
})

# 2. Séparer X et y
X = data.drop("Species", axis=1).values
y = data["Species"].values

# 3. Encodage des labels
encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

# 4. Normalisation des features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 5. Split des données
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y_encoded, test_size=0.2, random_state=42
)

# 6. Définir le modèle MLP
model = Sequential([
    Dense(10, activation='relu', input_shape=(X.shape[1],)),
    Dense(10, activation='relu'),
    Dense(3, activation='softmax')  # 3 classes
])
model.summary()

# 7. Compilation du modèle
model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

# 8. Entraînement
model.fit(X_train, y_train, epochs=100, verbose=1)

# 9. Évaluation
loss, accuracy = model.evaluate(X_test, y_test)
print(f"Accuracy: {accuracy:.2f}")