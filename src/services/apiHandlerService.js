import connectToDatabase from './databaseService';

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
    res.status(405).json({ error: 'Méthode non autorisée' });
    return false;
  }
  return true;
}

/**
 * Établit une connexion avec la base de données MongoDB.
 * Si la connexion échoue, renvoie une réponse d'erreur.
 *
 * @param {Object} res - Objet de la réponse HTTP.
 * @returns {boolean} - Retourne `true` si la connexion est réussie, sinon `false` avec un code d'erreur 500.
 */
export async function ensureDatabaseConnection(res) {
  try {
    await connectToDatabase();
    return true;
  } catch (error) {
    console.error("Erreur de connexion à la base de données:", error);
    res.status(500).json({ error: "Impossible de se connecter à la base de données." });
    return false;
  }
}

/**
 * Gère les erreurs internes du serveur et envoie une réponse d'erreur générique.
 * Log l'erreur dans la console pour le débogage.
 *
 * @param {Object} req - Objet de la requête HTTP.
 * @param {Object} res - Objet de la réponse HTTP.
 */
export function responseError(req, res, error) {
  console.error(`Erreur API ${req.url}:`, error);
  res.status(500).json({ error: "Erreur interne du serveur." });
}