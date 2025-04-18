/**
 * @fileoverview Implémentation MongoDB du repository des statistiques utilisateur.
 * Étend l’interface abstraite UserStatsRepository avec une logique Mongoose.
 */

import UserStatsRepository from 'domain/repositories/UserStatsRepository.js';
import UserMusicStatistic from 'infrastructure/models/UserStats.js';
import UserStats from 'infrastructure/models/UserStats.js';

/**
 * Repository Mongo pour la gestion des statistiques musicales d’un utilisateur.
 * Permet de récupérer et de mettre à jour les données agrégées (plateforme, genre, top).
 */
export default class MongoUserStatsRepository extends UserStatsRepository {

  /**
   * Récupère les statistiques musicales complètes d’un utilisateur.
   * Inclut les artistes et musiques via `populate`.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<Object|null>} Objet contenant les statistiques ou null si absent
   */
  async findByUserId(userId) {
    return UserMusicStatistic.findOne({ user_id: userId })
      .populate('top_listened_artists')
      .populate('top_listened_musics')
      .lean();
  }

  /**
   * Met à jour les statistiques d’un utilisateur ou les crée si elles n’existent pas.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @param {Object} data - Données à enregistrer (plateforme, genre, artistes, musiques)
   * @returns {Promise<Object>} Le document mis à jour ou inséré
   *
   * @example
   * await repo.updateOrCreate(123, {
   *   favorite_genre: 'pop',
   *   music_platform: 'spotify',
   *   top_listened_artists: [...],
   *   top_listened_musics: [...]
   * });
   */
  async updateOrCreate(userId, data) {
    return UserMusicStatistic.findOneAndUpdate(
      { user_id: userId },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
  }

  /**
   * Supprime les statistiques d’un utilisateur à partir de son ID.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<number>} Nombre de documents supprimés (0 ou 1)
   */
  async deleteByUserId(userId) {
    const res = await UserStats.deleteOne({ user_id: userId });
    return res.deletedCount;
  }  
}