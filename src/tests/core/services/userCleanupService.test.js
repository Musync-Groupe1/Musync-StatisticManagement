import { jest } from '@jest/globals';
import UserCleanupService from 'core/services/userCleanupService.js';

describe('UserCleanupService - deleteAllUserData', () => {
  /**
   * @description
   * Ce test vérifie que la suppression des données utilisateur se fait correctement
   * lorsque des données existent dans chaque repository (user stats, artistes, musiques).
   *
   * GIVEN : Un utilisateur avec des données existantes dans tous les repositories
   * WHEN  : Le service deleteAllUserData est appelé
   * THEN  : Il doit appeler chaque méthode de suppression et retourner les bons compteurs
   */
  it('shouldDeleteAllUserDataCorrectly', async () => {
    // GIVEN
    const mockUserStatsRepo = {
      findByUserId: jest.fn().mockResolvedValue({ user_id: 42 }),
      deleteByUserId: jest.fn().mockResolvedValue(1)
    };

    const mockArtistRepo = {
      deleteAllByUserId: jest.fn().mockResolvedValue(3)
    };

    const mockMusicRepo = {
      deleteAllByUserId: jest.fn().mockResolvedValue(2)
    };

    const mockUserRepo = {
      exists: jest.fn().mockResolvedValue(true),
      deleteByUserId: jest.fn().mockResolvedValue(1)
    };

    const service = new UserCleanupService({
      userStatsRepo: mockUserStatsRepo,
      artistRepo: mockArtistRepo,
      musicRepo: mockMusicRepo,
      userRepo: mockUserRepo
    });

    const userId = 42;

    // WHEN
    const result = await service.deleteAllUserData(userId);

    // THEN
    expect(mockUserStatsRepo.deleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockArtistRepo.deleteAllByUserId).toHaveBeenCalledWith(userId);
    expect(mockMusicRepo.deleteAllByUserId).toHaveBeenCalledWith(userId);

    expect(result).toEqual({
      user_stats_deleted: 1,
      top_artists_deleted: 3,
      top_musics_deleted: 2,
      user_deleted: 1
    });
  });

  /**
   * @description
   * Ce test vérifie que le service gère correctement le cas où aucune donnée n'est supprimée.
   *
   * GIVEN : Un utilisateur sans données (aucune donnée supprimée)
   * WHEN  : Le service deleteAllUserData est appelé
   * THEN  : Il doit retourner des compteurs de suppression à 0
   */
  it('shouldHandleZeroDeletionsGracefully', async () => {
    // GIVEN
    const mockUserStatsRepo = {
      findByUserId: jest.fn().mockResolvedValue({ user_id: 99 }),
      deleteByUserId: jest.fn().mockResolvedValue(0)
    };

    const mockArtistRepo = {
      deleteAllByUserId: jest.fn().mockResolvedValue(0)
    };

    const mockMusicRepo = {
      deleteAllByUserId: jest.fn().mockResolvedValue(0)
    };

    const mockUserRepo = {
      exists: jest.fn().mockResolvedValue(true),
      deleteByUserId: jest.fn().mockResolvedValue(0)
    };

    const service = new UserCleanupService({
      userStatsRepo: mockUserStatsRepo,
      artistRepo: mockArtistRepo,
      musicRepo: mockMusicRepo,
      userRepo: mockUserRepo
    });

    const userId = 99;

    // WHEN
    const result = await service.deleteAllUserData(userId);

    // THEN
    expect(mockUserStatsRepo.deleteByUserId).toHaveBeenCalledWith(userId);
    expect(mockArtistRepo.deleteAllByUserId).toHaveBeenCalledWith(userId);
    expect(mockMusicRepo.deleteAllByUserId).toHaveBeenCalledWith(userId);

    expect(result).toEqual({
      user_stats_deleted: 0,
      top_artists_deleted: 0,
      top_musics_deleted: 0,
      user_deleted: 0
    });
  });

  /**
   * GIVEN : Un utilisateur inexistant dans la base
   * WHEN  : Le service deleteAllUserData est appelé
   * THEN  : Il doit retourner null et ne pas appeler les méthodes de suppression
   */
  it('shouldReturnNullIfUserDoesNotExist', async () => {
    // GIVEN
    const mockUserStatsRepo = {
      findByUserId: jest.fn().mockResolvedValue(null),
      deleteByUserId: jest.fn()
    };

    const mockArtistRepo = {
      deleteAllByUserId: jest.fn()
    };

    const mockMusicRepo = {
      deleteAllByUserId: jest.fn()
    };

    const mockUserRepo = {
      exists: jest.fn().mockResolvedValue(false),
      deleteByUserId: jest.fn()
    };

    const service = new UserCleanupService({
      userStatsRepo: mockUserStatsRepo,
      artistRepo: mockArtistRepo,
      musicRepo: mockMusicRepo,
      userRepo: mockUserRepo
    });

    // WHEN
    const result = await service.deleteAllUserData(404);

    // THEN
    expect(mockUserRepo.exists).toHaveBeenCalledWith(404);
    expect(result).toBeNull();
    expect(mockUserStatsRepo.deleteByUserId).not.toHaveBeenCalled();
    expect(mockArtistRepo.deleteAllByUserId).not.toHaveBeenCalled();
    expect(mockMusicRepo.deleteAllByUserId).not.toHaveBeenCalled();
  });
});