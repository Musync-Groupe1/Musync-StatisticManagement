# Image Node.js
FROM node:20.12.1

# Crée le répertoire de l'application
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tous les fichiers de l'application
COPY . .

# Expose le port sur lequel Next.js écoute
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "run", "start"]
