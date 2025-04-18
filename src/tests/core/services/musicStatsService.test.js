import { jest } from '@jest/globals';
import MusicStatsService from '../../../core/services/musicStatsService.js';

describe('MusicStatsService', () => {
  describe('getFavoriteGenre', () => {
    /**
     * GIVEN : Un utilisateur existant avec un genre préféré "rock"
     * WHEN  : Le service récupère son genre via getFavoriteGenre
     * THEN  : Il doit retourner "rock"
     */
    it('shouldReturnFavoriteGenreWhenUserExists', async () => {
      // GIVEN
      const mockUserStatsRepo = {
        findByUserId: jest.fn().mockResolvedValue({ favorite_genre: 'rock' })
      };
      const service = new MusicStatsService({ userStatsRepo: mockUserStatsRepo });

      // WHEN
      const genre = await service.getFavoriteGenre(123);

      // THEN
      expect(mockUserStatsRepo.findByUserId).toHaveBeenCalledWith(123);
      expect(genre).toBe('rock');
    });

    /**
     * GIVEN : Un utilisateur inexistant en base
     * WHEN  : Le service tente de récupérer son genre préféré
     * THEN  : Il doit retourner null
     */
    it('shouldReturnNullWhenUserDoesNotExist', async () => {
      // GIVEN
      const mockUserStatsRepo = {
        findByUserId: jest.fn().mockResolvedValue(null)
      };
      const service = new MusicStatsService({ userStatsRepo: mockUserStatsRepo });

      // WHEN
      const genre = await service.getFavoriteGenre(456);

      // THEN
      expect(mockUserStatsRepo.findByUserId).toHaveBeenCalledWith(456);
      expect(genre).toBeNull();
    });
  });

  describe('getMusicPlatform', () => {
    /**
     * GIVEN : Un utilisateur existant avec une plateforme définie ("spotify")
     * WHEN  : Le service récupère sa plateforme via getMusicPlatform
     * THEN  : Il doit retourner "spotify"
     */
    it('shouldReturnPlatformWhenExists', async () => {
      // GIVEN
      const mockUserStatsRepo = {
        findByUserId: jest.fn().mockResolvedValue({ music_platform: 'spotify' })
      };
      const service = new MusicStatsService({ userStatsRepo: mockUserStatsRepo });

      // WHEN
      const platform = await service.getMusicPlatform(789);

      // THEN
      expect(platform).toBe('spotify');
    });

    /**
     * GIVEN : Un utilisateur inexistant
     * WHEN  : Le service tente de récupérer sa plateforme
     * THEN  : Il doit retourner null
     */
    it('shouldReturnNullWhenUserNotFound', async () => {
      // GIVEN
      const mockUserStatsRepo = {
        findByUserId: jest.fn().mockResolvedValue(null)
      };
      const service = new MusicStatsService({ userStatsRepo: mockUserStatsRepo });

      // WHEN
      const platform = await service.getMusicPlatform(321);

      // THEN
      expect(platform).toBeNull();
    });
  });

  describe('getCompleteStats', () => {
    /**
     * GIVEN : Un utilisateur avec des statistiques, artistes et musiques en base
     * WHEN  : Le service appelle getCompleteStats
     * THEN  : Il doit retourner toutes les informations agrégées correctement
     */
    it('shouldReturnFullUserStats', async () => {
      // GIVEN
      const userId = 42;
      const mockUserStatsRepo = {
        findByUserId: jest.fn().mockResolvedValue({
          user_id: userId,
          favorite_genre: 'jazz',
          music_platform: 'spotify'
        })
      };
      const mockArtistRepo = {
        findAllByUserId: jest.fn().mockResolvedValue([{ artist_name: 'Adele', ranking: 1 }])
      };
      const mockMusicRepo = {
        findAllByUserId: jest.fn().mockResolvedValue([{ music_name: 'Hello', artist_name: 'Adele', ranking: 1 }])
      };

      const service = new MusicStatsService({
        userStatsRepo: mockUserStatsRepo,
        artistRepo: mockArtistRepo,
        musicRepo: mockMusicRepo
      });

      // WHEN
      const stats = await service.getCompleteStats(userId);

      // THEN
      expect(stats).toEqual({
        user_id: userId,
        favorite_genre: 'jazz',
        music_platform: 'spotify',
        top_listened_artists: [{ artist_name: 'Adele', ranking: 1 }],
        top_listened_musics: [{ music_name: 'Hello', artist_name: 'Adele', ranking: 1 }]
      });
    });
  });

  describe('getUserTopListenedArtists', () => {
    /**
     * GIVEN : Un utilisateur avec des artistes enregistrés
     * WHEN  : Le service récupère ses artistes les plus écoutés
     * THEN  : Il doit retourner la liste complète depuis le repo
     */
    it('shouldReturnTopArtists', async () => {
      // GIVEN
      const mockArtistRepo = {
        findAllByUserId: jest.fn().mockResolvedValue([{ artist_name: 'Adele', ranking: 1 }])
      };
      const service = new MusicStatsService({ artistRepo: mockArtistRepo });

      // WHEN
      const result = await service.getUserTopListenedArtists(101);

      // THEN
      expect(result).toHaveLength(1);
      expect(result[0].artist_name).toBe('Adele');
    });

    /**
     * GIVEN : Le service est instancié sans artistRepo
     * WHEN  : On appelle getUserTopListenedArtists
     * THEN  : Il doit lever une exception explicite
     */
    it('shouldThrowIfRepoNotInitialized', async () => {
      // GIVEN
      const service = new MusicStatsService({});

      // WHEN / THEN
      await expect(service.getUserTopListenedArtists(101)).rejects.toThrow(
        'artistRepo non initialisé dans MusicStatsService'
      );
    });
  });

  describe('getUserTopListenedMusics', () => {
    /**
     * GIVEN : Un utilisateur avec des musiques enregistrées
     * WHEN  : Le service récupère ses musiques les plus écoutées
     * THEN  : Il doit retourner la liste complète depuis le repo
     */
    it('shouldReturnTopMusics', async () => {
      // GIVEN
      const mockMusicRepo = {
        findAllByUserId: jest.fn().mockResolvedValue([{ music_name: 'Hello', ranking: 1 }])
      };
      const service = new MusicStatsService({ musicRepo: mockMusicRepo });

      // WHEN
      const result = await service.getUserTopListenedMusics(102);

      // THEN
      expect(result).toHaveLength(1);
      expect(result[0].music_name).toBe('Hello');
    });

    /**
     * GIVEN : Le service est instancié sans musicRepo
     * WHEN  : On appelle getUserTopListenedMusics
     * THEN  : Il doit lever une exception explicite
     */
    it('shouldThrowIfRepoNotInitialized', async () => {
      // GIVEN
      const service = new MusicStatsService({});

      // WHEN / THEN
      await expect(service.getUserTopListenedMusics(102)).rejects.toThrow(
        'musicRepo non initialisé dans MusicStatsService'
      );
    });
  });

  describe('getArtistByRanking', () => {
    /**
     * GIVEN : Un utilisateur avec un artiste rangé numéro 1
     * WHEN  : Le service appelle getArtistByRanking(1)
     * THEN  : Il doit retourner cet artiste avec son nom
     */
    it('shouldReturnArtistForRanking', async () => {
      // GIVEN
      const mockArtistRepo = {
        findByUserIdAndRanking: jest.fn().mockResolvedValue({ artist_name: 'Drake', ranking: 1 })
      };
      const service = new MusicStatsService({ artistRepo: mockArtistRepo });

      // WHEN
      const result = await service.getArtistByRanking(123, 1);

      // THEN
      expect(mockArtistRepo.findByUserIdAndRanking).toHaveBeenCalledWith(123, 1);
      expect(result.artist_name).toBe('Drake');
    });
  });

  describe('getMusicByRanking', () => {
    /**
     * GIVEN : Un utilisateur avec une musique rangée numéro 2
     * WHEN  : Le service appelle getMusicByRanking(2)
     * THEN  : Il doit retourner cette musique avec son nom
     */
    it('shouldReturnMusicForRanking', async () => {
      // GIVEN
      const mockMusicRepo = {
        findByUserIdAndRanking: jest.fn().mockResolvedValue({ music_name: 'Track 1', ranking: 1 })
      };
      const service = new MusicStatsService({ musicRepo: mockMusicRepo });

      // WHEN
      const result = await service.getMusicByRanking(123, 2);

      // THEN
      expect(mockMusicRepo.findByUserIdAndRanking).toHaveBeenCalledWith(123, 2);
      expect(result.music_name).toBe('Track 1');
    });
  });
});