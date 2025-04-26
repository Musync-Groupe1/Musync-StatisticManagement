/**
 * @fileoverview Service métier pour la gestion des informations utilisateur.
 * Fournit des méthodes pour interagir avec les données utilisateurs de la base (ex : plateforme musicale).
 */

export default class UserService {
  /**
   * Initialise le service avec le repository utilisateur.
   *
   * @param {Object} deps - Dépendances nécessaires
   * @param {UserRepository} deps.userRepo - Repository pour les données utilisateur
   */
  constructor({ userRepo }) {
    this.userRepo = userRepo;
  }

  /**
   * Récupère la plateforme musicale utilisée par l'utilisateur.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {Promise<string|null>} - Plateforme utilisée ou `null` si non définie
   */
  async findPlatformByUserId(userId) { 
    return await this.userRepo.findPlatformByUserId(userId);
  }

  /**
   * Récupère un utilisateur complet par son ID.
   *
   * @param {string|number} userId
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return await this.userRepo.findByUserId(userId);
  }

  /**
   * Vérifie si un utilisateur existe en base.
   *
   * @param {string|number} userId - Identifiant de l'utilisateur
   * @returns {Promise<boolean>} - `true` s’il existe, sinon `false`
   */
  async exists(userId) {
    return await this.userRepo.exists(userId);
  }

  /**
   * Crée ou met à jour la plateforme musicale d’un utilisateur.
   *
   * @param {string|number} userId
   * @param {string} platform
   * @returns {Promise<Object>}
   */
  async updateOrCreate(userId, platform) {
    return await this.userRepo.updateOrCreate(userId, platform);
  }

  /**
   * Supprime un utilisateur par son ID.
   *
   * @param {string|number} userId
   * @returns {Promise<number>}
   */
  async deleteByUserId(userId) {
    return await this.userRepo.deleteByUserId(userId);
  }
}  