import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('core/services/musicStatsService.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getCompleteStats: jest.fn()
  })),
}));

/**
 * @description
 * Tests de l’endpoint `/api/statistics/userStats`
 * - Vérifie le support GET uniquement
 * - Contrôle la présence de `userId`
 * - Gère les erreurs de connexion DB
 * - Retourne les statistiques ou les valeurs par défaut
 */
describe('/api/statistics/userStats endpoint', () => {
  let handler, connectToDatabase, MusicStatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const handlerModule = await import('pages/api/statistics/userStats.js');
    handler = handlerModule.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    MusicStatsService = (await import('core/services/musicStatsService.js')).default;
  });
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });
  it('shouldRejectNonGetMethods', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(405);
  });

  it('shouldReturn400WhenUserIdIsMissing', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'GET', query: {} });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/userId/i);
  });

  it('shouldReturn500WhenDatabaseConnectionFails', async () => {
    // GIVEN
    connectToDatabase.mockRejectedValue(new Error('DB fail'));
    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '1' } });
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });

    // WHEN / THEN
    await new Promise((resolve) => {
      res.on('end', () => {
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/erreur/i);
        resolve();
      });

      handler(req, res);
    });
  });

  it('shouldReturn404WhenNoStatsFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getCompleteStats: () => ({})
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '1' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/Aucune statistique/);
  });

  it('shouldReturn200AndFullStatsWhenFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getCompleteStats: () => ({
        music_platform: 'spotify',
        favorite_genre: 'rock',
        top_listened_artists: [{ artist_name: 'Radiohead', ranking: 1 }],
        top_listened_musics: [{ music_name: 'Creep', artist_name: 'Radiohead', ranking: 2 }]
      })
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '123' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    const json = res._getJSONData();
    expect(json.user_id).toBe(123);
    expect(json.music_platform).toBe('spotify');
    expect(json.favorite_genre).toBe('rock');
    expect(json.top_listened_artists).toHaveLength(1);
    expect(json.top_listened_musics).toHaveLength(1);
  });

  it('shouldReturn200WithNullAndEmptyDefaultsWhenSomeStatsAreMissing', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getCompleteStats: () => ({
        top_listened_musics: [{ music_name: 'Song', artist_name: 'Artist', ranking: 1 }]
      })
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '99' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    const json = res._getJSONData();
    expect(json.user_id).toBe(99);
    expect(json.music_platform).toBeNull();
    expect(json.favorite_genre).toBeNull();
    expect(json.top_listened_artists).toEqual([]);
    expect(json.top_listened_musics).toHaveLength(1);
  });

  it('shouldReturn200WithEmptyMusicsWhenFieldIsMissing', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getCompleteStats: () => ({
        music_platform: 'deezer',
        favorite_genre: 'electro',
        top_listened_artists: [{ artist_name: 'Daft Punk', ranking: 1 }]
      })
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '101' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    const json = res._getJSONData();
    expect(json.user_id).toBe(101);
    expect(json.music_platform).toBe('deezer');
    expect(json.favorite_genre).toBe('electro');
    expect(json.top_listened_artists).toHaveLength(1);
    expect(json.top_listened_musics).toEqual([]);
  });
});