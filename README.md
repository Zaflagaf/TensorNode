TM2 - Lancement de l'application

Prérequis

Avant de lancer l'application, assurez-vous d'avoir les éléments suivants installés :
- Node.js et npm
- Python 3 et venv
- Flask dans l'environnement virtuel Python
- Les dépendances Node installées via `npm install` dans le dossier `client`
- Les dépendances Python installées via `pip install -r requirements.txt` dans le dossier `server`

Étapes de démarrage

L'application se compose de trois parties :
1. Un serveur Node.js (pour la gestion du WebSocket ou des communications en temps réel)
2. Un backend Flask (API)
3. Un frontend Next.js (interface utilisateur)

1. Lancer le serveur Node.js (Terminal 1)

Le serveur Node.js gère généralement la communication en temps réel via WebSocket ou autres services.

    powershell: cd "path_to_the_folder"/TM2/client
    powershell: node server.js

2. Lancer le serveur Flask (Terminal 2)

Le serveur Flask gère les requêtes API et la logique backend de l'application. Il doit être lancé depuis l’environnement virtuel Python.

    a. Activer l'environnement virtuel :
        - Sur Windows :
            powershell: venv\Scripts\activate
        - Sur Linux/macOS :
            powershell: source venv/bin/activate

    b. Naviguer vers le dossier `server` et installer les dépendances :
        powershell: cd "path_to_the_folder"/TM2/server
        powershell: pip install -r requirements.txt

    c. Lancer le serveur Flask :
        powershell: flask --app server:app run --host=0.0.0.0 --port=5000

3. Lancer le frontend Next.js (Terminal 3 ou via l'IDE)

L'interface utilisateur est développée avec Next.js et lancée via npm.

    powershell: cd "path_to_the_folder"/TM2/client
    powershell: npm run dev

Accès à l'application

Une fois ces trois serveurs en fonctionnement, l'application sera accessible aux adresses suivantes (qui seront également affichées dans le terminal) :
- Frontend Next.js : http://localhost:3000
- Backend Flask : http://localhost:5000