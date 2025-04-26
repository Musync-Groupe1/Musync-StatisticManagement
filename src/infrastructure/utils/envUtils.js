/**
 * @fileoverview Utilitaire pour récupérer des variables d'environnement de manière sécurisée.
 * Lève une erreur explicite si une variable requise est manquante.
 */

/**
 * Récupère une variable d'environnement de manière sécurisée.
 *
 * @param {string} key - Nom de la variable d'environnement attendue.
 * @returns {string} - Valeur de la variable d'environnement.
 * @throws {Error} - Lance une erreur si la variable est manquante.
 */
export function getEnvVar(key) {
    const value = process.env[key];

    if (!value) {
      throw new Error(`La variable d'environnement "${key}" est manquante.`);
    }

    return value;
}