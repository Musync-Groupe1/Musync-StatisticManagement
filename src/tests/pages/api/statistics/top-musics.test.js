import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { jest } from '@jest/globals';

// Mock dynamique de la base de données
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

// Mock dynamique du service métier
jest.unstable_mockModule('core/services/musicStatsService.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

/**
 * @description
 * Tests de l’endpoint `/api/statistics/top-musics`
 * - Rejette les méthodes non-GET
 * - Valide les paramètres requis (`userId`)
 * - Gère les erreurs MongoDB
 * - Retourne les musiques top 3 de l'utilisateur
 */
describe('/api/statistics/top-musics endpoint', () => {
  let handler, connectToDatabase, MusicStatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const mod = await import('pages/api/statistics/top-musics.js');
    handler = mod.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    MusicStatsService = (await import('core/services/musicStatsService.js')).default;
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
    expect(res._getData()).toMatch(/userId manquant/);
  });

  it('shouldReturn500WhenDatabaseConnectionFails', async () => {
    // GIVEN
    connectToDatabase.mockRejectedValue(new Error('fail'));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse({ eventEmitter: EventEmitter });

    // WHEN
    await new Promise((resolve) => {
      res.on('end', () => {
        // THEN
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/Erreur interne/);
        resolve();
      });

      handler(req, res);
    });
  });

  it('shouldReturn404WhenNoMusicFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getUserTopListenedMusics: jest.fn().mockResolvedValue([])
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/Aucune musique trouv/);
  });

  it('shouldReturn200AndMusicsWhenFound', async () => {
    // GIVEN
    const fakeMusics = [
      { user_id: 1, music_name: 'Blinding Lights', artist_name: 'The Weeknd', ranking: 1 }
    ];
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getUserTopListenedMusics: jest.fn().mockResolvedValue(fakeMusics)
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    expect(res._getJSONData()).toEqual({ top_listened_musics: fakeMusics });
  });
});