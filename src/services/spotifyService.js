import SpotifyWebApi from 'spotify-web-api-node';
import 'dotenv/config';

// Initialisation de l'API Spotify avec les identifiants configurés via les variables d'environnement
export const spotifyApi = new SpotifyWebApi({
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
  return spotifyApi.createAuthorizeURL(scopes, null);
}

/**
 * Échange le code d'autorisation contre un jeton d'accès et un refresh token.
 * @param {string} code - Le code d'autorisation reçu après la redirection.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Les jetons d'accès et de rafraîchissement.
 */
export async function getAccessTokenFromCode(code) {
  const data = await spotifyApi.authorizationCodeGrant(code);

  if (!data || !data.body) {
    throw new Error("Réponse invalide de l'API Spotify");
  }

  const accessToken = data.body.access_token || undefined;
  const refreshToken = data.body.refresh_token || undefined;

  if (accessToken) {
    spotifyApi.setAccessToken(accessToken);
  }

  if (refreshToken) {
    spotifyApi.setRefreshToken(refreshToken);
  }

  return { accessToken, refreshToken };
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
    handleError(error, 'Erreur lors du rafraîchissement du token');
  }
}

/**
 * Récupère les statistiques musicales d'un utilisateur, y compris le genre préféré,
 * les artistes et les musiques les plus écoutées.
 * @returns {Promise<{favoriteGenre: string, topArtists: Array, topMusics: Array}>}
 */
export async function getSpotifyStats() {
  try {
    const [favoriteGenre, topArtists, topMusics] = await Promise.all([
      getUserFavoriteGenre(),
      getUserTopArtists(),
      getUserTopMusics()
    ]);

    return { favoriteGenre, topArtists, topMusics };
  } catch (error) {
    handleError(error, "Erreur lors de la récupération des statistiques de l'utilisateur");
  }
}

/**
 * Récupère les artistes les plus écoutés d'un utilisateur.
 * @param {number} [limit=3] - Nombre d'artistes à récupérer (par défaut, 3 artistes).
 * @returns {Promise<Array<{top_listened_artist: string, top_ranking: number}>>}
 */
export async function getUserTopArtists(limit = 3) {
  return fetchSpotifyData(
    () => spotifyApi.getMyTopArtists({ limit }),
    "Erreur dans la récupération des artistes les plus écoutés par l'utilisateur",
    data => data.items.map((artist, index) => ({
      artist_name: artist.name,
      ranking: index + 1
    }))
  );
}

/**
 * Récupère les musiques les plus écoutées d'un utilisateur.
 * @param {number} [limit=3] - Nombre de musiques à récupérer.
 * @returns {Promise<Array<{top_listened_music: string, artist_name: string, top_ranking: number}>>}
 */
export async function getUserTopMusics(limit = 3) {
  return fetchSpotifyData(
    () => spotifyApi.getMyTopTracks({ limit }),
    "Erreur dans la récupération des musiques les plus écoutées par l'utilisateur",
    data => data.items.map((music, index) => ({
      music_name: music.name,
      artist_name: music.artists[0].name,
      ranking: index + 1
    }))
  );
}

/**
 * Détermine le genre musical préféré de l'utilisateur 
 * en analysant les 30 artistes les plus écoutés.
 * @returns {Promise<string>} Le genre préféré de l'utilisateur.
 */
export async function getUserFavoriteGenre() {
  return fetchSpotifyData(
    () => spotifyApi.getMyTopArtists({ limit: 30 }),
    'Erreur dans la recherche des genres musicaux',
    data => {
      const genres = data.items.flatMap(artist => artist.genres);
      
      if (genres.length === 0) {
        throw new Error("Aucun genre trouvé parmi les artistes les plus écoutés.");
      }

      // Comptabilise les occurrences de chaque genre
      const genreCount = genres.reduce((acc, genre) => {
        acc[genre] = (acc[genre] || 0) + 1;
        return acc;
      }, {});

      return Object.keys(genreCount).reduce((a, b) => genreCount[a] > genreCount[b] ? a : b);
    }
  );
}

/**
 * Fonction générique pour récupérer des données depuis l'API Spotify et traiter les erreurs.
 * @param {Function} apiCall - La fonction qui fait l'appel API.
 * @param {string} errorMessage - Message d'erreur personnalisé.
 * @param {Function} transformData - Fonction de transformation des données.
 * @returns {Promise<any>} - Résultat transformé de l'API Spotify.
 */
export async function fetchSpotifyData(apiCall, errorMessage, transformData) {
  try {
    const { body } = await apiCall();
    return transformData(body);
  } catch (error) {
    handleError(error, errorMessage);
  }
}

/**
 * Fonction de gestion centralisée des erreurs.
 * Log l'erreur et affiche un message pertinent.
 * @param {Object} error - L'objet d'erreur.
 * @param {string} message - Message d'erreur personnalisé.
 * @throws {Error} Relance l'erreur après l'avoir loguée.
 */
export function handleError(error, message) {
  console.error(message, error);

  if (error.body?.error) {
    console.error('Détails de l’erreur:', error.body.error);
    throw new Error(error.body.error);
  }

  if (error.code === 'ETIMEDOUT') {
    console.error('La requête a expiré. Veuillez essayer à nouveau.');
    throw new Error('ETIMEDOUT');
  }

  if (!(error instanceof Error)) {
    throw new Error(message);
  }
}