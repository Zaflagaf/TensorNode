# TENSORNODE - Lancement de l'application

Ce projet comprend deux composants principaux :

- **Frontend** : Next.js (React)  
- **Backend** : FastAPI (Python)

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- [Node.js & npm](https://nodejs.org/) (obligatoire)
- [Python 3](https://www.python.org/) (obligatoire)
- [Docker Desktop](https://www.docker.com/) (facultatif, mais recommandé pour simplifier l'installation et lancer les conteneurs)  
- [Visual Studio Code](https://code.visualstudio.com/) (recommandé)  

---

## 🔹 Cloner le projet

```bash
git clone https://github.com/Zaflagaf/TensorNode.git
cd TensorNode
````

---

## 1️⃣ Avec Docker

### Installation / Build

```bash
docker compose build
```

### Lancer les conteneurs

```bash
docker compose up -d
```

* `-d` permet de lancer les conteneurs en arrière-plan.
* Pour suivre les logs :

```bash
docker compose logs -f
```

### Arrêter les conteneurs

```bash
docker compose down
```

---

## 2️⃣ Installation manuelle (optionnel)

### Frontend

```bash
cd frontend
npm install
npm run start
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn api.main:sio_app --reload
```

---

## 🧪 Accès aux services

* **Frontend (React/Next.js)** → [http://localhost:3000](http://localhost:3000)
* **Backend (FastAPI)** → [http://localhost:8000](http://localhost:8000)

```

✅ Cette version est :  
- Organisée pour Docker et pour installation manuelle.  
- Facile à lire sur GitHub.  
- Inclut toutes les commandes importantes (`build`, `up`, `down`, logs).  

Si tu veux, je peux aussi te faire une **version encore plus “pro” avec badges Docker, Node, Python et sections raccourcies pour dev/prod**.  
Veux‑tu que je fasse ça ?