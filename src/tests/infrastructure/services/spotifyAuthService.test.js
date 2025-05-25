import { jest } from '@jest/globals';

describe('spotifyAuthService - OAuth URL & state handling', () => {
  let generateSpotifyAuthUrl;
  let decodeSpotifyState;

  /**
   * Préparation du module et des variables d’environnement avant les tests.
   */
  beforeAll(async () => {
    process.env.SPOTIFY_CLIENT_ID = '3df7d2e30b5545d59ae4c9666c5c9460';
    process.env.SPOTIFY_REDIRECT_URI = 'http://localhost:3000/api/statistics';

    const authService = await import('infrastructure/services/spotifyAuthService.js');
    generateSpotifyAuthUrl = authService.generateSpotifyAuthUrl;
    decodeSpotifyState = authService.decodeSpotifyState;
  });

  /**
   * GIVEN un userId et une plateforme
   * WHEN on appelle `generateSpotifyAuthUrl`
   * THEN une URL valide doit être générée et le `state` encodé correctement
   */
  it('shouldGenerateValidSpotifyAuthUrlWithEncodedState', () => {
    // GIVEN
    const userId = '42';
    const platform = 'spotify';

    // WHEN
    const url = generateSpotifyAuthUrl(userId, platform);
    const parsedUrl = new URL(url);

    // THEN
    expect(parsedUrl.origin).toBe('https://accounts.spotify.com');
    expect(parsedUrl.pathname).toBe('/authorize');
    expect(parsedUrl.searchParams.get('client_id')).toBe(process.env.SPOTIFY_CLIENT_ID);
    expect(parsedUrl.searchParams.get('redirect_uri')).toBe(process.env.SPOTIFY_REDIRECT_URI);
    expect(parsedUrl.searchParams.get('response_type')).toBe('code');
    expect(parsedUrl.searchParams.get('scope')).toBe('user-top-read');

    const encodedState = parsedUrl.searchParams.get('state');
    const decodedState = decodeSpotifyState(encodedState);
    expect(decodedState).toEqual({ userId, platform });
  });

  /**
   * GIVEN une chaîne `state` encodée en base64
   * WHEN on l’envoie à `decodeSpotifyState`
   * THEN on récupère l’objet d’origine
   */
  it('shouldDecodeValidBase64StateToObject', () => {
    // GIVEN
    const originalState = { userId: '123', platform: 'spotify' };
    const encoded = Buffer.from(JSON.stringify(originalState)).toString('base64');

    // WHEN
    const result = decodeSpotifyState(encoded);

    // THEN
    expect(result).toEqual(originalState);
  });

  /**
   * GIVEN une chaîne corrompue en tant que `state`
   * WHEN on appelle `decodeSpotifyState`
   * THEN une erreur doit être levée
   */
  it('shouldThrowErrorIfStateIsInvalidBase64', () => {
    // GIVEN
    const invalidState = '%%%###***not-valid-base64***###%%%';
  
    // Intercepter temporairement le log pour ne pas polluer la console
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  
    // WHEN / THEN
    expect(() => decodeSpotifyState(invalidState)).toThrow('Paramètre `state` invalide.');
  
    // Remise en état
    consoleSpy.mockRestore();
  });
});