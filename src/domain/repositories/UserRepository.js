/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * @fileoverview Interface abstraite pour le repository `User`.
 * Gère l’association entre un utilisateur et sa plateforme musicale.
 * À implémenter via un adaptateur comme MongoUserRepository.
 */
export default class UserRepository {
  async findPlatformByUserId(userId) {
    throw new Error('UserRepository.findPlatformByUserId() non implémenté');
  }
  
  async updateOrCreate(userId, platform) {
    throw new Error('UserRepository.updateOrCreate() non implémenté');
  }
  
  async deleteByUserId(userId) {
    throw new Error('UserRepository.deleteByUserId() non implémenté');
  }

  /**
   * Vérifie si un utilisateur existe par son identifiant.
   * @param {string|number} userId - Identifiant utilisateur
   * @returns {Promise<boolean>}
   */
  async exists(userId) {
    throw new Error('UserRepository.exists() non implémenté');
  }

  async findByUserId(userId) {
    throw new Error('UserRepository.findByUserId() non implémenté');
  }
}  