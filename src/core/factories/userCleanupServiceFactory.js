import UserCleanupService from 'core/services/userCleanupService.js';
import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';

export function createUserCleanupService() {
  return new UserCleanupService({
    userStatsRepo: new MongoUserStatsRepository(),
    artistRepo: new MongoTopArtistRepository(),
    musicRepo: new MongoTopMusicRepository(),
  });
}