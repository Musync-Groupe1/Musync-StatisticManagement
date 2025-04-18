/**
 * @fileoverview Endpoint API pour récupérer le genre musical préféré d’un utilisateur.
 * Fait appel au service métier `MusicStatsService` et au repository MongoDB.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MusicStatsService from 'core/services/musicStatsService.js';

/**
 * @swagger
 * /api/statistics/favorite-genre:
 *   get:
 *     summary: Récupère le genre musical favori d’un utilisateur
 *     description: Retourne le genre musical le plus fréquent écouté par l'utilisateur.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant unique de l'utilisateur.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Genre musical trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite_genre:
 *                   type: string
 *                   maxLength: 255
 *                   description: Le genre musical préféré de l'utilisateur
 *                   example: "pop"
 *       400:
 *         description: Requête invalide - userId manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "userId manquant"
 *       404:
 *         description: Aucun genre trouvé pour cet utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Aucun genre trouvé."
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
 * Handler API GET `/api/statistics/favorite-genre`
 *
 * @param {Object} req - Requête HTTP entrante
 * @param {Object} res - Réponse HTTP sortante
 * @returns {Promise<void>} Réponse JSON contenant le genre favori
 */
export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res)) return;

  const { userId } = req.query;

  // Vérifie le paramètre requis
  if (!userId) return res.status(400).json({ error: 'userId manquant' });

  try {
    // Connexion à la base de données
    const connected = await connectToDatabase();
    if (!connected) return res.status(500).json({ error: 'Erreur de connexion à la base de données.' });

    // Service + repo injectés
    const service = new MusicStatsService({
      userStatsRepo: new MongoUserStatsRepository()
    });

    const genre = await service.getFavoriteGenre(userId);

    if (!genre) return res.status(404).json({ error: 'Aucun genre trouvé.' });

    res.status(200).json({ favorite_genre: genre });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}