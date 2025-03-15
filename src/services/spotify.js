import SpotifyWebApi from 'spotify-web-api-node';
import 'dotenv/config';

/*
Exemple d'URL d'autorisation Spotify :
https://accounts.spotify.com/authorize?response_type=code&client_id=3df7d2e30b5545d59ae4c9666c5c9460&redirect_uri=http://localhost:3000/api/stats&scope=user-top-read

*/
// Initialisation de l'API Spotify avec les identifiants configurés via les variables d'environnement
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

/**
 * Génère l'URL d'autorisation pour rediriger l'utilisateur vers Spotify afin d'obtenir un code d'autorisation.
 * @returns {string} L'URL de redirection Spotify
 */
export function getAuthorizationURL() {
  const scopes = ['user-top-read']; // Les permissions demandées
  return spotifyApi.createAuthorizeURL(scopes, null); // redirection vers l'URL d'autorisation
}

/**
 * Échange le code d'autorisation contre un jeton d'accès et un refresh token.
 * @param {string} code Le code d'autorisation reçu après la redirection.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Les jetons d'accès et de rafraîchissement
 */
export async function getAccessTokenFromCode(code) {
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    const accessToken = data.body['access_token'];
    const refreshToken = data.body['refresh_token'];

    spotifyApi.setAccessToken(accessToken); // Enregistrer le jeton d'accès pour les futures requêtes.
    spotifyApi.setRefreshToken(refreshToken); // Enregistrer le refresh token, si nécessaire.

    // Retourner les jetons pour stockage ou utilisation
    return { accessToken, refreshToken };
  } catch (error) {
    handleError(error, 'Error getting access token from code');
  }
}

/**
 * Rafraîchit le jeton d'accès à l'aide du refresh token.
 * @returns {Promise<string>} Le nouveau jeton d'accès
 */
export async function refreshAccessToken() {
  try {
    const data = await spotifyApi.refreshAccessToken();
    const newAccessToken = data.body['access_token'];

    // Mise à jour du jeton d'accès
    spotifyApi.setAccessToken(newAccessToken);

    return newAccessToken;
  } catch (error) {
    handleError(error, 'Error refreshing access token');
  }
}

/**
 * Récupère les statistiques utilisateur (artistes et morceaux).
 * @returns {Promise<{topArtists: Array, topTracks: Array}>} Les statistiques de l'utilisateur (artistes et morceaux)
 */
export async function getUserStats() {
  try {
    const [topArtists, topTracks] = await Promise.all([getTopArtists(), getTopTracks()]);

    return { topArtists, topTracks };
  } catch (error) {
    handleError(error, 'Error fetching user stats from Spotify');
  }
}

/**
 * Récupère les 3 artistes les plus écoutés de l'utilisateur.
 * @returns {Promise<Array>} La liste des artistes les plus écoutés avec leur classement
 */
async function getTopArtists() {
  try {
    const artistsResponse = await spotifyApi.getMyTopArtists({ limit: 3 });
    return artistsResponse.body.items.map((artist, index) => ({
      top_listened_artist: artist.name,
      top_ranking: index + 1,
    }));
  } catch (error) {
    handleError(error, 'Error fetching top artists from Spotify');
  }
}

/**
 * Récupère les 3 morceaux les plus écoutés de l'utilisateur.
 * @returns {Promise<Array>} La liste des morceaux les plus écoutés avec leur classement
 */
async function getTopTracks() {
  try {
    const tracksResponse = await spotifyApi.getMyTopTracks({ limit: 3 });
    return tracksResponse.body.items.map((track, index) => ({
      top_listened_music: track.name,
      artist_name: track.artists[0].name,
      top_ranking: index + 1,
    }));
  } catch (error) {
    handleError(error, 'Error fetching top tracks from Spotify');
  }
}

/**
 * Fonction générique pour gérer et afficher les erreurs.
 * @param {Object} error L'objet d'erreur généré
 * @param {string} message Le message d'erreur personnalisé
 */
function handleError(error, message) {
  console.error(message, error);
  if (error.body && error.body.error) {
    console.error('Error details:', error.body.error);
  }
  throw error; // Propagation de l'erreur
}

export { getTopArtists, getTopTracks, getUserStats, refreshAccessToken };