# TENSORFLOW - Lancement de l'application

Ce projet comprend trois composants :

- **Frontend** : Next.js (React)
- **Backend API** : Flask (Python)
- **Serveur Node.js** : pour la gestion WebSocket ou logique temps réel

---

## ✅ Prérequis

Avant de commencer, installe les outils suivants sur ta machine :

- [Node.js & npm](https://nodejs.org/)
- [Python 3](https://www.python.org/)
- Visual Studio Code (recommandé)
- Extension VSCode : **Python**

---

## ⚙️ Installation automatique

Toutes les dépendances peuvent être installées en une seule commande via les tâches de VSCode.

### Étapes :

1. Ouvre ce dossier dans **Visual Studio Code**
2. Appuie sur `Ctrl+Shift+P` ou `Cmd+Shift+P` sur macOS
3. Sélectionne **Tasks: Run Task**
4. Choisis la tâche **`Install All`**

Cela :

- Installe les dépendances Node.js (dans le dossier `client`)
- Installe les dépendances Python (dans le dossier `server`, avec l’environnement virtuel `.venv` à la racine du projet)

---

## 🚀 Démarrage automatique

1. Appuie sur `Ctrl+Shift+P` ou `Cmd+Shift+P` sur macOS
2. Choisis **Tasks: Run Task**
3. Sélectionne la tâche **`Start All`**

Cela démarre automatiquement :

- Le **serveur Flask** sur `http://localhost:5000`
- Le **serveur Node.js** sur `http://localhost:3001`
- Le **frontend React/Next.js** sur `http://localhost:3000`

---

## 📂 Structure des répertoires

TM2_code/
├── .venv/ # Environnement virtuel Python
├── client/ # Frontend React + serveur Node.js
│ ├── server.js
│ └── ...
├── server/ # Backend Flask
│ ├── server.py
│ ├── requirements.txt
│ └── ...
├── .vscode/
│ └── tasks.json # Tâches de démarrage/installation
└── README.md

---

## 🧠 Astuce

Si ton terminal intégré ne lance pas la bonne version de Python, assure-toi que l'interpréteur sélectionné dans VSCode (`Ctrl+Shift+P > Python: Select Interpreter`) pointe vers :

- `<chemin_du_projet>/.venv/bin/python` (macOS/Linux)
- `<chemin_du_projet>/.venv\Scripts\python.exe` (Windows)

---

## 🛠️ Tâches disponibles

| Tâche                | Description                          |
| -------------------- | ------------------------------------ |
| `Install All`        | Installe toutes les dépendances      |
| `Start All`          | Lance tous les serveurs              |
| `Start Flask Server` | Lance uniquement le backend Flask    |
| `Start Node Server`  | Lance uniquement le serveur Node.js  |
| `Start React Dev`    | Lance uniquement le frontend Next.js |

---

## 🧪 Accès aux services

- **Frontend (React/Next.js)** → http://localhost:3000
- **Backend API (Flask)** → http://localhost:5000
- **WebSocket/Node.js** → http://localhost:3001
