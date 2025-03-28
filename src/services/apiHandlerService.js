import connectToDatabase from './databaseService';
import validator from 'validator';

/**
 * Vérifie si la méthode HTTP est autorisée.
 * Seules les requêtes GET sont acceptées.
 *
 * @param {Object} req - Objet de la requête HTTP.
 * @param {Object} res - Objet de la réponse HTTP.
 * @returns {boolean} - Retourne `true` si la méthode est autorisée, sinon `false` avec un code d'erreur 405.
 */
export function validateMethod(req, res) {
  if (req.method !== 'GET') {
    res.setHeader("Allow", "GET");
    return false;
  }
  return true;
}

/**
 * Ajoute des en-têtes de sécurité à la réponse.
 *
 * @param {Object} res - Objet de la réponse HTTP.
 */
export function setSecurityHeaders(res) {
  res.setHeader("Content-Security-Policy", "default-src 'self'");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}

/**
 * Vérifie et assainit les entrées utilisateur.
 *
 * @param {Object} input - Données d'entrée à valider.
 * @returns {boolean} - Retourne `true` si l'entrée est valide, sinon `false`.
 */
export function validateInput(input) {
  if (!input || typeof input !== 'string' || !validator.isAlphanumeric(input.replace(/\s/g, ''))) {
    return false;
  }
  return true;
}

/**
 * Établit une connexion avec la base de données MongoDB.
 * Si la connexion échoue, renvoie une réponse d'erreur.
 *
 * @returns {boolean} - Retourne `true` si la connexion est réussie, sinon `false`
 */
export async function ensureDatabaseConnection() {
  try {
    const isConnected = await connectToDatabase();
    return isConnected ? true : false;
  } catch {
    return false;
  }
}

/**
 * Gère les erreurs internes du serveur et envoie une réponse d'erreur générique.
 * Ajoute une protection contre les attaques par timing (brute-force).
 *
 * @param {Object} res - Objet de la réponse HTTP.
 */
export function responseError(res) {
  const delay = Math.floor(500 + Math.random() * 1000);
  setTimeout(() => {
    res.status(500).json({ error: "Erreur interne du serveur." });
  }, delay);
}