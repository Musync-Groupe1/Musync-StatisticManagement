import { getUserFavoriteGenre } from '../../../services/musicStatsService';
import { 
  validateMethod,
  ensureDatabaseConnection,
  responseError
} from '../../../services/apiHandlerService';

/**
 * @swagger
 * /api/statistics/favorite-genre:
 *   get:
 *     summary: Récupère le genre musical favori d'un utilisateur
 *     description: Retourne le genre musical favori
 *                  en fonction des artistes les plus écoutés par l'utilisateur.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Retourne le genre favori de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite_genre:
 *                   type: string
 *                   maxLength: 255
 *                   description: Le genre musical préféré de l'utilisateur
 *                   example: "spotify"
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
 *         description: Aucun genre musical trouvé pour cet utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Aucun genre musical trouvé pour cet utilisateur.
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
 * Gestionnaire de requête pour récupérer le genre musical favori d'un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant le genre favori.
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

    // Récupère le genre musical favori de l'utilisateur
    const favoriteGenre = await getUserFavoriteGenre(userId);

    // Vérifie si un genre musical a été trouvé
    if (!favoriteGenre) {
      return res.status(404).json({ error: "Aucun genre musical trouvé pour cet utilisateur." });
    }

    // Répond avec le genre musical favori
    return res.status(200).json({ favorite_genre: favoriteGenre });
  } catch (error) {
    console.error(error);
    responseError(res);
  }
}