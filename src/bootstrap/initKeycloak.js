import session from 'express-session';
import Keycloak from 'keycloak-connect';

/**
 * Initialise l’instance Keycloak avec un stockage de session en mémoire,
 * configure le middleware express-session, et attache le middleware Keycloak à l'application Express.
 *
 * Cette fonction permet de sécuriser des routes avec Keycloak dans une architecture microservices.
 * Elle lit les variables d’environnement suivantes :
 * - `KEYCLOAK_REALM` : nom du realm Keycloak
 * - `KEYCLOAK_AUTH_URL` : URL du serveur d’authentification Keycloak
 * - `KEYCLOAK_CLIENT_ID` : identifiant du client Keycloak
 * - `KEYCLOAK_CLIENT_SECRET` : secret du client Keycloak
 * - `SESSION_SECRET` : clé secrète pour sécuriser les sessions express (fallback `default_secret`)
 *
 * @function initKeycloak
 * @param {import('express').Express} server - L'application Express sur laquelle attacher Keycloak
 * @returns {Keycloak.Keycloak} - L’instance Keycloak initialisée, pouvant être utilisée pour protéger des routes avec `keycloak.protect()`
 *
 */
export function initKeycloak(server) {
  const memoryStore = new session.MemoryStore();

  const keycloak = new Keycloak({ store: memoryStore }, {
    "realm": process.env.KEYCLOAK_REALM,
    "auth-server-url": process.env.KEYCLOAK_AUTH_URL,
    "ssl-required": "external",
    "resource": process.env.KEYCLOAK_CLIENT_ID,
    "confidential-port": 0
  });

  server.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
    store: memoryStore,
  }));

  server.use(keycloak.middleware());

  return keycloak;
}