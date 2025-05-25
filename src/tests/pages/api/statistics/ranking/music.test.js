import httpMocks from 'node-mocks-http';
import { jest } from '@jest/globals';

// Mock du client MongoDB
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn(),
}));

// Mock du repository Mongo pour la musique
let mockedFindByUserIdAndRanking;
jest.unstable_mockModule('infrastructure/database/mongo/MongoTopMusicRepository.js', () => {
  mockedFindByUserIdAndRanking = jest.fn();
  return {
    __esModule: true,
    default: class {
      findByUserIdAndRanking = mockedFindByUserIdAndRanking;
    }
  };
});

describe('/api/statistics/ranking/music (integration test)', () => {
  let handler, connectToDatabaseMock;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Import dynamique des modules après mocks
    const dbModule = await import('infrastructure/database/mongooseClient.js');
    connectToDatabaseMock = dbModule.default;

    const handlerModule = await import(
      'pages/api/statistics/ranking/music.js'
    );
    handler = handlerModule.default;
  });

  /**
   * GIVEN : Une requête avec une méthode HTTP autre que GET
   * WHEN  : Le handler est invoqué
   * THEN  : Il doit répondre avec le statut 405 (méthode non autorisée)
   */
  it('shouldRejectNonGetMethods', async () => {
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  /**
   * GIVEN : Une requête GET sans paramètres requis (userId, ranking)
   * WHEN  : Le handler est exécuté
   * THEN  : Il doit retourner une erreur 400 avec un message explicite
   */
  it('shouldReturn400IfUserIdOrRankingMissing', async () => {
    const req = httpMocks.createRequest({ method: 'GET', query: {} });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(res._getData()).toMatch(/manquant/i);
  });

  /**
   * GIVEN : Une base connectée mais aucune musique trouvée en base
   * WHEN  : Le handler reçoit une requête valide
   * THEN  : Il doit retourner une 404 avec un message d’erreur
   */
  it('shouldReturn404IfNoMusicFound', async () => {
    connectToDatabaseMock.mockResolvedValue(true);
    mockedFindByUserIdAndRanking.mockResolvedValue(null);
    const req = httpMocks.createRequest({ method: 'GET', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1', ranking: '1' } });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res.statusCode).toBe(404);
    expect(res._getData()).toMatch(/aucune musique trouvée/i);
  });

  /**
   * GIVEN : Une base connectée et une musique trouvée par le repo
   * WHEN  : Le handler est invoqué avec les bons paramètres
   * THEN  : Il retourne un statut 200 et le nom de la musique
   */
  it('shouldReturn200AndMusicNameIfFound', async () => {
    connectToDatabaseMock.mockResolvedValue(true);
    mockedFindByUserIdAndRanking.mockResolvedValue({ music_name: 'Blinding Lights' });
    const req = httpMocks.createRequest({ method: 'GET', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1', ranking: '2' } });
    const res = httpMocks.createResponse();

    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({ music_name: 'Blinding Lights' });
  });

  /**
   * GIVEN : Une base connectée mais une erreur inattendue lors de la récupération
   * WHEN  : Le handler est invoqué
   * THEN  : Il log l’erreur et retourne un statut 500
   */
  it('shouldReturn500OnUnexpectedError', async () => {
    connectToDatabaseMock.mockResolvedValue(true);
    mockedFindByUserIdAndRanking.mockImplementation(() => {
      throw new Error('fail');
    });

    const req = httpMocks.createRequest({ method: 'GET', query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1', ranking: '1' } });
    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await new Promise(resolve => {
      res.on('end', resolve);
      handler(req, res);
    });

    expect(consoleSpy).toHaveBeenCalled();
    expect(res.statusCode).toBe(500);
    expect(res._getData()).toMatch(/erreur interne/i);
    consoleSpy.mockRestore();
  });

  /**
   * GIVEN : Un userId invalide (non UUID)
   * WHEN  : Le handler est exécuté
   * THEN  : Il retourne une 400 avec message explicite
   */
  it('shouldReturn400IfUserIdIsInvalid', async () => {
    const req = httpMocks.createRequest({
      method: 'GET',
      query: { userId: 'invalid-user-id', ranking: '1' }
    });
    const res = httpMocks.createResponse();

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res._getData())).toEqual({
      error: '`userId` doit être un UUID valide'
    });
  });

 /**
  * GIVEN : Un ranking invalide (hors 1 à 3)
  * WHEN  : Le handler est exécuté
  * THEN  : Il retourne une 400 avec message explicite
  */
 it('shouldReturn400IfRankingIsInvalid', async () => {
   const req = httpMocks.createRequest({
     method: 'GET',
     query: { userId: 'fd961a0f-c94c-47ca-b0d9-8592e1fb79d1', ranking: '9' }
   });
   const res = httpMocks.createResponse();

   await handler(req, res);

   expect(res.statusCode).toBe(400);
   expect(JSON.parse(res._getData())).toEqual({
     error: '`ranking` doit être un entier entre 1 et 3'
   });
 });
});