//import SpotifyWebApi from 'spotify-web-api-node';
import { getAuthorizationURL, getAccessTokenFromCode, spotifyApi } from '../../services/spotifyService';
import { handleError } from '../../services/spotifyService';

describe('Spotify API Initialization', () => {
  /**
   * Vérifie que l'instance de Spotify API est correctement initialisée
   * avec les identifiants fournis dans les variables d'environnement.
   */
  it('should initialize Spotify API with correct credentials', () => {
    expect(spotifyApi).toBeDefined();
    expect(spotifyApi.getClientId()).toBe(process.env.SPOTIFY_CLIENT_ID);
    expect(spotifyApi.getClientSecret()).toBe(process.env.SPOTIFY_CLIENT_SECRET);
    expect(spotifyApi.getRedirectURI()).toBe(process.env.SPOTIFY_REDIRECT_URI);
  });
});

describe('getAuthorizationURL', () => {
  let createAuthorizeURLSpy;

  beforeEach(() => {
    createAuthorizeURLSpy = jest.spyOn(spotifyApi, 'createAuthorizeURL');
  });

  afterEach(() => {
    createAuthorizeURLSpy.mockRestore();
  });

  /**
   * Vérifie que `getAuthorizationURL` génère une URL d'autorisation valide
   * en appelant correctement la méthode `createAuthorizeURL` de `spotifyApi`.
   */
  it('should generate a valid Spotify authorization URL', () => {
    const authURL = getAuthorizationURL();

    expect(createAuthorizeURLSpy).toHaveBeenCalledWith(['user-top-read'], null);
    expect(authURL).toBeDefined();
    expect(typeof authURL).toBe('string');
    expect(authURL.length).toBeGreaterThan(0);
  });

  /**
   * Vérifie que `getAuthorizationURL` gère correctement les erreurs
   * en cas d'échec de `createAuthorizeURL`.
   */
  it('should handle errors if createAuthorizeURL throws an error', () => {
    createAuthorizeURLSpy.mockImplementation(() => {
      throw new Error('Spotify API error');
    });

    expect(() => getAuthorizationURL()).toThrow('Spotify API error');
  });
});

describe('handleError', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Empêche l'affichage des erreurs dans la console
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should throw the API's error message if error.body.error exists", () => {
    const mockError = { body: { error: 'Erreur API Spotify' } };

    expect(() => handleError(mockError, 'Message d’erreur personnalisé')).toThrow('Erreur API Spotify');
    expect(console.error).toHaveBeenCalledWith('Message d’erreur personnalisé', mockError);
    expect(console.error).toHaveBeenCalledWith('Détails de l’erreur:', 'Erreur API Spotify');
  });

  it("should throw 'ETIMEDOUT' if error.code is 'ETIMEDOUT'", () => {
    const mockError = { code: 'ETIMEDOUT' };

    expect(() => handleError(mockError, 'Message d’erreur personnalisé')).toThrow('ETIMEDOUT');
    expect(console.error).toHaveBeenCalledWith('Message d’erreur personnalisé', mockError);
    expect(console.error).toHaveBeenCalledWith('La requête a expiré. Veuillez essayer à nouveau.');
  });

  it('should throw the provided message if error is not an instance of Error', () => {
    const mockError = 'Erreur inconnue'; // Erreur sous forme de string

    expect(() => handleError(mockError, 'Message d’erreur personnalisé')).toThrow('Message d’erreur personnalisé');
    expect(console.error).toHaveBeenCalledWith('Message d’erreur personnalisé', mockError);
  });

  it('should not throw an error if the error is an instance of Error but does not match conditions', () => {
    const mockError = new Error('Erreur classique');

    expect(() => handleError(mockError, 'Message d’erreur personnalisé')).not.toThrow();
    expect(console.error).toHaveBeenCalledWith('Message d’erreur personnalisé', mockError);
  });
});

describe('getAccessTokenFromCode', () => {
  let authorizationCodeGrantSpy;
  let setAccessTokenSpy;
  let setRefreshTokenSpy;

  beforeEach(() => {
    authorizationCodeGrantSpy = jest.spyOn(spotifyApi, 'authorizationCodeGrant');
    setAccessTokenSpy = jest.spyOn(spotifyApi, 'setAccessToken');
    setRefreshTokenSpy = jest.spyOn(spotifyApi, 'setRefreshToken');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return access and refresh tokens and store them in spotifyApi', async () => {
    const mockResponse = {
      body: {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
      },
    };

    authorizationCodeGrantSpy.mockResolvedValue(mockResponse);

    const result = await getAccessTokenFromCode('valid-auth-code');

    expect(authorizationCodeGrantSpy).toHaveBeenCalledWith('valid-auth-code');
    expect(setAccessTokenSpy).toHaveBeenCalledWith('mock-access-token');
    expect(setRefreshTokenSpy).toHaveBeenCalledWith('mock-refresh-token');

    expect(result).toEqual({
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
    });
  });

  it('should handle missing refresh token', async () => {
    const mockResponse = {
      body: {
        access_token: 'mock-access-token',
      },
    };

    authorizationCodeGrantSpy.mockResolvedValue(mockResponse);

    const result = await getAccessTokenFromCode('valid-auth-code');

    expect(authorizationCodeGrantSpy).toHaveBeenCalledWith('valid-auth-code');
    expect(setAccessTokenSpy).toHaveBeenCalledWith('mock-access-token');
    expect(setRefreshTokenSpy).not.toHaveBeenCalled();

    expect(result).toEqual({
      accessToken: 'mock-access-token',
      refreshToken: undefined,
    });
  });

  it('should handle malformed API response', async () => {
    const mockResponse = { body: {} };

    authorizationCodeGrantSpy.mockResolvedValue(mockResponse);

    const result = await getAccessTokenFromCode('valid-auth-code');

    expect(authorizationCodeGrantSpy).toHaveBeenCalledWith('valid-auth-code');
    expect(setAccessTokenSpy).not.toHaveBeenCalled();
    expect(setRefreshTokenSpy).not.toHaveBeenCalled();

    expect(result).toEqual({
      accessToken: undefined,
      refreshToken: undefined,
    });
  });
});