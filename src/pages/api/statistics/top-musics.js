import { getUserTopListenedMusics } from '../../../services/musicStatsService';
import { 
  validateMethod,
  ensureDatabaseConnection,
  responseError
} from '../../../services/apiHandlerService';


/**
 * @swagger
 * /api/statistics/top-musics:
 *   get:
 *     summary: Récupère les 3 musiques les plus écoutées par un utilisateur
 *     description: Retourne la liste des musiques les plus écoutées par un utilisateur,
 *                  classées par écoutes.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des musiques les plus écoutées par l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 top_listened_musics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: Number
 *                         description: L'identifiant de l'utilisateur
 *                         example: 1 
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
 *         description: Aucun musique trouvée pour cet utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Aucune musique trouvée pour cet utilisateur.
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
 * Gestionnaire de requête pour récupérer les musiques les plus écoutées par un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant les musiques les plus écoutées.
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
    if (!(ensureDatabaseConnection(res))) return;

    // Récupération des musiques les plus écoutées
    const topMusics = await getUserTopListenedMusics(userId);

    // Vérifie si des musiques ont été trouvées
    if (!topMusics || topMusics.length === 0) {
      return res.status(404).json({ error: "Aucun musique trouvée pour cet utilisateur." });
    }

    // Répond avec la liste des musiques les plus écoutées
    return res.status(200).json({ top_listened_musics: topMusics });
  } catch (error) {
    responseError(req, res, error);
  }
}