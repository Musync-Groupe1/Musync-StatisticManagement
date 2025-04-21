/**
 * @fileoverview Script d’initialisation MongoDB exécuté au lancement du conteneur.
 * Il crée un utilisateur administrateur avec le rôle `root` pour permettre l’accès sécurisé à la base.
 */

/**
 * Récupère une référence à la base `admin` (base spéciale pour la gestion des utilisateurs MongoDB).
 * `getSiblingDB` permet de cibler une autre base de données dans un script `mongo`.
 */
db = db.getSiblingDB("admin");

/**
 * Crée un utilisateur administrateur avec :
 * - nom d'utilisateur : "root"
 * - mot de passe : "rootpassword"
 * - rôle : "root" (accès complet à toutes les bases)
 */
db.createUser({
  user: "root",
  pwd: "rootpassword",
  roles: [
    {
      role: "root", // Donne un contrôle total sur le serveur MongoDB
      db: "admin"   // Le rôle s'applique à la base "admin"
    }
  ]
});