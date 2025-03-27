import { 
  getAuthorizationURL,
  getAccessTokenFromCode,
  spotifyApi,
  refreshAccessToken,
  fetchSpotifyData,
  getUserTopArtists,
  getUserTopMusics,
  getUserFavoriteGenre
} from '../../services/spotifyService';
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
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Empêche les logs d'erreurs dans les tests
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
    const mockError = 'Erreur inconnue';

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

  it('should throw an error if the API response is invalid', async () => {
    authorizationCodeGrantSpy.mockResolvedValue(undefined);

    await expect(getAccessTokenFromCode('valid-auth-code'))
      .rejects.toThrow("Réponse invalide de l'API Spotify");

    authorizationCodeGrantSpy.mockResolvedValue({ body: undefined });

    await expect(getAccessTokenFromCode('valid-auth-code'))
      .rejects.toThrow("Réponse invalide de l'API Spotify");
  });
});

describe('refreshAccessToken', () => {
  let refreshAccessTokenSpy;
  let setAccessTokenSpy;
  
  beforeEach(() => {
    refreshAccessTokenSpy = jest.spyOn(spotifyApi, 'refreshAccessToken');
    setAccessTokenSpy = jest.spyOn(spotifyApi, 'setAccessToken').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Vérifie que `refreshAccessToken` met à jour et retourne le nouveau token d'accès
   */
  it('should refresh the access token and update it in spotifyApi', async () => {
    const mockResponse = { body: { access_token: 'new-access-token' } };
    
    refreshAccessTokenSpy.mockResolvedValue(mockResponse);

    const result = await refreshAccessToken();

    expect(refreshAccessTokenSpy).toHaveBeenCalled();
    expect(setAccessTokenSpy).toHaveBeenCalledWith('new-access-token');
    expect(result).toBe('new-access-token');
  });

  /**
   * Vérifie que `refreshAccessToken` lève une erreur si `data` ou `data.body` est `undefined`
   */
  it('should throw an error if data or data.body is undefined', async () => {
    refreshAccessTokenSpy.mockResolvedValue(undefined); // Cas où `data` est `undefined`
    await expect(refreshAccessToken()).rejects.toThrow("Réponse invalide de l'API Spotify : aucun access_token reçu.");

    refreshAccessTokenSpy.mockResolvedValue({}); // Cas où `data.body` est `undefined`
    await expect(refreshAccessToken()).rejects.toThrow("Réponse invalide de l'API Spotify : aucun access_token reçu.");

    expect(setAccessTokenSpy).not.toHaveBeenCalled(); // Vérifier que le token n'est pas mis à jour
  });

  /**
   * Vérifie que `refreshAccessToken` lève une erreur si les prérequis ne sont pas valides
   */
  it('should throw an error if clientId, clientSecret, or refreshToken is missing', async () => {
    jest.spyOn(spotifyApi, 'getClientId').mockReturnValue(null);
    jest.spyOn(spotifyApi, 'getClientSecret').mockReturnValue('secret');
    jest.spyOn(spotifyApi, 'getRefreshToken').mockReturnValue('refresh-token');

    await expect(refreshAccessToken()).rejects.toThrow('Les prérequis pour rafraîchir le token ne sont pas valides.');

    expect(refreshAccessTokenSpy).not.toHaveBeenCalled();
    expect(setAccessTokenSpy).not.toHaveBeenCalled();
  });

  /**
   * Vérifie que `refreshAccessToken` lève une erreur si `data.body.access_token` est `undefined`
   */
  it('should throw an error if access_token is missing in data.body', async () => {
    refreshAccessTokenSpy.mockResolvedValue({ body: {} }); // Cas où `access_token` est absent

    await expect(refreshAccessToken()).rejects.toThrow("Réponse invalide de l'API Spotify : aucun access_token reçu.");

    expect(setAccessTokenSpy).not.toHaveBeenCalled(); // Vérifier que le token n'est pas mis à jour
  });
});

describe('fetchSpotifyData', () => {
  let apiCallMock;
  let transformDataMock;

  beforeEach(() => {
    apiCallMock = jest.fn();
    transformDataMock = jest.fn((data) => data);
    jest.clearAllMocks();
  });

  it('should return transformed data on successful API call', async () => {
    const mockResponse = { body: { data: 'test' } };
    apiCallMock.mockResolvedValue(mockResponse);
    
    const result = await fetchSpotifyData(apiCallMock, 'Erreur API', transformDataMock);
    
    expect(apiCallMock).toHaveBeenCalledTimes(1);
    expect(transformDataMock).toHaveBeenCalledWith(mockResponse.body);
    expect(result).toEqual(mockResponse.body);
  });

  it('should throw an error if token refresh fails', async () => {
    const apiError = new Error('Unauthorized');
    apiCallMock.mockRejectedValue(apiError);
    
    await expect(fetchSpotifyData(apiCallMock, 'Erreur API', transformDataMock))
      .rejects.toThrow('Unauthorized');
  });

  it('should throw an error with custom message if API returns a status code', async () => {
    const apiError = new Error('Service Unavailable');
    apiError.statusCode = 503;
    apiCallMock.mockRejectedValue(apiError);
    
    await expect(fetchSpotifyData(apiCallMock, 'Erreur API', transformDataMock))
      .rejects.toThrow('Erreur API : Service Unavailable');
  });
});

describe("getUserTopArtists", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should return formatted top artists when API call succeeds", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: {
        items: [
          { name: "Artist 1" },
          { name: "Artist 2" },
          { name: "Artist 3" },
        ],
      },
    });

    const result = await getUserTopArtists(3);

    expect(spotifyApi.getMyTopArtists).toHaveBeenCalledWith({ limit: 3 });

    expect(result).toEqual([
      { artist_name: "Artist 1", ranking: 1 },
      { artist_name: "Artist 2", ranking: 2 },
      { artist_name: "Artist 3", ranking: 3 },
    ]);
  });

  it("should return an empty array if API returns no artists", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: { items: [] },
    });

    const result = await getUserTopArtists(3);

    expect(result).toEqual([]);
  });

  it("should handle API errors correctly", async () => {
    jest
      .spyOn(spotifyApi, "getMyTopArtists")
      .mockRejectedValue(new Error("API Error"));

    await expect(getUserTopArtists()).rejects.toThrow("API Error");
  });
});

describe("getUserTopMusics", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should return formatted top musics when API call succeeds", async () => {
    jest.spyOn(spotifyApi, "getMyTopTracks").mockResolvedValue({
      body: {
        items: [
          { name: "Song 1", artists: [{ name: "Artist 1" }] },
          { name: "Song 2", artists: [{ name: "Artist 2" }] },
          { name: "Song 3", artists: [{ name: "Artist 3" }] },
        ],
      },
    });

    const result = await getUserTopMusics(3);

    expect(spotifyApi.getMyTopTracks).toHaveBeenCalledWith({ limit: 3 });

    expect(result).toEqual([
      { music_name: "Song 1", artist_name: "Artist 1", ranking: 1 },
      { music_name: "Song 2", artist_name: "Artist 2", ranking: 2 },
      { music_name: "Song 3", artist_name: "Artist 3", ranking: 3 },
    ]);
  });

  it("should return an empty array if API returns no tracks", async () => {
    jest.spyOn(spotifyApi, "getMyTopTracks").mockResolvedValue({
      body: { items: [] },
    });

    const result = await getUserTopMusics(3);

    expect(result).toEqual([]);
  });

  it("should handle API errors correctly", async () => {
    jest
      .spyOn(spotifyApi, "getMyTopTracks")
      .mockRejectedValue(new Error("API Error"));

    await expect(getUserTopMusics()).rejects.toThrow("API Error");
  });
});

describe("getUserFavoriteGenre", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("should return the most frequent genre from the user's top artists", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: {
        items: [
          { genres: ["Rock", "Alternative"] },
          { genres: ["Rock", "Indie"] },
          { genres: ["Rock", "Pop"] },
          { genres: ["Indie", "Alternative"] },
          { genres: ["Rock"] },
        ],
      },
    });

    const result = await getUserFavoriteGenre();

    expect(["Rock"]).toContain(result); // On vérifie que c'est bien le genre dominant
  });

  it("should throw an error if no genres are found", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: { items: [{ genres: [] }, { genres: [] }] },
    });

    await expect(getUserFavoriteGenre()).rejects.toThrow(
      "Aucun genre trouvé parmi les artistes les plus écoutés."
    );
  });

  it("should return one of the most frequent genres when multiple have the same count", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: {
        items: [
          { genres: ["Jazz", "Blues"] },
          { genres: ["Jazz", "Rock"] },
          { genres: ["Blues", "Rock"] }
        ],
      },
    });

    const result = await getUserFavoriteGenre();

    expect(["Jazz", "Rock", "Blues"]).toContain(result); // On accepte plusieurs résultats possibles
  });

  it("should handle API errors correctly", async () => {
    jest
      .spyOn(spotifyApi, "getMyTopArtists")
      .mockRejectedValue(new Error("API Error"));

    await expect(getUserFavoriteGenre()).rejects.toThrow("API Error");
  });

  it("should return a genre when only one artist is available", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: { items: [{ genres: ["Classical"] }] },
    });

    const result = await getUserFavoriteGenre();

    expect(result).toBe("Classical");
  });

  it("should ignore artists without genres and still return the most frequent one", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: {
        items: [
          { genres: [] }, // Pas de genre
          { genres: ["Electronic"] },
          { genres: ["Electronic", "House"] },
          { genres: ["House"] },
        ],
      },
    });

    const result = await getUserFavoriteGenre();

    expect(["Electronic", "House"]).toContain(result); // Accepter les deux
  });
});