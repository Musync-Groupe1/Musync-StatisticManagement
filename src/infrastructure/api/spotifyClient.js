import SpotifyWebApi from 'spotify-web-api-node';

/**
 * @class SpotifyClient
 * @classdesc Wrapper autour de l’API Spotify Web utilisant `spotify-web-api-node`.
 * Permet de gérer l’authentification OAuth2 (code, refresh token) et les appels
 * utilisateurs pour récupérer artistes, musiques et genres.
 */
export default class SpotifyClient {

  /**
   * Initialise le client Spotify avec les clés d’authentification.
   *
   * @param {Object} options
   * @param {string} [options.accessToken] - Jeton d’accès déjà disponible (optionnel)
   * @param {string} [options.refreshToken] - Jeton de rafraîchissement (optionnel)
   */
  constructor({ accessToken, refreshToken }) {
    this.client = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: process.env.SPOTIFY_REDIRECT_URI,
    });

    if (accessToken) this.client.setAccessToken(accessToken);
    if (refreshToken) this.client.setRefreshToken(refreshToken);
  }

  /**
   * Génère une URL d’autorisation OAuth2 à laquelle rediriger l’utilisateur Spotify.
   *
   * @param {string[]} scopes - Permissions demandées à l’utilisateur
   * @returns {string} URL d’authentification Spotify
   */
  getAuthorizationURL(scopes = ['user-top-read']) {
    return this.client.createAuthorizeURL(scopes, null);
  }

  /**
   * Échange un code d’autorisation contre un access token et un refresh token.
   *
   * @param {string} code - Code retourné par Spotify après redirection
   * @returns {Promise<{accessToken: string, refreshToken: string}>}
   * @throws {Error} Si l’access token est introuvable
   */
  async getAccessTokenFromCode(code) {
    const data = await this.client.authorizationCodeGrant(code);
    const accessToken = data.body?.access_token;
    const refreshToken = data.body?.refresh_token;

    if (!accessToken) throw new Error("Aucun access token reçu.");
    this.client.setAccessToken(accessToken);
    if (refreshToken) this.client.setRefreshToken(refreshToken);

    return { accessToken, refreshToken };
  }

  /**
   * Rafraîchit un access token expiré à l’aide du refresh token.
   *
   * @returns {Promise<string>} Nouveau token d’accès
   * @throws {Error} Si le token est introuvable
   */
  async refreshAccessToken() {
    const data = await this.client.refreshAccessToken();
    const newToken = data.body?.access_token;
    if (!newToken) throw new Error("Impossible de rafraîchir le token.");
    this.client.setAccessToken(newToken);
    return newToken;
  }

  /**
   * Récupère les artistes les plus écoutés de l’utilisateur.
   *
   * @param {number} limit - Nombre d’artistes à récupérer (par défaut 3)
   * @returns {Promise<Array<Object>>} Liste des artistes
   */
  async getTopArtists(limit = 3) {
    const data = await this.client.getMyTopArtists({ limit });
    return data.body.items;
  }

  /**
   * Récupère les musiques les plus écoutées de l’utilisateur.
   *
   * @param {number} limit - Nombre de musiques à récupérer (par défaut 3)
   * @returns {Promise<Array<Object>>} Liste des musiques
   */
  async getTopTracks(limit = 3) {
    const data = await this.client.getMyTopTracks({ limit });
    return data.body.items;
  }
}