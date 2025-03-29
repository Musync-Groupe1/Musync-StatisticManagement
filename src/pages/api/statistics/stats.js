import { 
  getUserMusicPlatform, 
  getUserFavoriteGenre, 
  getUserTopListenedMusics, 
  getUserTopListenedArtists 
} from '../../../services/musicStatsService';
import { 
  validateMethod,
  ensureDatabaseConnection,
  responseError
} from '../../../services/apiHandlerService';

/**
 * @swagger
 * /api/statistics/stats:
 *   get:
 *     summary: Récupère les statistiques musicales d'un utilisateur
 *     description: Retourne le genre favori, la plateforme musicale,
 *                  les musiques et artistes les plus écoutés par un utilisateur.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Retourne les statistiques musicales de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: Number
 *                   description: L'identifiant de l'utilisateur
 *                   example: 1
 *                 favorite_genre:
 *                   type: string
 *                   maxLength: 255
 *                   description: Le genre musical préféré de l'utilisateur
 *                   example: "pop"
 *                 music_platform:
 *                   type: string
 *                   maxLength: 255
 *                   description: La plateforme musical que l'utilisateur utilise
 *                   example: "spotify"
 *                 top_listened_musics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       music_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom d'une des musiques les plus écoutées par l'utilisateur
 *                         example: "Nom Musique"
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom de l'artiste de la musique
 *                         example: "Nom Artiste"
 *                       ranking:
 *                         type: Number
 *                         description: Le classement de la musique
 *                         example: 1
 *                 top_listened_artists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom d'un des artistes les plus écoutés par l'utilisateur
 *                         example: "Artiste 1"
 *                       ranking:
 *                         type: Number
 *                         description: Le classement de l'artiste
 *                         example: 1
 *       400:
 *         description: Requête invalide - `userId` manquant.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Requête invalide - `userId` manquant.
 *       404:
 *         description: Aucune statistique trouvée pour cet utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Aucune statistique trouvée pour cet utilisateur.
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur interne du serveur.
 */

/**
 * Gestionnaire de requête pour récupérer les statistiques musicales d'un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant les statistiques musicales.
 */
export default async function handler(req, res) {
  try {
    // Vérifie si la méthode HTTP est autorisée
    if (!validateMethod(req, res)) return;

    const { userId } = req.query;

    // Vérifie si l'identifiant de l'utilisateur est fourni
    if (!userId) {
      return res.status(400).json({ error: "Requête invalide - `userId` manquant" });
    }

    // Vérifie la connexion à la base de données
    if (!(ensureDatabaseConnection())) return;

    // Récupération des statistiques utilisateur
    const [favoriteGenre, musicPlatform, topMusics, topArtists] = await Promise.all([
      getUserFavoriteGenre(userId),
      getUserMusicPlatform(userId),
      getUserTopListenedMusics(userId),
      getUserTopListenedArtists(userId)
    ]);

    // Vérifie si aucune donnée n'est disponible
    if (!favoriteGenre && !musicPlatform && 
       (!topMusics || topMusics.length === 0) &&
       (!topArtists || topArtists.length === 0)) {
      return res.status(404).json({ error: "Aucune statistique trouvée pour cet utilisateur." });
    }

    // Répond avec les statistiques trouvées
    return res.status(200).json({ 
      favorite_genre: favoriteGenre,
      music_platform: musicPlatform,
      top_listened_musics: topMusics,
      top_listened_artists: topArtists
    });
  } catch (error) {
    console.error(error);
    responseError(res);
  }
}