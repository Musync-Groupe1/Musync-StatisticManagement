import { jest } from '@jest/globals';

// Mocks des méthodes du SDK Spotify
const mockSetAccessToken = jest.fn();
const mockSetRefreshToken = jest.fn();
const mockCreateAuthorizeURL = jest.fn(() => 'https://mocked-auth-url');
const mockAuthorizationCodeGrant = jest.fn();
const mockRefreshAccessToken = jest.fn();
const mockGetMyTopArtists = jest.fn();
const mockGetMyTopTracks = jest.fn();

// Simulation du module "spotify-web-api-node"
jest.unstable_mockModule('spotify-web-api-node', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      setAccessToken: mockSetAccessToken,
      setRefreshToken: mockSetRefreshToken,
      createAuthorizeURL: mockCreateAuthorizeURL,
      authorizationCodeGrant: mockAuthorizationCodeGrant,
      refreshAccessToken: mockRefreshAccessToken,
      getMyTopArtists: mockGetMyTopArtists,
      getMyTopTracks: mockGetMyTopTracks
    }))
  };
});

describe('SpotifyClient', () => {
  let SpotifyClient;

  beforeAll(async () => {
    SpotifyClient = (await import('infrastructure/api/spotifyClient.js')).default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shouldSetTokensOnInit', () => {
    // GIVEN
    new SpotifyClient({ accessToken: 'abc', refreshToken: 'xyz' });

    // THEN
    expect(mockSetAccessToken).toHaveBeenCalledWith('abc');
    expect(mockSetRefreshToken).toHaveBeenCalledWith('xyz');
  });

  it('shouldReturnAuthorizationUrl', () => {
    // GIVEN
    const client = new SpotifyClient({});

    // WHEN
    const url = client.getAuthorizationURL();

    // THEN
    expect(mockCreateAuthorizeURL).toHaveBeenCalledWith(['user-top-read'], null);
    expect(url).toBe('https://mocked-auth-url');
  });

  it('shouldExchangeCodeForTokens', async () => {
    // GIVEN
    mockAuthorizationCodeGrant.mockResolvedValue({
      body: { access_token: 'token123', refresh_token: 'refresh123' }
    });

    const client = new SpotifyClient({});

    // WHEN
    const tokens = await client.getAccessTokenFromCode('mock-code');

    // THEN
    expect(mockAuthorizationCodeGrant).toHaveBeenCalledWith('mock-code');
    expect(tokens).toEqual({ accessToken: 'token123', refreshToken: 'refresh123' });
  });

  it('shouldThrowWhenAccessTokenIsMissingAfterCodeGrant', async () => {
    // GIVEN
    mockAuthorizationCodeGrant.mockResolvedValue({ body: {} });

    const client = new SpotifyClient({});

    // WHEN / THEN
    await expect(client.getAccessTokenFromCode('code')).rejects.toThrow('Aucun access token reçu.');
  });

  it('shouldSetAccessTokenOnlyIfRefreshTokenIsMissing', async () => {
    // GIVEN
    mockAuthorizationCodeGrant.mockResolvedValue({ body: { access_token: 'token123' } });

    const client = new SpotifyClient({});
    client.client.setAccessToken = mockSetAccessToken;
    client.client.setRefreshToken = mockSetRefreshToken;

    // WHEN
    const tokens = await client.getAccessTokenFromCode('codeABC');

    // THEN
    expect(tokens).toEqual({ accessToken: 'token123', refreshToken: undefined });
    expect(mockSetAccessToken).toHaveBeenCalledWith('token123');
    expect(mockSetRefreshToken).not.toHaveBeenCalled();
  });

  it('shouldCallGetTopArtistsWithDefaultLimit', async () => {
    // GIVEN
    mockGetMyTopArtists.mockResolvedValue({ body: { items: ['artist1', 'artist2'] } });

    const client = new SpotifyClient({});

    // WHEN
    const result = await client.getTopArtists();

    // THEN
    expect(mockGetMyTopArtists).toHaveBeenCalledWith({ limit: 3 });
    expect(result).toEqual(['artist1', 'artist2']);
  });

  it('shouldCallGetTopArtistsWithCustomLimit', async () => {
    // GIVEN
    mockGetMyTopArtists.mockResolvedValue({ body: { items: ['artist1', 'artist2'] } });

    const client = new SpotifyClient({});

    // WHEN
    const result = await client.getTopArtists(5);

    // THEN
    expect(mockGetMyTopArtists).toHaveBeenCalledWith({ limit: 5 });
    expect(result).toEqual(['artist1', 'artist2']);
  });

  it('shouldCallGetTopTracksWithDefaultLimit', async () => {
    // GIVEN
    mockGetMyTopTracks.mockResolvedValue({ body: { items: ['track1', 'track2'] } });

    const client = new SpotifyClient({});

    // WHEN
    const result = await client.getTopTracks();

    // THEN
    expect(mockGetMyTopTracks).toHaveBeenCalledWith({ limit: 3 });
    expect(result).toEqual(['track1', 'track2']);
  });

  it('shouldCallGetTopTracksWithCustomLimit', async () => {
    // GIVEN
    mockGetMyTopTracks.mockResolvedValue({ body: { items: ['track1', 'track2'] } });

    const client = new SpotifyClient({});

    // WHEN
    const result = await client.getTopTracks(2);

    // THEN
    expect(mockGetMyTopTracks).toHaveBeenCalledWith({ limit: 2 });
    expect(result).toEqual(['track1', 'track2']);
  });
});