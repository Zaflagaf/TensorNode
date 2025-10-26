# Base Python slim
FROM python:3.11-slim

# Dossier de travail
WORKDIR /backend

# Installer les dépendances système pour compiler les packages Python
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libffi-dev \
    libssl-dev \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements
COPY requirements.txt .

# Mettre pip à jour et installer toutes les dépendances Python
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code backend
COPY . .

# Exposer le port
EXPOSE 8000

# Commande pour lancer le backend
CMD ["uvicorn", "api.main:sio_app", "--host", "0.0.0.0", "--port", "8000"]