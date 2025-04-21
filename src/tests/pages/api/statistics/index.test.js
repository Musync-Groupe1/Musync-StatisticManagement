import httpMocks from 'node-mocks-http';
import { EventEmitter } from 'events';
import { jest } from '@jest/globals';

// Mocks dynamiques
jest.unstable_mockModule('infrastructure/database/mongooseClient.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.unstable_mockModule('core/factories/PlatformFactory.js', () => ({
  __esModule: true,
  getPlatformStrategy: jest.fn()
}));

jest.unstable_mockModule('core/usecases/FetchUserMusicStats.js', () => ({
  __esModule: true,
  default: jest.fn()
}));

jest.unstable_mockModule('infrastructure/services/spotifyAuthService.js', () => ({
  __esModule: true,
  generateSpotifyAuthUrl: jest.fn(),
  decodeSpotifyState: jest.fn()
}));

jest.unstable_mockModule('infrastructure/database/mongo/MongoUserRepository.js', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    findByUserId: jest.fn().mockResolvedValue({
      user_id: 42,
      music_platform: 'spotify',
    }),
  })),
}));

describe('Endpoint /api/statistics - Traitement des statistiques via OAuth Spotify', () => {
  let handler, connectToDatabase, getPlatformStrategy, FetchUserMusicStats, generateSpotifyAuthUrl, decodeSpotifyState;

  beforeEach(async () => {
    jest.clearAllMocks();

    const handlerModule = await import('pages/api/statistics/index.js');
    handler = handlerModule.default;

    connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;
    getPlatformStrategy = (await import('core/factories/PlatformFactory.js')).getPlatformStrategy;
    FetchUserMusicStats = (await import('core/usecases/FetchUserMusicStats.js')).default;
    ({ generateSpotifyAuthUrl, decodeSpotifyState } = await import('infrastructure/services/spotifyAuthService.js'));
  });

  it('shouldRejectRequestWhenMethodIsNotGet', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'POST' });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res.statusCode).toBe(405);
  });

  it('shouldRedirectToSpotifyAuthWhenNoCodeAndPlatformIsSpotify', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'GET', query: { userId: '42', platform: 'spotify' } });
    const res = httpMocks.createResponse({ eventEmitter: EventEmitter });
    res.redirect = jest.fn((url) => {
      res.end(); // termine manuellement la réponse
    });

    generateSpotifyAuthUrl.mockReturnValue('https://spotify-auth-url');

    // WHEN
    await handler(req, res);

    // THEN
    expect(generateSpotifyAuthUrl).toHaveBeenCalledWith('42', 'spotify');
    expect(res.redirect).toHaveBeenCalledWith('https://spotify-auth-url');
  });

  it('shouldReturn400WhenCodeOrStateIsMissing', async () => {
    // GIVEN
    const req = httpMocks.createRequest({ method: 'GET', query: { code: 'abc' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res.statusCode).toBe(400);
    expect(res._getData()).toMatch(/code.*state/);
  });

  it('shouldReturn400WhenStateDecodingFails', async () => {
    // GIVEN
    decodeSpotifyState.mockImplementation(() => { throw new Error('Invalid state'); });

    const req = httpMocks.createRequest({ method: 'GET', query: { code: 'abc', state: 'invalid' } });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res.statusCode).toBe(400);
    expect(res._getData()).toMatch(/Invalid state/);
  });

  it('shouldReturn400WhenUserIdOrPlatformMissingInState', async () => {
    // GIVEN
    decodeSpotifyState.mockReturnValue({ userId: null, platform: null });

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {
        code: 'dummy-code',
        state: 'base64-string'
      }
    });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(res.statusCode).toBe(400);
    expect(res._getData()).toMatch(/userId.*platform.*invalide/);
  });

  it('shouldCallUseCaseAndReturnSuccessResponse', async () => {
    // GIVEN
    decodeSpotifyState.mockReturnValue({ userId: '42', platform: 'spotify' });
    connectToDatabase.mockResolvedValue(true);
    getPlatformStrategy.mockResolvedValue({});

    const executeMock = jest.fn().mockResolvedValue({ savedArtists: [1, 2], savedMusics: [3] });
    FetchUserMusicStats.mockImplementation(() => ({ execute: executeMock }));

    const req = httpMocks.createRequest({
      method: 'GET',
      query: { code: 'abc', state: 'encodedState' }
    });
    const res = httpMocks.createResponse();

    // WHEN
    await handler(req, res);

    // THEN
    expect(getPlatformStrategy).toHaveBeenCalledWith('spotify', 'abc');
    expect(executeMock).toHaveBeenCalled();
    expect(res.statusCode).toBe(200);
    expect(res._getData()).toMatch(/Statistiques utilisateur mises à jour/);
  });

  it('shouldReturn500AndLogErrorOnUnexpectedException', async () => {
    // GIVEN
    decodeSpotifyState.mockReturnValue({ userId: '42', platform: 'spotify' });
    connectToDatabase.mockResolvedValue(true);
    getPlatformStrategy.mockResolvedValue({});

    FetchUserMusicStats.mockImplementation(() => ({
      execute: () => { throw new Error('Simulated error'); }
    }));

    const req = httpMocks.createRequest({
      method: 'GET',
      query: {
        code: 'valid-code',
        state: Buffer.from(JSON.stringify({ userId: '42', platform: 'spotify' })).toString('base64')
      }
    });

    const res = httpMocks.createResponse({ eventEmitter: (await import('events')).EventEmitter });
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // WHEN / THEN (async + eventEmitter)
    await new Promise((resolve) => {
      res.on('end', () => {
        expect(consoleSpy).toHaveBeenCalled();
        expect(res.statusCode).toBe(500);
        expect(res._getData()).toMatch(/Erreur interne/);
        consoleSpy.mockRestore();
        resolve();
      });
      handler(req, res);
    });
  });
});