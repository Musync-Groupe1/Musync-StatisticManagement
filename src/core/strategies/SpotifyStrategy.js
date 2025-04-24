/**
 * @fileoverview Stratégie dédiée à Spotify pour l'extraction de statistiques musicales.
 * Fait partie du pattern Strategy appliqué à plusieurs services de streaming (Spotify, Deezer...).
 */

import SpotifyClient from 'infrastructure/api/spotifyClient.js';
import SpotifyService from 'core/services/spotifyService.js';

/**
 * Implémentation de la stratégie pour la plateforme Spotify.
 * Cette classe est utilisée via la factory `getPlatformStrategy(platform, code)`
 * et permet de récupérer les statistiques utilisateur formatées.
 */
export default class SpotifyStrategy {

  /**
   * Initialise la stratégie Spotify avec un code d'autorisation OAuth.
   *
   * @param {Object} options - Paramètres d'initialisation
   * @param {string} options.code - Code d'autorisation reçu après le login Spotify
   */
  constructor({ code }) {
    this.code = code;
    this.accessToken = null;
  }

  /**
   * Initialise la stratégie : échange le code d'autorisation contre un accessToken.
   * Doit être appelé **avant** `getStats()`.
   *
   * @async
   * @returns {Promise<void>}
   * @throws {Error} En cas d'échec d'obtention du token
   */
  async init() {
    const client = new SpotifyClient({});
    const tokens = await client.getAccessTokenFromCode(this.code);
    this.accessToken = tokens.accessToken;
  }

  /**
   * Récupère les statistiques de l'utilisateur depuis Spotify.
   *
   * @async
   * @returns {Promise<Object>} Statistiques utilisateur :
   *  - favoriteGenre
   *  - topArtists
   *  - topMusics
   *
   * @throws {Error} Si la stratégie n'a pas été initialisée via `init()`
   */
  async getStats() {
    if (!this.accessToken) {
      throw new Error("SpotifyStrategy non initialisée");
    }

    const service = new SpotifyService(this.accessToken);
    return await service.getUserStats();
  }
}