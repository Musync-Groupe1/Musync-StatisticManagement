/**
 * @fileoverview Endpoint API pour supprimer toutes les statistiques d’un utilisateur.
 * Supprime les données liées à la plateforme, au genre préféré, au top artistes et musiques.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';

import UserCleanupService from 'core/services/userCleanupService.js';
import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';

/**
 * @swagger
 * /api/statistics/deleteUserStats:
 *   delete:
 *     summary: Supprime toutes les données statistiques d’un utilisateur
 *     description: |
 *       Supprime l’intégralité des données liées à un utilisateur dans la base :
 *       - plateforme musicale
 *       - genre préféré
 *       - artistes top 3
 *       - musiques top 3
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant de l’utilisateur à nettoyer
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Suppression réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Toutes les données utilisateur ont été supprimées."
 *       400:
 *         description: Paramètre `userId` manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Le champ `userId` est requis."
 *       500:
 *         description: Erreur interne serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erreur interne du serveur."
 */

export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res, ['DELETE'])) return;

  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ error: 'Le champ `userId` est requis.' });
  }

  try {
    await connectToDatabase();

    const service = new UserCleanupService({
      userStatsRepo: new MongoUserStatsRepository(),
      artistRepo: new MongoTopArtistRepository(),
      musicRepo: new MongoTopMusicRepository(),
    });

    await service.deleteAllUserData(userId);

    return res.status(200).json({
      message: 'Toutes les données utilisateur ont été supprimées.'
    });
  } catch (error) {
    console.error('Erreur dans /api/statistics/cleanup :', error);
    responseError(res);
  }
}