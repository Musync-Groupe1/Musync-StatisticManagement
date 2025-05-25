/**
 * @fileoverview Utilitaires pour la gestion des requêtes HTTP dans l’API.
 * Fournit des fonctions de :
 *   - Validation des méthodes HTTP autorisées
 *   - Sécurisation des en-têtes HTTP
 *   - Réponse aux erreurs serveur avec un délai (anti-bruteforce)
 */

/**
 * Vérifie que la méthode HTTP utilisée est bien autorisée pour l’endpoint.
 * En cas d'erreur, une réponse 405 est envoyée.
 *
 * @function validateMethod
 * @param {Request} req - Requête HTTP entrante
 * @param {Response} res - Réponse HTTP sortante
 * @param {string[]} allowedMethods - Méthodes autorisées (ex : ['GET', 'POST'])
 * @returns {boolean} - `true` si la méthode est autorisée, sinon `false`
 */
export function validateMethod(req, res, allowedMethods = ['GET']) {
    if (!allowedMethods.includes(req.method)) {
      res.setHeader('Allow', allowedMethods.join(', '));
      res.status(405).end(`Méthode ${req.method} non autorisée`);
      return false;
    }
    return true;
}

/**
 * Applique des en-têtes HTTP de sécurité standard pour protéger l’API.
 * Ces en-têtes préviennent certains types d'attaques comme XSS ou clickjacking.
 *
 * @function setSecurityHeaders
 * @param {Response} res - Réponse HTTP sortante
 */
export function setSecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

/**
 * Envoie une erreur serveur (500) avec un délai aléatoire
 * pour atténuer les attaques par bruteforce ou timing attack.
 *
 * @function responseError
 * @param {Response} res - Objet de réponse HTTP (Express ou Node)
 * @returns {void} - Ne retourne rien directement, envoie une réponse JSON
 */
export function responseError(res) {
  const delay = Math.floor(500 + Math.random() * 1000); // Délai entre 500 et 1500ms
  setTimeout(() => {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }, delay);
}