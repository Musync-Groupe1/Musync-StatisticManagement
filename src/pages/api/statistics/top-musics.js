/**
 * @fileoverview Endpoint API pour récupérer les 3 musiques les plus écoutées par un utilisateur.
 * S'appuie sur le service `MusicStatsService` et un repository MongoDB pour les statistiques musicales.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';
import MusicStatsService from 'core/services/musicStatsService.js';
import { isValidUserId } from 'infrastructure/utils/inputValidator.js';

/**
 * @swagger
 * /api/statistics/top-musics:
 *   get:
 *     summary: Récupère les 3 musiques les plus écoutées par un utilisateur
 *     description: |
 *       Retourne la liste des musiques les plus écoutées par un utilisateur donné,
 *       triées par classement (1 à 3).
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant unique de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Liste des musiques trouvée
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
 *                         type: string
 *                         description: L'identifiant de l'utilisateur
 *                         example: "fd961a0f-c94c-47ca-b0d9-8592e1fb79d1"
 *                       music_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom d'une des musiques les plus écoutées par l'utilisateur
 *                         example: "Blinding Lights"
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom de l'artiste de la musique
 *                         example: "The Weeknd"
 *                       ranking:
 *                         type: integer
 *                         description: Le classement de la musique
 *                         example: 1
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
 *         description: Aucune musique trouvée pour cet utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucune musique trouvée."
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
 * Handler API GET `/api/statistics/top-musics`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 * @returns {Promise<void>} - Réponse contenant la liste des 3 musiques les plus écoutées
 * 
 * @example
 * {
 *   "top_listened_musics": [
 *     { "user_id": 42, "music_name": "Blinding Lights", "artist_name": "The Weeknd", "ranking": 1 },
 *     { "user_id": 42, "music_name": "Levitating", "artist_name": "Dua Lipa", "ranking": 2 },
 *     { "user_id": 42, "music_name": "Save Your Tears", "artist_name": "The Weeknd", "ranking": 3 }
 *   ]
 * }
 */
export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res)) return;

  const { userId } = req.query;

  // Vérifie le paramètre requis
  if (!userId || !isValidUserId(userId)) {
    return res.status(400).json({ error: 'Paramètre `userId` manquant ou invalide.' });
  }

  try {
    // Connexion à la base de données
    await connectToDatabase();

    // Appelle le service pour récupérer les musiques
    const service = new MusicStatsService({
      musicRepo: new MongoTopMusicRepository()
    });

    const musics = await service.getUserTopListenedMusics(userId);

    if (!musics?.length) return res.status(404).json({ error: 'Aucune musique trouvée.' });

    res.status(200).json({ top_listened_musics: musics });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}