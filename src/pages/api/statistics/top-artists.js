import { getUserTopListenedArtists } from '../../../services/musicStatsService';
import { 
  validateMethod,
  ensureDatabaseConnection,
  responseError
} from '../../../services/apiHandlerService';

/**
 * @swagger
 * /api/statistics/top-artists:
 *   get:
 *     summary: Récupère les 3 artistes les plus écoutés par un utilisateur
 *     description: Retourne une liste des artistes les plus écoutés d'un utilisateur donné,
 *                  classés par nombre d'écoutes.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Retourne la liste des artistes les plus écoutés.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 top_listened_artists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: Number
 *                         description: L'identifiant de l'utilisateur
 *                         example: 1 
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom d'un des artistes les plus écoutés par l'utilisateur
 *                         example: "Nom Artiste"
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
 *         description: Aucun artiste trouvé pour cet utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Aucun artiste trouvé pour cet utilisateur.
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
 * Gestionnaire de requête pour récupérer les artistes les plus écoutés par un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant la liste des artistes les plus écoutés.
 */
export default async function handler(req, res) {
  try {
    // Vérifie si la méthode HTTP est autorisée
    if (!validateMethod(req, res)) return;

    const { userId } = req.query;

    // Vérifie si le paramètre userId est fourni
    if (!userId) {
      return res.status(400).json({ error: "Requête invalide - `userId` manquant" });
    }

    // Vérifie la connexion à la base de données
    if (!(ensureDatabaseConnection())) return;

    // Récupère les artistes les plus écoutés de l'utilisateur
    const topArtists = await getUserTopListenedArtists(userId);

    // Vérifie si des artistes ont été trouvés
    if (!topArtists || topArtists.length === 0) {
      return res.status(404).json({ error: "Aucun artiste trouvé pour cet utilisateur." });
    }

    // Répond avec la liste des artistes
    return res.status(200).json({ top_listened_artists: topArtists });
  } catch (error) {
    console.error(error);
    responseError(res);
  }
}