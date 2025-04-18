import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

// Mocks dynamiques
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.unstable_mockModule('core/factories/userCleanupServiceFactory.js', () => ({
  __esModule: true,
  createUserCleanupService: jest.fn()
}));

/**
 * @description Tests pour l’endpoint DELETE `/api/statistics/deleteUserStats`
 * Cet endpoint supprime toutes les données statistiques liées à un utilisateur.
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
   * GIVEN a GET request (non-DELETE)
   * WHEN the handler is called
   * THEN it should return 405 Method Not Allowed
   */
  it('shouldReturn405WhenHttpMethodIsNotDelete', async () => {
    const req = httpMocks.createRequest({ method: 'GET' });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  /**
   * GIVEN a DELETE request with no userId in query
   * WHEN the handler is called
   * THEN it should return 400 Bad Request
   */
  it('shouldReturn400WhenUserIdIsMissingInQuery', async () => {
    const req = httpMocks.createRequest({ method: 'DELETE', query: {} });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toMatch(/userId/);
  });

  /**
   * GIVEN a valid DELETE request but Mongo connection fails
   * WHEN the handler is called
   * THEN it should return 500 Internal Server Error
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
   * GIVEN a valid DELETE request and a functional service
   * WHEN the handler is executed
   * THEN it should call the cleanup service and return 200 OK
   */
  it('shouldCallCleanupServiceAndReturn200WhenSuccess', async () => {
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