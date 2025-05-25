/**
 * @fileoverview Implémentation MongoDB du repository `User`.
 * Étend l’interface abstraite `UserRepository` pour stocker la plateforme musicale utilisée.
 */

import UserRepository from 'domain/repositories/UserRepository.js';
import User from 'infrastructure/models/User.js';

/**
 * Repository Mongo pour la collection `User`.
 * Permet de créer, mettre à jour et récupérer la plateforme musicale d’un utilisateur.
 */
export default class MongoUserRepository extends UserRepository {

  /**
   * Récupère la plateforme musicale utilisée par un utilisateur.
   *
   * @param {string} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<string|null>} Nom de la plateforme ou `null` si non trouvée
   */
  async findPlatformByUserId(userId) {
    const user = await User.findOne({ user_id: userId }).lean();
    return user?.music_platform || null;
  }

  /**
   * Crée ou met à jour la plateforme musicale utilisée par un utilisateur.
   *
   * @param {string} userId - Identifiant unique de l’utilisateur
   * @param {string} platform - Plateforme musicale (spotify, soundcloud, etc.)
   * @returns {Promise<Object>} Document utilisateur sauvegardé
   */
  async updateOrCreate(userId, platform) {
    return User.findOneAndUpdate(
      { user_id: userId },
      { user_id: userId, music_platform: platform },
      { upsert: true, new: true, runValidators: true }
    );
  }

  /**
   * Supprime l’entrée utilisateur liée à la plateforme musicale.
   *
   * @param {string} userId - Identifiant unique de l’utilisateur
   * @returns {Promise<number>} Nombre de documents supprimés (0 ou 1)
   */
  async deleteByUserId(userId) {
    const res = await User.deleteOne({ user_id: userId });
    return res.deletedCount;
  }

  /**
   * Vérifie si un utilisateur existe en base.
   *
   * @param {string} userId - Identifiant unique de l'utilisateur
   * @returns {Promise<boolean>} - `true` s’il existe, sinon `false`
   */
  async exists(userId) {
    return await User.exists({ user_id: userId }).then(Boolean);
  }

  /**
   * Récupère un utilisateur complet par son ID.
   *
   * @param {string} userId
   * @returns {Promise<Object|null>}
   */
  async findByUserId(userId) {
    return User.findOne({ user_id: userId }).lean();
  }
}