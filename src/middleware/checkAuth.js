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
import { getEnvVar } from '../infrastructure/utils/envUtils.js';

const KEYCLOAK_URL = getEnvVar('KEYCLOAK_AUTH_URL');

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
        jwksUri: `${KEYCLOAK_URL}/realms/Musync/protocol/openid-connect/certs`,

        /** Active le cache local des clés pour éviter les appels réseau répétés. */
        cache: true,

        /** Active la limitation de requêtes vers JWKS. */
        rateLimit: true,
    }),

    credentialsRequired: true,

    /** Algorithmes de signature autorisés. */
    algorithms: ['RS256'],
});