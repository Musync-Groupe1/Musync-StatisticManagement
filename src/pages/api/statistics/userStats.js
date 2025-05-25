/**
 * @fileoverview Endpoint API pour récupérer toutes les statistiques musicales d’un utilisateur :
 * genre favori, top musiques et artistes.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';

import MusicStatsService from 'core/services/musicStatsService.js';
import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';
import { isValidUserId, isUserStatsEmpty } from 'infrastructure/utils/inputValidator.js';

/**
 * @swagger
 * /api/statistics/userStats:
 *   get:
 *     summary: Récupère toutes les statistiques musicales d’un utilisateur
 *     description: |
 *       Retourne l’ensemble des données disponibles sur un utilisateur :
 *       genre préféré, top artistes et top musiques écoutés.
 *     parameters:
 *       - in: query
 *         name: userId
 *         format: uuid
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Données utilisateur récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: string
 *                   description: L'identifiant de l'utilisateur
 *                   example: "fd961a0f-c94c-47ca-b0d9-8592e1fb79d1"
 *                 favorite_genre:
 *                   type: string
 *                   maxLength: 255
 *                   description: Le genre musical préféré de l'utilisateur
 *                   example: "rock"
 *                 top_listened_artists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom d'un des artistes les plus écoutés par l'utilisateur
 *                         example: "Radiohead"
 *                       ranking:
 *                         type: integer
 *                         description: Le classement de l'artiste
 *                         example: 1
 *                 top_listened_musics:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       music_name:
 *                         type: string
 *                         description: Le nom d'une des musiques les plus écoutées par l'utilisateur
 *                         example: "Creep"
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom de l'artiste de la musique
 *                         example: "Radiohead"
 *                       ranking:
 *                         type: integer
 *                         description: Le classement de la musique
 *                         example: 2
 *       400:
 *         description: Requête invalide - paramètre `userId` manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "`userId` est requis."
 *       404:
 *         description: Aucune statistique trouvée pour cet utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucune statistique trouvée pour cet utilisateur."
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
 * Handler API GET `/api/statistics/userStats`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 * @returns {Promise<void>} - Réponse JSON contenant toutes les statistiques de l’utilisateur
 * 
 * @example
 * {
 *   "user_id": "fd961a0f-c94c-47ca-b0d9-8592e1fb79d1",
 *   "favorite_genre": "rap",
 *   "top_listened_artists": [{ artist_name: "Eminem", ranking: 1 }],
 *   "top_listened_musics": [{ music_name: "Lose Yourself", artist_name: "Eminem", ranking: 1 }]
 * }
 */
export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res, ['GET'])) return;

  const { userId } = req.query;

  // Vérifie le paramètre requis
  if (!userId || !isValidUserId(userId)) {
    return res.status(400).json({ error: 'Paramètre `userId` manquant ou invalide.' });
  }

  try {
    // Connexion à la base de données
    await connectToDatabase();

    // Appelle les repository pour récupérer les données de l'utilisateur
    const service = new MusicStatsService({
      userStatsRepo: new MongoUserStatsRepository(),
      artistRepo: new MongoTopArtistRepository(),
      musicRepo: new MongoTopMusicRepository()
    });

    const stats = await service.getCompleteStats(userId);

    if (isUserStatsEmpty(stats)) {
      return res.status(404).json({ error: 'Aucune statistique trouvée pour cet utilisateur.' });
    }

    res.status(200).json({
      user_id: userId,
      favorite_genre: stats.favorite_genre || null,
      top_listened_artists: stats.top_listened_artists || [],
      top_listened_musics: stats.top_listened_musics || []
    });
  } catch (error) {
    console.error(error);
    responseError(res);
  }
}