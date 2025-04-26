import { jest } from '@jest/globals';

// Mocks des méthodes des modules externes
const mockGetAccessTokenFromCode = jest.fn();
const mockGetUserStats = jest.fn();

// Mock du client Spotify
jest.unstable_mockModule('infrastructure/api/spotifyClient.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getAccessTokenFromCode: mockGetAccessTokenFromCode
  }))
}));

// Mock du service Spotify
jest.unstable_mockModule('core/services/spotifyService.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getUserStats: mockGetUserStats
  }))
}));

// Import après le mock
const { default: SpotifyStrategy } = await import('core/strategies/SpotifyStrategy.js');

describe('SpotifyStrategy', () => {
  // Nettoyage des mocks avant chaque test
  beforeEach(() => {
    mockGetAccessTokenFromCode.mockReset();
    mockGetUserStats.mockReset();
  });

  /**
   * @description
   * Ce test vérifie que la méthode `init()` initialise correctement le token d'accès
   * en appelant le client Spotify avec le code OAuth.
   *
   * GIVEN : Un code OAuth valide
   * WHEN  : La méthode init() est appelée
   * THEN  : Le token doit être stocké dans l'attribut accessToken
   */
  it('shouldSetAccessTokenAfterInit', async () => {
    // GIVEN
    mockGetAccessTokenFromCode.mockResolvedValue({ accessToken: 'mock-token' });
    const strategy = new SpotifyStrategy({ code: 'abc123' });

    // WHEN
    await strategy.init();

    // THEN
    expect(mockGetAccessTokenFromCode).toHaveBeenCalledWith('abc123');
    expect(strategy.accessToken).toBe('mock-token');
  });

  /**
   * @description
   * Ce test s'assure que si `getStats()` est appelé avant `init()`,
   * une erreur est levée, indiquant que la stratégie n'a pas été initialisée.
   *
   * GIVEN : Une instance de stratégie non initialisée
   * WHEN  : La méthode getStats() est appelée
   * THEN  : Une exception doit être levée
   */
  it('shouldThrowIfGetStatsCalledBeforeInit', async () => {
    // GIVEN
    const strategy = new SpotifyStrategy({ code: 'invalid' });

    // THEN
    await expect(strategy.getStats()).rejects.toThrow('SpotifyStrategy non initialisée');
  });

  /**
   * @description
   * Ce test vérifie que `getStats()` retourne correctement les données
   * formatées par le service Spotify, après initialisation de la stratégie.
   *
   * GIVEN : Un code OAuth valide et un mock du service Spotify renvoyant des stats
   * WHEN  : La méthode getStats() est appelée après init()
   * THEN  : Les données doivent être correctement retournées et formatées
   */
  it('shouldReturnFormattedStatsAfterInit', async () => {
    // GIVEN
    mockGetAccessTokenFromCode.mockResolvedValue({ accessToken: 'valid-token' });
    mockGetUserStats.mockResolvedValue({
      favoriteGenre: 'rock',
      topArtists: [{ artist_name: 'Muse', ranking: 1 }],
      topMusics: [{ music_name: 'Uprising', artist_name: 'Muse', ranking: 1 }]
    });

    const strategy = new SpotifyStrategy({ code: 'abc123' });
    await strategy.init();

    // WHEN
    const result = await strategy.getStats();

    // THEN
    expect(mockGetUserStats).toHaveBeenCalled();
    expect(result.favoriteGenre).toBe('rock');
    expect(result.topArtists).toEqual([{ artist_name: 'Muse', ranking: 1 }]);
    expect(result.topMusics).toEqual([{ music_name: 'Uprising', artist_name: 'Muse', ranking: 1 }]);
  });
});