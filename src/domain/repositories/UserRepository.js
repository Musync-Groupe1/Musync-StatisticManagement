/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @fileoverview Interface abstraite pour le repository `User`.
 * Gère l’association entre un utilisateur et sa plateforme musicale.
 */
export default class UserRepository {

  /**
   * Récupère la plateforme musicale associée à un utilisateur donné.
   *
   * @param {string} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<string|null>} - Nom de la plateforme (ex: 'spotify') ou `null` si non trouvé
   * @throws {Error} Méthode non implémentée
   */
  async findPlatformByUserId(userId) {
    throw new Error('UserRepository.findPlatformByUserId() non implémenté');
  }

  /**
   * Crée ou met à jour l’association entre un utilisateur et une plateforme musicale.
   *
   * @param {string} userId - Identifiant de l’utilisateur
   * @param {string} platform - Plateforme musicale (ex: 'spotify')
   * @returns {Promise<void>}
   * @throws {Error} Méthode non implémentée
   */
  async updateOrCreate(userId, platform) {
    throw new Error('UserRepository.updateOrCreate() non implémenté');
  }

  /**
   * Supprime l'utilisateur et ses données associées à partir de son identifiant.
   *
   * @param {string} userId - Identifiant utilisateur
   * @returns {Promise<void>}
   * @throws {Error} Méthode non implémentée
   */
  async deleteByUserId(userId) {
    throw new Error('UserRepository.deleteByUserId() non implémenté');
  }

  /**
   * Vérifie si un utilisateur existe par son identifiant.
   *
   * @param {string} userId - Identifiant utilisateur
   * @returns {Promise<boolean>} - `true` si l’utilisateur existe, `false` sinon
   * @throws {Error} Méthode non implémentée
   */
  async exists(userId) {
    throw new Error('UserRepository.exists() non implémenté');
  }

  /**
   * Récupère toutes les données de l’utilisateur à partir de son identifiant.
   *
   * @param {string} userId - Identifiant utilisateur
   * @returns {Promise<Object|null>} - Objet utilisateur ou `null` si non trouvé
   * @throws {Error} Méthode non implémentée
   */
  async findByUserId(userId) {
    throw new Error('UserRepository.findByUserId() non implémenté');
  }
}