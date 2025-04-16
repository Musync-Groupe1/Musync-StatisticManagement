/**
 * @fileoverview Implémentation MongoDB du repository des artistes les plus écoutés.
 * Étend l’abstraction TopArtistRepository pour offrir un stockage via Mongoose.
 */

import TopArtistRepository from 'domain/repositories/TopArtistRepository.js';
import TopListenedArtist from 'infrastructure/models/TopListenedArtist.js';

/**
 * Repository Mongo pour les artistes du top 3 d’un utilisateur.
 * Permet de récupérer et d’enregistrer les artistes écoutés en base.
 */
export default class MongoTopArtistRepository extends TopArtistRepository {

  /**
   * Récupère tous les artistes les plus écoutés d’un utilisateur.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<Array<Object>>} Liste des artistes triés selon leur ranking
   */
  async findAllByUserId(userId) {
    return TopListenedArtist.find({ user_id: userId })
        .select('-_id -__v -user_id')
        .sort({ ranking: 1 })
        .lean();
  }

  /**
   * Récupère un artiste en fonction de son classement dans le top.
   *
   * @param {string|number} userId - ID de l’utilisateur
   * @param {number} ranking - Classement de l’artiste (ex : 1, 2, 3)
   * @returns {Promise<Object|null>} L’artiste correspondant ou `null` s’il n’existe pas
   */
  async findByUserIdAndRanking(userId, ranking) {
    return TopListenedArtist.findOne({ user_id: userId, ranking }).lean();
  }

  /**
   * Met à jour ou insère plusieurs artistes dans le top d’un utilisateur.
   * Chaque artiste est upserté individuellement via `findOneAndUpdate`.
   *
   * @param {string|number} userId - Identifiant utilisateur
   * @param {Array<Object>} artistsArray - Liste des artistes à insérer ou mettre à jour
   * @returns {Promise<Array<Object>>} Liste des artistes sauvegardés
   *
   * @example
   * await repo.upsertMany(42, [
   *   { artist_name: 'Drake', ranking: 1 },
   *   { artist_name: 'Kendrick Lamar', ranking: 2 },
   * ]);
   */
  async upsertMany(userId, artistsArray) {
    return Promise.all(
      artistsArray.map(artist =>
        TopListenedArtist.findOneAndUpdate(
          { user_id: userId, artist_name: artist.artist_name },
          { user_id: userId, ...artist },
          { upsert: true, new: true, runValidators: true }
        )
      )
    );
  }

  /**
   * Supprime tous les artistes associés à un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {Promise<number>} Nombre de documents supprimés
   *
   * @example
   * const deleted = await repo.deleteAllByUserId(99);
   * if (deleted > 0) {
   *   console.log(`${deleted} artistes supprimés.`);
   * } else {
   *   console.log('Aucun artiste à supprimer.');
   * }
   */
  async deleteAllByUserId(userId) {
    const res = await TopListenedArtist.deleteMany({ user_id: userId });
    return res.deletedCount;
  }
}