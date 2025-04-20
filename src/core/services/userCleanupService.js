/**
 * @fileoverview Service métier chargé de supprimer toutes les données liées à un utilisateur.
 */

export default class UserCleanupService {

  /**
   * Initialise le service avec les repositories nécessaires.
   *
   * @param {Object} deps - Dépendances injectées
   * @param {UserStatsRepository} deps.userStatsRepo - Repository des stats utilisateur
   * @param {TopArtistRepository} deps.artistRepo - Repository des artistes
   * @param {TopMusicRepository} deps.musicRepo - Repository des musiques
   * @param {UserRepository} deps.userRepo - Repository des utilisateurs
   */
  constructor({ userStatsRepo, artistRepo, musicRepo, userRepo }) {
    this.userStatsRepo = userStatsRepo;
    this.artistRepo = artistRepo;
    this.musicRepo = musicRepo;
    this.userRepo = userRepo;
  }

  /**
   * Supprime toutes les données d’un utilisateur si celui-ci existe.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {Promise<Object|null>} - Résumé des suppressions, ou `null` si utilisateur inexistant
   */
  async deleteAllUserData(userId) {
    const userExists = await this.userRepo.exists(userId);

    // Aucun utilisateur trouvé, pas de suppression
    if (!userExists) return null;

    // Suppression effective
    const [userStatsDeleted, artistsDeleted, musicsDeleted, userDeleted] = await Promise.all([
      this.userStatsRepo.deleteByUserId(userId),
      this.artistRepo.deleteAllByUserId(userId),
      this.musicRepo.deleteAllByUserId(userId),
      this.userRepo.deleteByUserId(userId)
    ]);

    return {
      user_stats_deleted: userStatsDeleted,
      top_artists_deleted: artistsDeleted,
      top_musics_deleted: musicsDeleted,
      user_deleted: userDeleted
    };
  }
}