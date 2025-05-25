import '../../types/repositories.d.ts';

/**
 * @fileoverview Service métier pour la gestion des statistiques musicales d’un utilisateur.
 * Centralise les appels aux différents repositories (UserStats, TopArtists, TopMusics, User),
 * permettant de maintenir une logique métier découplée de l’infrastructure.
 */

export default class MusicStatsService {

  /**
   * Initialise le service avec les dépendances nécessaires.
   *
   * @param {Object} deps - Dépendances injectées
   * @param {UserStatsRepository} deps.userStatsRepo - Repository pour les stats utilisateur
   * @param {TopArtistRepository} deps.artistRepo - Repository pour les artistes
   * @param {TopMusicRepository} deps.musicRepo - Repository pour les musiques
   * @param {UserRepository} deps.userRepo - Repository pour les utilisateurs
   */
  constructor({ userStatsRepo, artistRepo, musicRepo, userRepo }) {
    this.userStatsRepo = userStatsRepo;
    this.artistRepo = artistRepo;
    this.musicRepo = musicRepo;
    this.userRepo = userRepo;
  }

  /**
   * Récupère toutes les statistiques musicales d’un utilisateur (genre musical, top 3).
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {Promise<Object>} - Objet contenant les statistiques complètes
   */
  async getCompleteStats(userId) {
    const userStats = await this.userStatsRepo.findByUserId(userId);
    const artists = await this.artistRepo.findAllByUserId(userId);
    const musics = await this.musicRepo.findAllByUserId(userId);

    return {
      ...userStats,
      top_listened_artists: artists,
      top_listened_musics: musics,
    };
  }

  /**
   * Récupère le genre musical préféré de l'utilisateur.
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @returns {Promise<string|null>} - Genre musical préféré ou `null` si non défini
   */
  async getFavoriteGenre(userId) {
    const user = await this.userStatsRepo.findByUserId(userId);
    return user?.favorite_genre || null;
  }

  /**
   * Récupère les 3 artistes les plus écoutés par l'utilisateur.
   *
   * @param {string} userId - Identifiant unique de l'utilisateur
   * @returns {Promise<Array<Object>>} - Liste des artistes les plus écoutés triée par ranking
   */
  async getUserTopListenedArtists(userId) {
    if (!this.artistRepo) {
      throw new Error('artistRepo non initialisé dans MusicStatsService');
    }

    return await this.artistRepo.findAllByUserId(userId);
  }

  /**
   * Récupère les 3 musiques les plus écoutées par l'utilisateur.
   *
   * @param {string} userId - Identifiant unique de l'utilisateur
   * @returns {Promise<Array<Object>>} - Liste des musiques les plus écoutées triée par ranking
   */
  async getUserTopListenedMusics(userId) {
    if (!this.musicRepo) {
      throw new Error('musicRepo non initialisé dans MusicStatsService');
    }

    return await this.musicRepo.findAllByUserId(userId);
  }

  /**
   * Récupère un artiste spécifique du top 3 d’un utilisateur par son classement.
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {number} ranking - Classement de l’artiste (1, 2 ou 3)
   * @returns {Promise<Object|null>} - L'artiste trouvé ou `null` si absent
   */
  async getArtistByRanking(userId, ranking) {
    return this.artistRepo.findByUserIdAndRanking(userId, ranking);
  }

  /**
   * Récupère une musique spécifique du top 3 d’un utilisateur par son classement.
   *
   * @param {string} userId - Identifiant de l'utilisateur
   * @param {number} ranking - Classement de la musique (1, 2 ou 3)
   * @returns {Promise<Object|null>} - La musique trouvée ou `null` si absente
   */
  async getMusicByRanking(userId, ranking) {
    return this.musicRepo.findByUserIdAndRanking(userId, ranking);
  }
}