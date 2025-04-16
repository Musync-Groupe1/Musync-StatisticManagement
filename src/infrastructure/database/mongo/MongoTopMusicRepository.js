/**
 * @fileoverview Repository MongoDB pour les musiques les plus écoutées.
 * Fournit une implémentation concrète de TopMusicRepository à l’aide de Mongoose.
 */

import TopMusicRepository from 'domain/repositories/TopMusicRepository.js';
import TopListenedMusic from 'infrastructure/models/TopListenedMusic.js';

/**
 * Repository Mongo pour les musiques du top 3 d’un utilisateur.
 * Permet d'interagir avec les enregistrements de musiques en base via Mongoose.
 */
export default class MongoTopMusicRepository extends TopMusicRepository {

  /**
   * Récupère toutes les musiques les plus écoutées par un utilisateur.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {Promise<Array<Object>>} Liste des musiques du top triées par classement
   */
  async findAllByUserId(userId) {
    return TopListenedMusic.find({ user_id: userId })
        .select('-_id -__v -user_id')
        .sort({ ranking: 1 })
        .lean();
  }

  /**
   * Récupère une musique selon le classement (ranking) de l'utilisateur.
   *
   * @param {string|number} userId - ID de l’utilisateur
   * @param {number} ranking - Classement de la musique (1, 2 ou 3)
   * @returns {Promise<Object|null>} La musique trouvée ou `null` si absente
   */
  async findByUserIdAndRanking(userId, ranking) {
    return TopListenedMusic.findOne({ user_id: userId, ranking }).lean();
  }

  /**
   * Met à jour ou insère une liste de musiques dans le top d’un utilisateur.
   * Utilise `findOneAndUpdate` pour garantir l’unicité par utilisateur + musique + artiste.
   *
   * @param {string|number} userId - ID de l'utilisateur
   * @param {Array<Object>} musicsArray - Liste des musiques à sauvegarder
   * @returns {Promise<Array<Object>>} Liste des musiques effectivement enregistrées
   *
   * @example
   * await repo.upsertMany(99, [
   *   { music_name: 'Bad Habits', artist_name: 'Ed Sheeran', ranking: 1 },
   *   { music_name: 'Poker Face', artist_name: 'Lady Gaga', ranking: 2 },
   * ]);
   */
  async upsertMany(userId, musicsArray) {
    return Promise.all(
      musicsArray.map(music =>
        TopListenedMusic.findOneAndUpdate(
          {
            user_id: userId,
            music_name: music.music_name,
            artist_name: music.artist_name
          },
          { user_id: userId, ...music },
          { upsert: true, new: true, runValidators: true }
        )
      )
    );
  }

  /**
   * Supprime toutes les musiques liées à un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {Promise<number>} Nombre de documents supprimés
   *
   * @example
   * const deleted = await repo.deleteAllByUserId(101);
   * if (deleted > 0) {
   *   console.log(`${deleted} musiques supprimées.`);
   * } else {
   *   console.log('Aucune musique à supprimer.');
   * }
   */
  async deleteAllByUserId(userId) {
    const res = await TopListenedMusic.deleteMany({ user_id: userId });
    return res.deletedCount;
  }  
}