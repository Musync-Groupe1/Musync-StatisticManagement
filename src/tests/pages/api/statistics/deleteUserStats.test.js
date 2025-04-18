import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

// Mock dynamique de la base et de la factory
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('core/factories/userCleanupServiceFactory.js', () => ({
  __esModule: true,
  createUserCleanupService: jest.fn()
}));

/**
 * @description Tests pour l'endpoint `DELETE /api/statistics/deleteUserStats`
 * Cet endpoint permet de supprimer toutes les données statistiques liées à un utilisateur.
 */
describe('/api/statistics/deleteUserStats - DeleteUserStats handler', () => {
  let handler, connectToDatabase, createUserCleanupService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const handlerModule = await import('pages/api/statistics/deleteUserStats.js');
    handler = handlerModule.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    createUserCleanupService = (await import('core/factories/userCleanupServiceFactory.js')).createUserCleanupService;
  });

  /**
   * GIVEN une méthode HTTP autre que DELETE
   * WHEN on appelle le handler
   * THEN on doit recevoir un 405 (Method Not Allowed)
   */
  it('shouldReturn405ForNonDeleteMethods', async () => {
    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  /**
   * GIVEN une requête sans paramètre userId
   * WHEN on appelle le handler avec une méthode DELETE
   * THEN on doit recevoir une erreur 400
   */
  it('shouldReturn400WhenUserIdIsMissing', async () => {
    const req = httpMocks.createRequest({ method: 'DELETE', query: {} });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/userId/);
  });

  /**
   * GIVEN une erreur de connexion à la base de données
   * WHEN on tente une suppression
   * THEN on doit retourner une erreur 500
   */
  it('shouldReturn500WhenDatabaseConnectionFails', async () => {
    connectToDatabase.mockResolvedValue(false);

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(500);
    expect(res._getData()).toMatch(/connexion/);
  });

  /**
   * GIVEN une exception inattendue pendant l’exécution
   * WHEN on appelle le handler
   * THEN on doit retourner une erreur 500 et logger l’erreur
   */
  it('shouldReturn500AndLogErrorIfUnexpectedExceptionOccurs', async () => {
    connectToDatabase.mockResolvedValue(true);

    const error = new Error('fail');
    createUserCleanupService.mockReturnValue({
      deleteAllUserData: jest.fn(async () => { throw error; })
    });

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: '42' } });
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await new Promise((resolve) => {
      res.on('end', () => {
        // THEN
        expect(consoleSpy).toHaveBeenCalledWith('Erreur dans /api/statistics/deleteUserStats :', error);
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/Erreur interne/);
        consoleSpy.mockRestore();
        resolve();
      });

      // WHEN
      handler(req, res);
    });
  });

  /**
   * GIVEN un userId valide et une base connectée
   * WHEN le handler est invoqué
   * THEN les services de suppression doivent être appelés et retourner un succès 200
   */
  it('shouldCallCleanupServiceAndReturn200OnSuccess', async () => {
    connectToDatabase.mockResolvedValue(true);
    const deleteAllUserData = jest.fn();
    createUserCleanupService.mockReturnValue({ deleteAllUserData });

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: '42' } });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(deleteAllUserData).toHaveBeenCalledWith('42');
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toMatch(/supprimées/);
  });
});