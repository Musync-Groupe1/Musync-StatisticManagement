/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @fileoverview Interface abstraite pour le repository des statistiques utilisateur.
 * Sert à interagir avec la source de vérité (MongoDB, PostgreSQL, etc.) concernant
 * les données de haut niveau d’un utilisateur : genre préféré, plateforme, etc.
 * À implémenter dans un adaptateur comme MongoUserStatsRepository.
 */

export default class UserStatsRepository {

  /**
   * Récupère les statistiques musicales générales d’un utilisateur.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<Object|null>} - Données utilisateur ou `null` si non trouvé
   * @throws {Error} - Doit être implémenté dans une classe concrète
   */
  async findByUserId(userId) {
    throw new Error('UserStatsRepository.findByUserId() non implémenté');
  }

  /**
   * Met à jour ou crée les statistiques musicales de l’utilisateur.
   *
   * @param {string|number} userId - Identifiant utilisateur
   * @param {Object} data - Données à stocker (favorite_genre, music_platform, etc.)
   * @returns {Promise<Object>} - Statistiques mises à jour ou créées
   * @throws {Error} - Doit être implémenté dans une classe concrète
   */
  async updateOrCreate(userId, data) {
    throw new Error('UserStatsRepository.updateOrCreate() non implémenté');
  }

  /**
   * Supprime les statistiques utilisateur (plateforme, genre, etc.).
   *
   * @param {string|number} userId - Identifiant utilisateur
   * @returns {Promise<number>} - 1 si supprimé, 0 sinon
   */
  async deleteByUserId(userId) {
    throw new Error('UserStatsRepository.deleteByUserId() non implémenté');
  }
}