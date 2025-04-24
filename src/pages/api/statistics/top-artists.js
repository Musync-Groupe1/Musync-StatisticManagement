/**
 * @fileoverview Endpoint API pour récupérer les 3 artistes les plus écoutés par un utilisateur.
 * Utilise un repository MongoDB pour accéder aux données, dans une architecture orientée domaine.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MusicStatsService from 'core/services/musicStatsService.js';

/**
 * @swagger
 * /api/statistics/top-artists:
 *   get:
 *     summary: Récupère les 3 artistes les plus écoutés par un utilisateur
 *     description: |
 *       Retourne les artistes les plus écoutés, triés par classement, pour un utilisateur donné.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant unique de l'utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Liste des artistes trouvée
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
 *                         example: "Billie Eilish"
 *                       ranking:
 *                         type: integer
 *                         description: Le classement de l'artiste
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
 *         description: Aucun artiste trouvé pour cet utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucun artiste trouvé."
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
 * Handler API GET `/api/statistics/top-artists`
 *
 * @param {Object} req - Objet de la requête HTTP
 * @param {Object} res - Objet de la réponse HTTP
 * @returns {Promise<void>} - Réponse contenant les artistes les plus écoutés
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

    // Appelle le service pour récupérer les artistes
    const service = new MusicStatsService({
      artistRepo: new MongoTopArtistRepository()
    });

    const artists = await service.getUserTopListenedArtists(userId);

    if (!artists?.length) return res.status(404).json({ error: 'Aucun artiste trouvé.' });

    res.status(200).json({ top_listened_artists: artists });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}