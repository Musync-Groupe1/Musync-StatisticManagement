import { getMusicByUserAndRanking } from '../../../../services/musicStatsService';
import { 
  validateMethod,
  ensureDatabaseConnection,
  responseError
} from '../../../../services/apiHandlerService';

/**
 * @swagger
 * /api/statistics/rankings/music:
 *   get:
 *     summary: Récupère une musique spécifique du top 3 écouté par un utilisateur
 *     description: Retourne le nom de la musique en fonction de son classement
 *                  dans le top 3 des musiques les plus écoutées par un utilisateur donné.
 *     parameters:
 *       - name: userId
 *         in: query
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *       - name: ranking
 *         in: query
 *         required: true
 *         description: Classement de la musique (1, 2 ou 3).
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *     responses:
 *       200:
 *         description: Succès - Retourne le nom de la musique correspondant au classement donné.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 music_name:
 *                   type: string
 *                   description: Le nom de la musique correspondant au classsement donné
 *                   maxLength: 255
 *                   example: "pop"
 *       400:
 *         description: Requête invalide - `userId` et/ou `ranking` manquant(s), 
 *                      ou Requête invalide - `ranking` doit être compris entre 1 et 3.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Requête invalide - `userId` et/ou `ranking` manquant(s).
 *       404:
 *         description: Aucune musique trouvée pour cet utilisateur et ce classement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Aucune musique trouvée pour cet utilisateur et ce classement.
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
 * Gestionnaire de requête pour récupérer une musique du top 3 écouté par un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant le nom de la musique.
 */
export default async function handler(req, res) {
  try {
    // Vérifie si la méthode HTTP est autorisée
    if (!validateMethod(req, res)) return;

    const { userId, ranking } = req.query;

    // Vérifie si les paramètres requis sont fournis
    if (!userId || !ranking) {
      return res.status(400).json({ error: "Requête invalide - `userId` et/ou `ranking` manquant(s)" });
    }

    const rankingNumber = parseInt(ranking);

    // Vérifie si le classement est valide (entre 1 et 3)
    if(rankingNumber < 1 || rankingNumber > 3) {
      return res.status(400).json({ error: "Requête invalide - `ranking` doit être compris entre 1 et 3" });
    }

    // Vérifie la connexion à la base de données
    if (!(ensureDatabaseConnection(res))) return;

    // Récupère la musique en fonction du classement
    const musicName = await getMusicByUserAndRanking(userId, rankingNumber);

    // Vérifie si une musique a été trouvée
    if (!musicName) {
      return res.status(404).json({ error: "Aucune musique trouvée pour cet utilisateur et ce classement." });
    }

    // Répond avec le nom de la musique
    return res.status(200).json({ music_name: musicName });
  } catch (error) {
    responseError(req, res, error);
  }
}