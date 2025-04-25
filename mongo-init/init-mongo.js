/**
 * @fileoverview Script d’initialisation MongoDB exécuté au lancement du conteneur.
 * Il crée un utilisateur administrateur à partir des variables d'environnement Docker.
 */

/**
 * Récupère la base spéciale "admin" pour gérer les utilisateurs MongoDB.
 */
db = db.getSiblingDB("admin");

/**
 * Crée un utilisateur administrateur en utilisant les variables
 * - `MONGO_INITDB_ROOT_USERNAME`
 * - `MONGO_INITDB_ROOT_PASSWORD`
 * injectées automatiquement par Docker lors du démarrage.
 */
db = db.getSiblingDB("admin");

db.createUser({
  user: "${DB_ROOT_USERNAME}",
  pwd: "${DB_ROOT_PASSWORD}",
  roles: [
    {
      role: "root",
      db: "admin"
    }
  ]
});