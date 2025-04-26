/**
 * @fileoverview Service dédié à la récupération des statistiques utilisateur via l'API Spotify.
 * Ce service encapsule le client Spotify et prépare les données nécessaires pour l'application.
 */

import SpotifyClient from 'infrastructure/api/spotifyClient.js';

/**
 * Service d'intégration avec Spotify.
 * Encapsule les appels vers le SDK ou client HTTP Spotify, et transforme les données
 * dans un format compatible avec la base de données ou la logique métier.
 */
export default class SpotifyService {

  /**
   * Initialise le service avec un jeton d'accès Spotify.
   *
   * @param {string} accessToken - Jeton d'accès OAuth pour Spotify
   */
  constructor(accessToken) {
    this.client = new SpotifyClient({ accessToken });
  }

  /**
   * Récupère et construit les statistiques musicales d'un utilisateur Spotify :
   * - Genre préféré
   * - 3 artistes les plus écoutés
   * - 3 musiques les plus écoutées
   *
   * @returns {Promise<Object>} Statistiques formatées prêtes à être stockées ou renvoyées
   *
   * @example
   * {
   *   favoriteGenre: "pop",
   *   topArtists: [
   *     { artist_name: "Drake", ranking: 1 },
   *     ...
   *   ],
   *   topMusics: [
   *     { music_name: "One Dance", artist_name: "Drake", ranking: 1 },
   *     ...
   *   ]
   * }
   */
  async getUserStats() {
    const [artists, musics] = await Promise.all([
      this.client.getTopArtists(30),
      this.client.getTopTracks(3),
    ]);

    // Détermine le genre musical le plus fréquent parmi les 30 artistes
    const genres = artists.flatMap(a => a.genres);
    const genre = this._mostFrequentGenre(genres);

    // Formate les 3 artistes les plus écoutés
    const topArtists = artists.slice(0, 3).map((artist, i) => ({
      artist_name: artist.name,
      ranking: i + 1,
    }));

    // Formate les 3 musiques les plus écoutées
    const topMusics = musics.map((track, i) => ({
      music_name: track.name,
      artist_name: track.artists[0]?.name,
      ranking: i + 1,
    }));

    return { favoriteGenre: genre, topArtists, topMusics };
  }

  /**
   * Détermine le genre musical le plus fréquent dans une liste de genres.
   *
   * @private
   * @param {string[]} genres - Liste des genres musicaux des artistes
   * @returns {string} Genre le plus fréquent
   *
   * @example
   * _mostFrequentGenre(['pop', 'pop', 'hip-hop']) // => 'pop'
   */
  _mostFrequentGenre(genres) {
    const freq = genres.reduce((acc, g) => {
      acc[g] = (acc[g] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
  }
}