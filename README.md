### 📌 **MuSync - StatisticManagement**  

# 🎵 StatisticManagement API

Music Statistics API est une API REST permettant d'obtenir et de gérer les statistiques musicales des utilisateurs, comme leurs artistes et musiques les plus écoutés.  
L'API est documentée avec **Swagger**/**JSDoc** et est construite avec **Node.js, Express et MongoDB**.

## 📖 Table des matières
- [🚀 Installation et Lancement](#-installation-et-lancement)
- [📚 Documentation](#-documentation)
- [🔌 Endpoints](#-endpoints)
  - [📌 Sauvegarder les statistiques musicales d'un utilisateur](#-1-sauvegarder-les-statistiques-musicales-dun-utilisateur)
  - [📌 Récupérer le genre musical favori](#-2-récupérer-le-genre-musical-favori-dun-utilisateur)
  - [📌 Récupérer toutes les statistiques musicales sauvegardées](#-3-récupérer-les-statistiques-musicales-dun-utilisateur)
  - [📌 Récupérer un artiste des 3 artistes préférés](#-4-récupérer-un-artiste-du-top-3-écouté-par-un-utilisateur)
  - [📌 Récupérer une musique des 3 musiques préférées](#-5-récupérer-une-musique-du-top-3-écoutée-par-un-utilisateur)
  - [📌 Récupérer la liste des 3 artistes les plus écoutés](#-6-récupérer-la-liste-des-3-artistes-les-plus-écoutés)
  - [📌 Récupérer la liste des 3 musiques les plus écoutées](#-7-récupérer-la-liste-des-3-musiques-les-plus-écoutées)
  - [📌 Supprimer toutes les données d’un utilisateur](#-8-supprimer-les-données-dun-utilisateur)
- [📈 Tests](#-tests)
- [🛠 Technologies utilisées](#-technologies-utilisées)
- [💡 Auteurs](#-auteurs)

---

## 🚀 Installation et Lancement

### 1️⃣ **Cloner le projet**
```sh
git clone https://github.com/Musync-Groupe1/Musync-StatisticManagement.git
cd Musync-StatisticManagement
```

### 2️⃣ **Installer les dépendances**
```sh
npm install
npm run build
```

### 3️⃣ **Configurer les variables d’environnement**
Créer un fichier `.env` à la racine du projet et ajouter :
```
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
SPOTIFY_REDIRECT_URI=http://localhost:3000/api/statistics
MONGODB_URI=...
```

### 4️⃣ **Lancer l’API**
```sh
npm start
```
L'API sera accessible sur `http://localhost:3000`.

---

## 📚 Documentation  
L'API est entièrement documentée via Swagger.  
Après le démarrage du serveur, accédez à **Swagger UI** ici :

🔗 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

On peut aussi récupérer la **JSDoc** du micro-service avec ceci :

```sh
npm run doc
```

Un dossier `docs` sera généré, dans lequel vous aurez un fichier `index.html`, qui permettra de naviguer à travers l'API.

---

## 🔌 Endpoints

### 📌 **1. Sauvegarder les statistiques d'un utilisateur **
```http
GET /api/statistics?userId={user_id}&platform=spotify
```
#### 🔹 **Réponse**
```json
{
  "message": "Statistiques utilisateur mises à jour.",
  "top_artists_saved": 3,
  "top_musics_saved": 3
}
```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : paramètres manquants
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **2. Récupérer le genre musical favori d’un utilisateur**
```http
GET /api/statistics/favorite-genre?userId={user_id}
```
#### 🔹 **Réponse**
```json
{
  "favorite_genre": "Rock"
}
```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId` manquant  
- `404 Not Found` : Aucun genre trouvé  
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **3. Récupérer les statistiques musicales d’un utilisateur**
```http
GET /api/statistics/userStats?userId={user_id}
```
#### 🔹 **Réponse**
```json
{
  "user_id": 1,
  "favorite_genre": "Rock",
  "music_platform": "spotify",
  "top_listened_artists": [
    {
      "music_name": "Titre musique 1",
      "artist_name": "Nom artiste 1",
      "ranking": 1
    },
  ],
  "top_listened_musics": [
    {
      "music_name": "Titre musique 2",
      "artist_name": "Nom artiste 2",
      "ranking": 1
    },
  ]
}
```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId` manquant  
- `404 Not Found` : Aucune statistique trouvée  
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **4. Récupérer un artiste faisant partie du top 3 des plus écoutés par un utilisateur**
```http
GET /api/statistics/ranking/artist?userId={user_id}&ranking={1|2|3}
```
#### 🔹 **Réponse**
```json
{
  "artist_name": "Nom artiste"
}
```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId`, `ranking`, ou `ranking` manquant(s)  
- `404 Not Found` : Aucun artiste trouvé
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **5. Récupérer une musique faisant partie du top 3 des plus écoutées par un utilisateur**
```http
GET /api/statistics/ranking/music?userId={user_id}&ranking={1|2|3}
```
#### 🔹 **Réponse**
```json
{
  "music_name": "Nom musique"
}
```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId`, `ranking`, ou `ranking` manquant(s)(s)  
- `404 Not Found` : Aucune musique trouvée
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **6. Récupérer la liste des 3 artistes les plus écoutés de utilisateur**
```http
GET /api/statistics/top-artists?userId={user_id}
```
#### 🔹 **Réponse**
```json
{
  "top_listened_artists": [
    {
      "artist_name": "Nom Artiste",
      "ranking": 1
    },
    {
      "artist_name": "Deuxième Artiste",
      "ranking": 2
    },
    {
      "artist_name": "Troisième Artiste",
      "ranking": 3
    }
  ]
}

```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId` manquant  
- `404 Not Found` : Aucun artiste trouvé
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **7. Récupérer la liste des 3 musiques les plus écoutées de utilisateur**
```http
GET /api/statistics/top-musics?userId={user_id}
```
#### 🔹 **Réponse**
```json
{
  "top_listened_musics": [
    {
      "music_name": "Nom Musique",
      "artist_name": "Nom Artiste",
      "ranking": 1
    },
    {
      "music_name": "Deuxième Musique",
      "artist_name": "Deuxième Artiste",
      "ranking": 2
    },
    {
      "music_name": "Troisième Musique",
      "artist_name": "Deuxième Artiste",
      "ranking": 3
    }
  ]
}

```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId` manquant  
- `404 Not Found` : Aucune musique trouvée
- `500 Internal Server Error` : Erreur serveur  

---

### 📌 **8. Supprimer les données d'un utilisateur**
```http
GET /api/statistics/deleteUserStats?userId={user_id}
```
#### 🔹 **Réponse**
```json
{
    "message": "Toutes les données utilisateur ont été supprimées."
}

```
#### 🔹 **Codes HTTP**
- `200 OK` : Succès  
- `400 Bad Request` : `userId` manquant  
- `500 Internal Server Error` : Erreur serveur  

---

## 📈 Tests

Les tests unitaires sont implémentés avec **Jest**.
Pour exécuter tous les tests, utilisez la commande suivante :
```sh
npm run test
```

Pour exécuter un test en particulier, utilisez :
```sh
npx jest <Fichier_de_test>.js
```

Lors de l'exécution des tests, un dossier `coverage` sera généré, dans lequel vous aurez un fichier `index.html`, qui indiquera le taux de couverture des fonctions testées pour chaque classe testée.

---

## 🛠 Technologies utilisées
- **Node.js** & **Express** - Back-end et gestion des routes
- **MongoDB** & **Mongoose** - Base de données NoSQL
- **Swagger** & **JSDoc** - Documentation de l’API
- **Jest** - Tests unitaires
- **Dotenv** - Gestion des variables d’environnement

---

## 💡 Auteurs
- 👨‍💻 ***Matisse SENECHAL***
