import { EventEmitter } from 'events';
import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

// Mocks dynamiques
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('core/services/musicStatsService.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

/**
 * @description
 * Tests de l’endpoint `/api/statistics/platform`
 * - Vérifie les erreurs de méthode
 * - Valide la présence des paramètres requis
 * - Gère les cas d’échec de connexion à MongoDB
 * - Retourne la plateforme musicale attendue ou une erreur 404
 */
describe('/api/statistics/platform endpoint', () => {
  let handler;
  let connectToDatabase;
  let MusicStatsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const platformEndpointModule = await import('pages/api/statistics/platform.js');
    handler = platformEndpointModule.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    MusicStatsService = (await import('core/services/musicStatsService.js')).default;
  });

  /**
   * GIVEN : Une méthode HTTP non autorisée
   * WHEN : Le handler est appelé avec une méthode POST
   * THEN : Le serveur retourne 405
   */
  it('shouldRejectNonGetMethods', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(405);
  });

  /**
   * GIVEN : Une requête sans userId
   * WHEN : Le handler est appelé
   * THEN : Le serveur retourne 400 avec un message explicite
   */
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

  /**
   * GIVEN : Une erreur de connexion MongoDB simulée
   * WHEN : Le handler tente une requête
   * THEN : Le serveur retourne 500
   */
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
        expect(res._getData()).toMatch(/erreur/i);
        resolve();
      });

      handler(req, res);
    });
  });

  /**
   * GIVEN : Une requête avec userId valide
   * AND : Le service retourne null (pas de plateforme)
   * WHEN : Le handler est appelé
   * THEN : Le serveur retourne 404
   */
  it('shouldReturn404WhenPlatformIsNotFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getMusicPlatform: jest.fn().mockResolvedValue(null),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/Aucune plateforme trouvée/);
  });

  /**
   * GIVEN : Une requête avec userId valide
   * AND : Le service retourne une plateforme existante
   * WHEN : Le handler est exécuté
   * THEN : Le serveur retourne 200 avec la bonne réponse
   */
  it('shouldReturn200AndPlatformWhenFound', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);
    MusicStatsService.mockImplementation(() => ({
      getMusicPlatform: jest.fn().mockResolvedValue('spotify'),
    }));

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ music_platform: 'spotify' });
  });
});