/**
 * @fileoverview Middleware `checkAuth` pour sécuriser les routes via JWT signé par Keycloak.
 * 
 * Ce middleware utilise `express-jwt` et `jwks-rsa` pour :
 *  - Vérifier la validité d’un token d’accès JWT signé par Keycloak
 *  - Refuser l’accès (401) si le token est absent ou invalide
 * 
 * Requiert que les JWTs contiennent :
 *   - une `audience` : `Musync-client`
 *   - un `issuer` : `http://keycloak:8080/realms/Musync`
 *   - une signature RS256
 */

import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';

/**
 * Middleware d'authentification basé sur JWT pour Express.
 * 
 * Utilise la clé publique JWKS de Keycloak pour valider le token JWT du header Authorization.
 * Le token doit être au format Bearer.
 *
 * @constant {import('express').RequestHandler}
 */
export const checkAuth = expressjwt({
    secret: jwksRsa.expressJwtSecret({
        /**
         * URL exposant les clés publiques de Keycloak pour le Realm "Musync".
         * Utilisé pour valider les signatures RS256.
         */
        jwksUri: 'http://localhost:8181/realms/Musync/protocol/openid-connect/certs',

        /** Active le cache local des clés pour éviter les appels réseau répétés. */
        cache: true,

        /** Active la limitation de requêtes vers JWKS. */
        rateLimit: true,
    }),

    /**
     * Identifiant du client (audience) tel que défini dans Keycloak.
     * Le JWT doit contenir ce client ID dans le champ `aud`.
     */
    audience: 'Musync-client',

    /**
     * URL de l’émetteur (issuer) tel que défini dans la configuration du Realm Keycloak.
     * Permet de vérifier que le token provient du bon realm.
     */
    issuer: 'http://localhost:8181/realms/Musync',

    credentialsRequired: true,

    /** Algorithmes de signature autorisés. */
    algorithms: ['RS256'],
});