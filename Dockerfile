# Utilise Node pour le frontend
FROM node:22

# Dossier de travail
WORKDIR /app

# Copier package.json et package-lock.json / yarn.lock
COPY package*.json ./

# Installer TOUTES les dépendances (prod + dev) pour le build
RUN npm install

# Copier le code source
COPY . .

# Build Next.js
# Ajouter variable pour contourner bug SWC si nécessaire
ENV NEXT_USE_SWCRUST=false
RUN npm run build

# Supprimer devDependencies pour réduire la taille de l'image
RUN npm prune --production

# Expose le port du frontend
EXPOSE 3000

# Lancer le serveur Next.js
CMD ["npm", "start"]