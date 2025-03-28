import SpotifyWebApi from 'spotify-web-api-node';
import 'dotenv/config';

/**
 * Initialisation de l'API Spotify avec les identifiants configurés via les variables d'environnement
 */
export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

/**
 * Génère l'URL d'autorisation pour rediriger l'utilisateur vers Spotify
 * afin d'obtenir un code d'autorisation.
 * @returns {string} L'URL de redirection Spotify pour l'authentification.
 */
export function getAuthorizationURL() {
  const scopes = ['user-top-read']; // Les permissions demandées
  return spotifyApi.createAuthorizeURL(scopes, null);
}

/**
 * Échange le code d'autorisation contre un jeton d'accès et un refresh token.
 * @param {string} code - Le code d'autorisation reçu après la redirection.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} Les jetons d'accès et de rafraîchissement.
 * @throws {Error} En cas de réponse invalide de l'API Spotify.
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
 * @returns {Promise<string>} Le nouveau jeton d'accès.
 * @throws {Error} Si les prérequis pour rafraîchir le token ne sont pas remplis ou si la réponse est invalide.
 */
export async function refreshAccessToken() {
  // Vérifier si spotifyApi est bien configuré avant d'appeler l'API
  if (!spotifyApi.getClientId() || !spotifyApi.getClientSecret() || !spotifyApi.getRefreshToken()) {
    throw new Error('Les prérequis pour rafraîchir le token ne sont pas valides.');
  }

  const data = await spotifyApi.refreshAccessToken();

  if (!data || !data.body) {
    throw new Error("Réponse invalide de l'API Spotify : aucun access_token reçu.");
  }

  const newAccessToken = data.body.access_token;

  // Vérifier si le nouveau jeton d'accès est bien retourné
  if (!newAccessToken) {
    throw new Error("Réponse invalide de l'API Spotify : aucun access_token reçu.");
  }

  // Mise à jour du jeton d'accès
  spotifyApi.setAccessToken(newAccessToken);

  return newAccessToken;
}

/**
 * Récupère les statistiques musicales d'un utilisateur : genre préféré, artistes et musiques les plus écoutés.
 * @returns {Promise<{favoriteGenre: string, topArtists: Array, topMusics: Array}>} Statistiques musicales de l'utilisateur.
 * @throws {Error} Si l'une des données est indisponible.
 */
export async function getSpotifyStats() {
  const [favoriteGenre, topArtists, topMusics] = await Promise.all([
    getUserFavoriteGenre(),
    getUserTopArtists(),
    getUserTopMusics()
  ]);

  // Vérifie si une des valeurs est manquante
  if (!favoriteGenre) throw new Error("Impossible de récupérer le genre préféré de l'utilisateur.");
  if (!Array.isArray(topArtists) || topArtists.length === 0) throw new Error("Impossible de récupérer les artistes les plus écoutés.");
  if (!Array.isArray(topMusics) || topMusics.length === 0) throw new Error("Impossible de récupérer les musiques les plus écoutées.");

  return { favoriteGenre, topArtists, topMusics };
}

/**
 * Récupère les artistes les plus écoutés d'un utilisateur.
 * @param {number} [limit=3] - Nombre d'artistes à récupérer (par défaut, 3 artistes).
 * @returns {Promise<Array<{artist_name: string, ranking: number}>>} Liste des artistes les plus écoutés.
 * @throws {Error} En cas d'échec de récupération des données.
 */
async function getUserTopArtists(limit = 3) {
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
 * @returns {Promise<Array<{music_name: string, artist_name: string, ranking: number}>>} Liste des musiques les plus écoutées.
 * @throws {Error} En cas d'échec de récupération des données.
 */
async function getUserTopMusics(limit = 3) {
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
 * Détermine le genre musical préféré de l'utilisateur en analysant ses 30 artistes les plus écoutés.
 * @returns {Promise<string>} Le genre préféré de l'utilisateur.
 * @throws {Error} Si aucun genre n'est trouvé.
 */
async function getUserFavoriteGenre() {
  return fetchSpotifyData(
    () => spotifyApi.getMyTopArtists({ limit: 30 }),
    'Erreur dans la recherche des genres musicaux',
    data => {
      const genres = data.items.flatMap(artist => artist.genres);
      if (genres.length === 0) throw new Error("Aucun genre trouvé.");
      return getMostFrequentGenre(genres);
    }
  );
}

/**
 * Identifie le genre musical le plus fréquent dans une liste de genres.
 * @param {string[]} genres - Liste des genres musicaux extraits des artistes.
 * @returns {string} Le genre le plus écouté par l'utilisateur.
 */
function getMostFrequentGenre(genres) {
  const genreCount = genres.reduce((acc, genre) => {
    acc[genre] = (acc[genre] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1]) // Tri décroissant sur la fréquence
    .map(([genre]) => genre)[0]; // Récupération du genre le plus fréquent
}

/**
 * Fonction générique pour récupérer des données depuis l'API Spotify et gérer les erreurs.
 * @param {Function} apiCall - La fonction effectuant l'appel API.
 * @param {string} errorMessage - Message d'erreur personnalisé.
 * @param {Function} transformData - Fonction de transformation des données.
 * @returns {Promise<any>} Résultat transformé de l'API Spotify.
 * @throws {Error} En cas d'échec de l'appel API.
 */
async function fetchSpotifyData(apiCall, errorMessage, transformData) {
  try {
    const { body } = await apiCall();
    return transformData(body);
  } catch (error) {
    if (error.statusCode) {
      throw new Error(`${errorMessage} : ${error.message}`);
    }
    throw new Error(`Erreur inattendue lors de l'appel API : ${error.message}`);
  }
}