/**
 * @fileoverview Endpoint API pour récupérer une musique spécifique du top 3 d’un utilisateur.
 * Utilise un repository MongoDB selon l’architecture Clean pour accéder aux données musicales.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import { isValidUserId, isValidRanking } from 'infrastructure/utils/inputValidator.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';
import MusicStatsService from 'core/services/musicStatsService.js';

/**
 * @swagger
 * /api/statistics/ranking/music:
 *   get:
 *     summary: Récupère une musique faisant parti du du top 3 des plus écoutées par l'utilisateur
 *     description: |
 *       Permet de récupérer le nom d'une musique parmi les 3 les plus écoutées par un utilisateur donné,
 *       en fonction de son classement (1 à 3).
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant unique de l'utilisateur
 *         schema:
 *           type: string
 *       - in: query
 *         name: ranking
 *         required: true
 *         description: Classement de la musique dans le top 3 (1, 2 ou 3)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *     responses:
 *       200:
 *         description: Succès - Nom de la musique trouvée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 music_name:
 *                   type: string
 *                   description: Le nom de la musique correspondant au classsement donné
 *                   maxLength: 255
 *                   example: "Blinding Lights"
 *       400:
 *         description: Requête invalide (paramètre manquant ou invalide)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "userId et/ou ranking manquant(s)"
 *       404:
 *         description: Aucune musique trouvée pour cet utilisateur et ce classement
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
 * Handler API GET `/api/statistics/rankings/music`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 * @returns {Promise<void>} Réponse JSON contenant le nom de la musique
 */
export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res)) return;

  const { userId, ranking } = req.query;

  // Vérifie les paramètres requis
  if (!userId || !ranking) return res.status(400).json({ error: 'userId et/ou ranking manquant(s)' });

  if (!isValidUserId(userId)) {
    return res.status(400).json({ error: '`userId` doit être un UUID valide' });
  }

  if (!isValidRanking(ranking)) {
    return res.status(400).json({ error: '`ranking` doit être un entier entre 1 et 3' });
  }

  try {
    // Connexion à la base de données
    await connectToDatabase();

    const musicStatsService = new MusicStatsService({
      musicRepo: new MongoTopMusicRepository()
    });

    const music = await musicStatsService.getMusicByRanking(userId, parseInt(ranking));

    if (!music) return res.status(404).json({ error: 'Aucune musique trouvée.' });

    res.status(200).json({ music_name: music.music_name });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}