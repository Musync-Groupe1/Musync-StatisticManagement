/**
 * @fileoverview Factory pour créer une instance de `UserCleanupService` avec des repositories MongoDB.
 * Centralise l’injection des dépendances liées à la suppression des données d’un utilisateur.
 */

import UserCleanupService from 'core/services/userCleanupService.js';
import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';
import MongoUserRepository from 'infrastructure/database/mongo/MongoUserRepository.js';

/**
 * Crée une instance du service `UserCleanupService` avec des adaptateurs MongoDB.
 *
 * @function createUserCleanupService
 * @returns {UserCleanupService} Instance prête à l’emploi du service de suppression
 */
export function createUserCleanupService() {
  return new UserCleanupService({
    userStatsRepo: new MongoUserStatsRepository(),
    artistRepo: new MongoTopArtistRepository(),
    musicRepo: new MongoTopMusicRepository(),
    userRepo: new MongoUserRepository()
  });
}