import { jest } from '@jest/globals';

// Mock des dépendances utilisées par la factory
jest.unstable_mockModule('core/services/userCleanupService.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('infrastructure/database/mongo/MongoUserStatsRepository.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('infrastructure/database/mongo/MongoTopArtistRepository.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('infrastructure/database/mongo/MongoTopMusicRepository.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('infrastructure/database/mongo/MongoUserRepository.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

/**
 * @description
 * Ce test vérifie que la factory `createUserCleanupService()` instancie correctement
 * le service `UserCleanupService` avec les trois repositories Mongo correspondants.
 */
describe('createUserCleanupService (unit test)', () => {
  /**
   * GIVEN : Les modules UserCleanupService et les repositories sont mockés
   * WHEN  : On appelle la factory `createUserCleanupService`
   * THEN  : Elle doit créer une instance de `UserCleanupService` avec les bonnes dépendances injectées
   */
  it('should instantiate UserCleanupService with all three repositories', async () => {
    // GIVEN
    const UserCleanupService = (await import('core/services/userCleanupService.js')).default;
    const MongoUserStatsRepository = (await import('infrastructure/database/mongo/MongoUserStatsRepository.js')).default;
    const MongoTopArtistRepository = (await import('infrastructure/database/mongo/MongoTopArtistRepository.js')).default;
    const MongoTopMusicRepository = (await import('infrastructure/database/mongo/MongoTopMusicRepository.js')).default;
    const MongoUserRepository = (await import('infrastructure/database/mongo/MongoUserRepository.js')).default;

    const { createUserCleanupService } = await import('core/factories/userCleanupServiceFactory.js');

    // WHEN
    createUserCleanupService();

    // THEN
    expect(MongoUserStatsRepository).toHaveBeenCalled();
    expect(MongoTopArtistRepository).toHaveBeenCalled();
    expect(MongoTopMusicRepository).toHaveBeenCalled();
    expect(MongoUserRepository).toHaveBeenCalled();
    expect(UserCleanupService).toHaveBeenCalledWith({
      userStatsRepo: expect.any(Object),
      artistRepo: expect.any(Object),
      musicRepo: expect.any(Object),
      userRepo: expect.any(Object),
    });
  });
});