import { getAuthorizationURL, getAccessTokenFromCode, spotifyApi, refreshAccessToken } from '../../services/spotifyService';
//import { fetchSpotifyData, getUserTopArtists, getUserTopMusics, getUserFavoriteGenre } from '../../services/spotifyService';

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

describe('Spotify API Initialization', () => {
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

  it('should generate a valid Spotify authorization URL', () => {
    const authURL = getAuthorizationURL();

    expect(createAuthorizeURLSpy).toHaveBeenCalledWith(['user-top-read'], null);
    expect(authURL).toBeDefined();
    expect(typeof authURL).toBe('string');
    expect(authURL.length).toBeGreaterThan(0);
  });

  it('should handle errors if createAuthorizeURL throws an error', () => {
    createAuthorizeURLSpy.mockImplementation(() => { throw new Error('Spotify API error'); });

    expect(() => getAuthorizationURL()).toThrow('Spotify API error');
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
  });

  it('should refresh the access token and update it in spotifyApi', async () => {
    const mockResponse = { body: { access_token: 'new-access-token' } };
    
    refreshAccessTokenSpy.mockResolvedValue(mockResponse);

    const result = await refreshAccessToken();

    expect(refreshAccessTokenSpy).toHaveBeenCalled();
    expect(setAccessTokenSpy).toHaveBeenCalledWith('new-access-token');
    expect(result).toBe('new-access-token');
  });

  it('should throw an error if data or data.body is undefined', async () => {
    refreshAccessTokenSpy.mockResolvedValue(undefined);
    await expect(refreshAccessToken()).rejects.toThrow("Réponse invalide de l'API Spotify : aucun access_token reçu.");

    refreshAccessTokenSpy.mockResolvedValue({});
    await expect(refreshAccessToken()).rejects.toThrow("Réponse invalide de l'API Spotify : aucun access_token reçu.");

    expect(setAccessTokenSpy).not.toHaveBeenCalled();
  });

  it('should throw an error if clientId, clientSecret, or refreshToken is missing', async () => {
    jest.spyOn(spotifyApi, 'getClientId').mockReturnValue(null);
    jest.spyOn(spotifyApi, 'getClientSecret').mockReturnValue('secret');
    jest.spyOn(spotifyApi, 'getRefreshToken').mockReturnValue('refresh-token');

    await expect(refreshAccessToken()).rejects.toThrow('Les prérequis pour rafraîchir le token ne sont pas valides.');

    expect(refreshAccessTokenSpy).not.toHaveBeenCalled();
    expect(setAccessTokenSpy).not.toHaveBeenCalled();
  });

  it('should throw an error if access_token is missing in data.body', async () => {
    refreshAccessTokenSpy.mockResolvedValue({ body: {} });

    await expect(refreshAccessToken()).rejects.toThrow("Réponse invalide de l'API Spotify : aucun access_token reçu.");

    expect(setAccessTokenSpy).not.toHaveBeenCalled();
  });
});

/*
describe('fetchSpotifyData', () => {
  let apiCallMock;
  let transformDataMock;

  beforeEach(() => {
    apiCallMock = jest.fn();
    transformDataMock = jest.fn((data) => data);
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

    expect(["Rock"]).toContain(result);
  });

  it("should throw an error if no genres are found", async () => {
    jest.spyOn(spotifyApi, "getMyTopArtists").mockResolvedValue({
      body: { items: [{ genres: [] }, { genres: [] }] },
    });

    await expect(getUserFavoriteGenre()).rejects.toThrow(
      "Erreur inattendue lors de l'appel API : Aucun genre trouvé"
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

    expect(["Jazz", "Rock", "Blues"]).toContain(result);
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
          { genres: [] },
          { genres: ["Electronic"] },
          { genres: ["Electronic", "House"] },
          { genres: ["House"] },
        ],
      },
    });

    const result = await getUserFavoriteGenre();

    expect(["Electronic", "House"]).toContain(result);
  });
});
*/