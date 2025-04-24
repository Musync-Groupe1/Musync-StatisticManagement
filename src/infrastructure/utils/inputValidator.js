import validator from 'validator';

/**
 * Vérifie qu'une chaîne est alphanumérique (espaces autorisés)
 * @param {string} input
 * @returns {boolean}
 */
export function validateInput(input) {
  return typeof input === 'string' && validator.isAlphanumeric(input.replace(/\s/g, ''));
}