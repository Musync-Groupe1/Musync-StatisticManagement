/**
 * Autorise uniquement certaines méthodes HTTP
 * @param {Object} req
 * @param {Object} res
 * @param {string[]} allowedMethods
 * @returns {boolean}
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
 * Définit des en-têtes de sécurité de base
 * @param {Object} res
 */
export function setSecurityHeaders(res) {
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
}

/**
 * Gère les erreurs serveur avec retard aléatoire (anti-bruteforce)
 * @param {Object} res
 */
export function responseError(res) {
  const delay = Math.floor(500 + Math.random() * 1000);
  setTimeout(() => {
    res.status(500).json({ error: 'Erreur interne du serveur.' });
  }, delay);
}