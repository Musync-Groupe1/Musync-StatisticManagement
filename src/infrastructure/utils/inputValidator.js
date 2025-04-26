/**
 * @fileoverview Utilitaires de validation pour les entrées utilisateur dans le micro-service musical.
 * Fournit des fonctions pour vérifier la validité :
 *  - de l’identifiant utilisateur (entier),
 *  - du classement (1 à 3),
 *  - de la plateforme musicale (ex : Spotify),
 *  - et de la présence de statistiques musicales.
 */

import validator from 'validator';

// Liste des plateformes musicales autorisées dans le micro-service.
const ALLOWED_PLATFORMS = ['spotify'];

/**
 * Vérifie que l'identifiant utilisateur est un entier valide (sous forme string ou number).
 *
 * @function isValidUserId
 * @param {string|number} userId - Identifiant à valider
 * @returns {boolean} - `true` si c’est un entier valide, sinon `false`
 */
export function isValidUserId(userId) {
  return (
    (typeof userId === 'string' && validator.isInt(userId)) ||
    (typeof userId === 'number' && Number.isInteger(userId))
  );
}

/**
 * Vérifie que le classement (`ranking`) est bien compris entre 1 et 3.
 *
 * @function isValidRanking
 * @param {string|number} ranking - Valeur de classement à valider
 * @returns {boolean} - `true` si valide, sinon `false`
 */
export function isValidRanking(ranking) {
  const value = parseInt(ranking);
  return [1, 2, 3].includes(value);
}

/**
 * Vérifie que la plateforme musicale fournie est supportée.
 * La vérification est insensible à la casse.
 *
 * @function isValidMusicPlatform
 * @param {string} platform - Plateforme à valider
 * @returns {boolean} - `true` si supportée, sinon `false`
 */
export function isValidMusicPlatform(platform) {
  return typeof platform === 'string' && ALLOWED_PLATFORMS.includes(platform.toLowerCase());
}

/**
 * Vérifie si un objet de statistiques utilisateur est vide :
 * aucune musique ni artiste écouté.
 *
 * @function isUserStatsEmpty
 * @param {Object} stats - Objet `UserMusicStats`
 * @returns {boolean} - `true` si aucune donnée exploitable, sinon `false`
 */
export function isUserStatsEmpty(stats) {
  return !stats || (
    (!Array.isArray(stats.top_listened_artists) || stats.top_listened_artists.length === 0) &&
    (!Array.isArray(stats.top_listened_musics) || stats.top_listened_musics.length === 0)
  );
}