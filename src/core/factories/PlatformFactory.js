/**
 * @fileoverview Factory permettant de retourner la stratégie d’intégration
 * appropriée pour une plateforme musicale (Spotify, etc.)
 * 
 * Ce module suit le **Pattern Factory** : il encapsule la logique de sélection
 * de la stratégie en fonction de la plateforme passée.
 */

import SpotifyStrategy from 'core/strategies/SpotifyStrategy.js';

/**
 * Retourne une instance d'une stratégie de plateforme musicale, initialisée.
 *
 * @function getPlatformStrategy
 * @param {string} platform - Nom de la plateforme (ex: 'spotify')
 * @param {string} code - Code d'autorisation OAuth reçu du frontend
 * @returns {Promise<Object>} - Une instance initialisée de la stratégie correspondante
 *
 * @throws {Error} Si la plateforme est inconnue ou non implémentée
 *
 * @example
 * const strategy = await getPlatformStrategy('spotify', authCode);
 * const stats = await strategy.fetchUserStats();
 */
export async function getPlatformStrategy(platform, code) {
  switch (platform) {
    case 'spotify': {
      // Création de l'instance Spotify avec le code d'autorisation
      const strategy = new SpotifyStrategy({ code });

      // Initialisation (récupération token, setup client, etc.)
      await strategy.init();

      return strategy;
    }

    default:
      // Plateforme non supportée
      throw new Error(`Plateforme inconnue : ${platform}`);
  }
}