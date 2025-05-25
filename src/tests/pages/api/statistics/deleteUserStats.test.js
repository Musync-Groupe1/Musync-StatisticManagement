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

jest.unstable_mockModule('core/events/producers/StatDeletedProducer.js', () => ({
  __esModule: true,
  publishStatDeleted: jest.fn()
}));

/**
 * @description Tests pour l'endpoint `DELETE /api/statistics/deleteUserStats`
 * Cet endpoint permet de supprimer toutes les données statistiques liées à un utilisateur.
 */
describe('/api/statistics/deleteUserStats - DeleteUserStats handler', () => {
  let handler, connectToDatabase, createUserCleanupService, publishStatDeleted;

  beforeEach(async () => {
    jest.clearAllMocks();

    const handlerModule = await import('pages/api/statistics/deleteUserStats.js');
    handler = handlerModule.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    createUserCleanupService = (await import('core/factories/userCleanupServiceFactory.js')).createUserCleanupService;
    publishStatDeleted = (await import('core/events/producers/StatDeletedProducer.js')).publishStatDeleted;
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

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1' } });
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

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1' } });
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await new Promise((resolve) => {
      res.on('end', () => {
        expect(consoleSpy).toHaveBeenCalledWith('Erreur dans /api/statistics/deleteUserStats :', error);
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/Erreur interne/);
        consoleSpy.mockRestore();
        resolve();
      });

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

    const deleteAllUserData = jest.fn().mockResolvedValue({
      user_stats_deleted: 1,
      top_artists_deleted: 3,
      top_musics_deleted: 3
    });

    createUserCleanupService.mockReturnValue({ deleteAllUserData });
    publishStatDeleted.mockResolvedValue();

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1' } });
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });

    await new Promise((resolve) => {
      res.on('end', () => {
        expect(deleteAllUserData).toHaveBeenCalledWith('fd961a0f-c94c-47ca-b0d9-8592e1fb79d1');
        expect(publishStatDeleted).toHaveBeenCalledWith('fd961a0f-c94c-47ca-b0d9-8592e1fb79d1');
        expect(res._getStatusCode()).toBe(200);
        expect(res._getData()).toMatch(/supprimées/);
        resolve();
      });

      handler(req, res);
    });
  });

  it('shouldReturn404IfUserDoesNotExist', async () => {
    connectToDatabase.mockResolvedValue(true);

    const deleteAllUserData = jest.fn().mockResolvedValue(null);
    createUserCleanupService.mockReturnValue({ deleteAllUserData });

    const req = httpMocks.createRequest({ method: 'DELETE', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1' } });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toMatch(/Aucune statistique trouvée/);
    expect(publishStatDeleted).not.toHaveBeenCalled();
  });

  /**
   * GIVEN une exception dans le bloc try du handler global
   * WHEN une erreur est levée (ex: `createUserCleanupService` est null)
   * THEN on doit logguer l’erreur et retourner une 500
   */
  it('shouldReturn500AndLogIfHandlerThrowsAtTopLevel', async () => {
    // GIVEN : simulate une erreur en injectant une fonction `createUserCleanupService` non définie
    connectToDatabase.mockImplementation(() => { throw new Error('Top-level failure'); });
  
    const req = httpMocks.createRequest({
      method: 'DELETE',
      query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1' }
    });
  
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // WHEN / THEN
    await new Promise((resolve) => {
      res.on('end', () => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Erreur dans /api/statistics/deleteUserStats :',
          expect.any(Error)
        );
        expect(res._getStatusCode()).toBe(500);
        expect(res._getData()).toMatch(/Erreur interne/);
        consoleSpy.mockRestore();
        resolve();
      });
  
      handler(req, res);
    });
  });
});