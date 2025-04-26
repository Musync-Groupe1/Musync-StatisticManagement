import { EventEmitter } from 'events';
import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

// Mock dynamique de la connexion DB
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock dynamique du service
jest.unstable_mockModule('core/services/musicStatsService.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getUserTopListenedArtists: jest.fn(),
  })),
}));

/**
 * @description
 * Tests de l’endpoint `/api/statistics/top-artists`
 * - Vérifie la méthode HTTP
 * - Vérifie la présence de `userId`
 * - Gère les erreurs MongoDB
 * - Retourne les artistes les plus écoutés ou une erreur
 */
describe('/api/statistics/top-artists endpoint', () => {
  let handler;
  let connectToDatabase;
  let MusicStatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const handlerModule = await import('pages/api/statistics/top-artists.js');
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
    // GIVEN : une requête HTTP non autorisée (POST)
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    // WHEN : on appelle le handler
    await handler(req, res);

    // THEN : la requête doit être rejetée avec 405
    expect(res._getStatusCode()).toBe(405);
  });

  it('shouldReturn400WhenUserIdIsMissing', async () => {
    // GIVEN : une requête GET sans `userId`
    const req = httpMocks.createRequest({ method: 'GET', query: {} });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/userId/);
  });

  it('shouldReturn500WhenDatabaseConnectionFails', async () => {
    // GIVEN : la base de données échoue
    connectToDatabase.mockRejectedValue(new Error('fail'));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse({ eventEmitter: EventEmitter });

    // WHEN
    await new Promise((resolve) => {
      res.on('end', () => {
        // THEN
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/erreur/i);
        resolve();
      });

      handler(req, res);
    });
  });

  it('shouldReturn404WhenNoTopArtistsFound', async () => {
    // GIVEN : aucun artiste trouvé
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getUserTopListenedArtists: jest.fn().mockResolvedValue([]),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/aucun artiste/i);
  });

  it('shouldReturn200AndTopArtistsWhenFound', async () => {
    // GIVEN : des artistes trouvés pour un utilisateur
    connectToDatabase.mockResolvedValue(true);
    const topArtists = [
      { user_id: 42, artist_name: 'Billie Eilish', ranking: 1 },
      { user_id: 42, artist_name: 'Drake', ranking: 2 },
    ];
    MusicStatsService.mockImplementation(() => ({
      getUserTopListenedArtists: jest.fn().mockResolvedValue(topArtists),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.top_listened_artists).toEqual(topArtists);
  });
});