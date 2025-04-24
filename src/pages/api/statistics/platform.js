/**
 * @fileoverview Endpoint API pour récupérer la plateforme musicale utilisée par un utilisateur.
 * S'appuie sur le service `MusicStatsService` et le repository MongoDB.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MusicStatsService from 'core/services/musicStatsService.js';

/**
 * @swagger
 * /api/statistics/platform:
 *   get:
 *     summary: Récupère la plateforme musicale utilisée par un utilisateur
 *     description: |
 *       Permet d’obtenir la plateforme de streaming (Spotify, Deezer, etc.)
 *       sur laquelle les statistiques musicales ont été collectées.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant unique de l’utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Plateforme trouvée
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
 *         description: Requête invalide - `userId` manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "userId manquant"
 *       404:
 *         description: Aucune plateforme trouvée pour cet utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucune plateforme trouvée."
 *       500:
 *         description: Erreur interne du serveur
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
 * Handler API GET `/api/statistics/platform`
 *
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 * @returns {Promise<void>} - Objet JSON contenant `music_platform`
 */
export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res)) return;

  const { userId } = req.query;

  // Vérifie le paramètre requis
  if (!userId) return res.status(400).json({ error: 'userId manquant' });

  try {
    // Connexion à la base de données
    await connectToDatabase();

    const service = new MusicStatsService({
      userStatsRepo: new MongoUserStatsRepository()
    });

    const platform = await service.getMusicPlatform(userId);

    if (!platform) return res.status(404).json({ error: 'Aucune plateforme trouvée.' });

    res.status(200).json({ music_platform: platform });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}