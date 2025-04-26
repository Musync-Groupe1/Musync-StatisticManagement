/**
 * @fileoverview Service pour générer et décoder les informations OAuth Spotify
 */

const {
  SPOTIFY_CLIENT_ID,
  SPOTIFY_REDIRECT_URI
} = process.env;

/**
 * Génère une URL d'autorisation Spotify avec les bons paramètres OAuth.
 * Utilise un `state` encodé en base64 contenant `userId` et `platform`.
 *
 * @param {string} userId - Identifiant utilisateur
 * @param {string} platform - Nom de la plateforme (spotify)
 * @returns {string} - URL d'autorisation OAuth Spotify
 */
export function generateSpotifyAuthUrl(userId, platform) {
  const encodedState = Buffer.from(JSON.stringify({ userId, platform })).toString('base64');

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', SPOTIFY_CLIENT_ID);
  authUrl.searchParams.set('redirect_uri', SPOTIFY_REDIRECT_URI);
  authUrl.searchParams.set('scope', 'user-top-read');
  authUrl.searchParams.set('state', encodedState);
  
  return authUrl.toString();
}

/**
 * Décode et parse le paramètre `state` encodé en base64 envoyé par Spotify
 * @param {string} encodedState
 * @returns {{ userId: string, platform: string }} - Données extraites
 * @throws {Error} si le format est invalide
 */
export function decodeSpotifyState(encodedState) {
  try {
    return JSON.parse(Buffer.from(encodedState, 'base64').toString());
  } catch (error) {
    console.error(error);
    throw new Error('Paramètre `state` invalide.');
  }
}