/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @fileoverview Interface abstraite du repository des artistes les plus écoutés.
 * Définit les méthodes que doivent implémenter les adaptateurs de persistence (ex: MongoDB, PostgreSQL).
 * Appliqué dans le contexte de la Clean Architecture pour découpler l’accès aux données du domaine.
 */

export default class TopArtistRepository {

  /**
   * Récupère tous les artistes les plus écoutés d’un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<Array<Object>>} - Liste d’artistes triée par ranking
   * @throws {Error} - Doit être implémenté dans une classe concrète
   */
  async findAllByUserId(userId) {
    throw new Error('TopArtistRepository.findAllByUserId() non implémenté');
  }

  /**
   * Récupère un artiste spécifique en fonction de son classement pour un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant de l’utilisateur
   * @param {number} ranking - Position de classement de l’artiste (1 à 3)
   * @returns {Promise<Object|null>} - Artiste trouvé ou `null`
   * @throws {Error} - Doit être implémenté dans une classe concrète
   */
  async findByUserIdAndRanking(userId, ranking) {
    throw new Error('TopArtistRepository.findByUserIdAndRanking() non implémenté');
  }

  /**
   * Insère ou met à jour plusieurs artistes pour un utilisateur donné.
   *
   * @param {string|number} userId - Identifiant utilisateur
   * @param {Array<Object>} artistsArray - Tableau d’artistes à insérer ou mettre à jour
   * @returns {Promise<Array<Object>>} - Liste des artistes persistés
   * @throws {Error} - Doit être implémenté dans une classe concrète
   */
  async upsertMany(userId, artistsArray) {
    throw new Error('TopArtistRepository.upsertMany() non implémenté');
  }

  /**
   * Supprime tous les artistes liés à un utilisateur.
   *
   * @param {string|number} userId - Identifiant de l’utilisateur
   * @returns {Promise<number>} - Nombre d’artistes supprimés
   */
  async deleteAllByUserId(userId) {
    throw new Error('TopArtistRepository.deleteAllByUserId() non implémenté');
  }
}