import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

// Mock dynamique des dépendances
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('core/services/musicStatsService.js', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      getFavoriteGenre: jest.fn(),
    })),
  };
});

describe('/api/statistics/favorite-genre - GET handler', () => {
  let handler, connectToDatabase, MusicStatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const handlerModule = await import('pages/api/statistics/favorite-genre.js');
    handler = handlerModule.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    MusicStatsService = (await import('core/services/musicStatsService.js')).default;
  });

  it('shouldReturn405ForNonGetMethods', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(405);
  });

  it('shouldReturn400WhenUserIdMissing', async () => {
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
    connectToDatabase.mockResolvedValue(false);

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toMatch(/Erreur de connexion à la base de données/);
  });

  it('shouldReturn404IfGenreNotFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getFavoriteGenre: jest.fn().mockResolvedValue(null),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '123' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/Aucun genre trouvé/);
  });

  it('shouldReturn200WithGenreIfFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getFavoriteGenre: jest.fn().mockResolvedValue('rock'),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '123' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ favorite_genre: 'rock' }));
  });

  it('shouldReturn500OnUnexpectedError', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    const error = new Error('boom');
    MusicStatsService.mockImplementation(() => ({
      getFavoriteGenre: jest.fn().mockRejectedValue(error),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '123' } });
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // WHEN
    await new Promise((resolve) => {
      res.on('end', () => {
        // THEN
        expect(spy).toHaveBeenCalledWith(error);
        expect(res._getStatusCode()).toBe(500);
        spy.mockRestore();
        resolve();
      });

      handler(req, res);
    });
  });
});