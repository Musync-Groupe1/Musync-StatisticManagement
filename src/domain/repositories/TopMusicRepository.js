/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @fileoverview Interface abstraite pour le repository des musiques les plus écoutées.
 * Cette classe définit les opérations obligatoires pour manipuler les données des musiques
 * dans des sources de données comme MongoDB, PostgreSQL, etc.
 * À implémenter dans un adaptateur d'infrastructure (ex: MongoTopMusicRepository).
 */

export default class TopMusicRepository {

  /**
   * Récupère toutes les musiques les plus écoutées par un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<Array<Object>>} - Liste de musiques triée par classement
   * @throws {Error} - À implémenter dans une classe concrète
   */
  async findAllByUserId(userId) {
    throw new Error('TopMusicRepository.findAllByUserId() non implémenté');
  }

  /**
   * Récupère une musique spécifique selon le classement pour un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant utilisateur
   * @param {number} ranking - Classement (1 à 3)
   * @returns {Promise<Object|null>} - Musique trouvée ou `null` si aucune
   * @throws {Error} - À implémenter dans une classe concrète
   */
  async findByUserIdAndRanking(userId, ranking) {
    throw new Error('TopMusicRepository.findByUserIdAndRanking() non implémenté');
  }

  /**
   * Insère ou met à jour plusieurs musiques pour un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant utilisateur
   * @param {Array<Object>} musicsArray - Tableau de musiques (nom, artiste, ranking)
   * @returns {Promise<Array<Object>>} - Liste des musiques insérées ou mises à jour
   * @throws {Error} - À implémenter dans une classe concrète
   */
  async upsertMany(userId, musicsArray) {
    throw new Error('TopMusicRepository.upsertMany() non implémenté');
  }

  /**
   * Supprime toutes les musiques liées à un utilisateur.
   *
   * @param {string|number} userId - Identifiant de l’utilisateur
   * @returns {Promise<number>} - Nombre de musiques supprimées
   */
  async deleteAllByUserId(userId) {
    throw new Error('TopMusicRepository.deleteAllByUserId() non implémenté');
  }
}