import { jest } from '@jest/globals';

jest.unstable_mockModule('infrastructure/api/spotifyClient.js', () => {
  return {
    default: jest.fn()
  };
});

const { default: SpotifyService } = await import('core/services/spotifyService.js');
const { default: SpotifyClient } = await import('infrastructure/api/spotifyClient.js');

describe('SpotifyService - getUserStats', () => {
  /**
   * @description
   * Ce test vérifie que le service `SpotifyService` formate correctement les statistiques
   * utilisateur à partir des données retournées par le client Spotify mocké.
   *
   * GIVEN : Une implémentation mockée du client Spotify renvoyant 3 artistes et 3 musiques
   * WHEN  : Le service `getUserStats` est appelé
   * THEN  : Il retourne le genre favori (le plus fréquent), les 3 artistes les plus écoutés, et les 3 musiques formatées
   */
  it('shouldFormatStatsCorrectlyBasedOnMockedClient', async () => {
    // GIVEN : setup des données simulées
    const mockArtists = [
      { name: 'Drake', genres: ['hip-hop', 'rap'] },
      { name: 'Adele', genres: ['pop'] },
      { name: 'Rihanna', genres: ['pop', 'rnb'] }
    ];

    const mockTracks = [
      { name: 'Track 1', artists: [{ name: 'Drake' }] },
      { name: 'Track 2', artists: [{ name: 'Rihanna' }] },
      { name: 'Track 3', artists: [{ name: 'Adele' }] }
    ];

    // Configure le client Spotify mocké
    SpotifyClient.mockImplementation(() => ({
      getTopArtists: jest.fn().mockResolvedValue(mockArtists),
      getTopTracks: jest.fn().mockResolvedValue(mockTracks)
    }));

    const service = new SpotifyService('fake-token');

    // WHEN : récupération des statistiques formatées
    const stats = await service.getUserStats();

    // THEN : vérification du format des données retournées
    expect(stats.favoriteGenre).toBe('pop'); // pop apparaît 2x
    expect(stats.topArtists).toHaveLength(3);
    expect(stats.topArtists).toEqual([
      { artist_name: 'Drake', ranking: 1 },
      { artist_name: 'Adele', ranking: 2 },
      { artist_name: 'Rihanna', ranking: 3 }
    ]);
    expect(stats.topMusics).toEqual([
      { music_name: 'Track 1', artist_name: 'Drake', ranking: 1 },
      { music_name: 'Track 2', artist_name: 'Rihanna', ranking: 2 },
      { music_name: 'Track 3', artist_name: 'Adele', ranking: 3 }
    ]);
  });
});