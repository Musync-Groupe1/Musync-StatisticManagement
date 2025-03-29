import { getUserMusicPlatform } from '../../../services/musicStatsService';
import { 
  validateMethod,
  ensureDatabaseConnection,
  responseError
} from '../../../services/apiHandlerService';

/**
 * @swagger
 * /api/statistics/platform:
 *   get:
 *     summary: Récupère la plateforme musicale utilisée d'un utilisateur
 *     description: Retourne la plateforme de streaming musical utilisée par l'utilisateur.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Retourne la plateforme musicale préférée de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 music_platform:
 *                   type: string
 *                   maxLength: 255
 *                   description: La plateforme musical que l'utilisateur utilise
 *                   example: "spotify"
 *       400:
 *         description: Requête invalide - `userId` est requis.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Requête invalide - `userId` est requis"
 *       404:
 *         description: Aucune plateforme trouvée pour cet utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucune plateforme trouvée pour cet utilisateur."
 *       500:
 *         description: Erreur interne du serveur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur."
 */

/**
 * Gestionnaire de requête pour récupérer la plateforme musicale préférée d'un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant la plateforme musicale préférée.
 */
export default async function handler(req, res) {
  try {
    // Vérifie si la méthode HTTP est autorisée
    if (!validateMethod(req, res)) return;

    const { userId } = req.query;

    // Vérifie si l'identifiant de l'utilisateur est fourni
    if (!userId) {
      return res.status(400).json({ error: 'Requête invalide - `userId` manquant' });
    }

    // Vérifie la connexion à la base de données
    if (!ensureDatabaseConnection()) return;

    // Récupère la plateforme musicale de l'utilisateur
    const platform = await getUserMusicPlatform(userId);

    // Vérifie si une plateforme a été trouvée
    if (!platform) {
      return res.status(404).json({ error: "Aucune plateforme trouvée pour cet utilisateur." });
    }

    // Répond avec la plateforme trouvée
    res.status(200).json({ music_platform: platform });
  } catch (error) {
    console.error(error);
    responseError(res);
  }
}