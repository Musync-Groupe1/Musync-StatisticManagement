import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';
import { EventEmitter } from 'events';

// Mocks dynamiques
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.unstable_mockModule('core/services/musicStatsService.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getArtistByRanking: jest.fn()
  }))
}));

describe('/api/statistics/ranking/artist - handler', () => {
  let handler;
  let connectToDatabase;
  let MusicStatsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const mod = await import('pages/api/statistics/ranking/artist.js');
    handler = mod.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    MusicStatsService = (await import('core/services/musicStatsService.js')).default;
  });
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterAll(() => {
    console.error.mockRestore();
  });
  /**
   * GIVEN une requête HTTP avec une mauvaise méthode
   * WHEN on appelle le handler
   * THEN on reçoit un code 405
   */
  it('shouldReturn405ForNonGetMethod', async () => {
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  /**
   * GIVEN une requête GET sans `userId` ou `ranking`
   * WHEN on appelle le handler
   * THEN on reçoit une erreur 400
   */
  it('shouldReturn400IfUserIdOrRankingMissing', async () => {
    const req = httpMocks.createRequest({ method: 'GET', query: {} });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/userId et\/ou ranking manquant/);
  });

  /**
   * GIVEN une requête avec base inaccessible
   * WHEN la connexion échoue
   * THEN on doit retourner une 500
   */
  it('shouldReturn500IfDbFails', async () => {
    connectToDatabase.mockRejectedValue(new Error('fail'));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '1', ranking: '1' } });
    const res = httpMocks.createResponse({ eventEmitter: EventEmitter });

    await new Promise(resolve => {
      res.on('end', () => {
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/Erreur interne/);
        resolve();
      });

      handler(req, res);
    });
  });

  /**
   * GIVEN un utilisateur sans artiste à ce rang
   * WHEN le service retourne null
   * THEN on reçoit un 404
   */
  it('shouldReturn404IfNoArtistFound', async () => {
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getArtistByRanking: jest.fn().mockResolvedValue(null)
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '1', ranking: '2' } });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/Aucun artiste trouvé/);
  });

  /**
   * GIVEN un utilisateur avec un artiste classé
   * WHEN le service retourne un artiste
   * THEN on reçoit un 200 avec `artist_name`
   */
  it('shouldReturn200AndArtistIfFound', async () => {
    connectToDatabase.mockResolvedValue(true);
    const artist = { artist_name: 'The Weeknd' };

    MusicStatsService.mockImplementation(() => ({
      getArtistByRanking: jest.fn().mockResolvedValue(artist)
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '1', ranking: '1' } });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ artist_name: 'The Weeknd' });
  });
});