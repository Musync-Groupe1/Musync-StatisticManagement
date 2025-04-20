/**
 * @fileoverview Représentation de l'entité "Statistiques musicales utilisateur".
 * Cette classe encapsule les données métier agrégées (plateforme, genre préféré, top musiques/artistes)
 * et s'inscrit dans une logique DDD (Domain-Driven Design).
 */

export default class UserMusicStats {

  /**
   * Crée une instance de `UserMusicStats`.
   *
   * @param {Object} params - Paramètres d'initialisation
   * @param {string|number} params.userId - Identifiant unique de l’utilisateur
   * @param {string|null} params.favoriteGenre - Genre musical favori
   * @param {Array<Object>} [params.topArtists=[]] - Liste des artistes les plus écoutés
   * @param {Array<Object>} [params.topMusics=[]] - Liste des musiques les plus écoutées
   */
  constructor({ userId, favoriteGenre, topArtists = [], topMusics = [] }) {
    this.userId = userId;
    this.favoriteGenre = favoriteGenre;
    this.topArtists = topArtists;     // Array<{ artist_name: string, ranking: number }>
    this.topMusics = topMusics;       // Array<{ music_name: string, artist_name: string, ranking: number }>
  }

  /**
   * Méthode utilitaire pour générer un objet vide pour un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {UserMusicStats} - Instance vide de l'entité
   */
  static empty(userId) {
    return new UserMusicStats({ userId, favoriteGenre: null });
  }

  /**
   * Indique si l'entité contient toutes les informations nécessaires.
   *
   * @returns {boolean} - `true` si l'objet est complet, sinon `false`
   */
  isComplete() {
    return Boolean(
      this.favoriteGenre &&
      Array.isArray(this.topArtists) &&
      Array.isArray(this.topMusics)
    );
  }
}