/**
 * @fileoverview Endpoint API pour supprimer toutes les statistiques d’un utilisateur.
 * Supprime les données liées à la plateforme, au genre préféré, au top artistes et musiques.
 * Envoie un message Kafka `USER_STATS_DELETED` après suppression.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import { createUserCleanupService } from 'core/factories/userCleanupServiceFactory.js';
import { publishStatDeleted } from 'core/events/producers/StatDeletedProducer.js';

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

/**
 * Fonction métier qui exécute la suppression des statistiques,
 * uniquement si l'utilisateur existe (logique gérée dans le service).
 * Kafka est déclenché uniquement si la suppression a lieu.
 *
 * @param {string} userId - ID utilisateur
 * @returns {{ status: number, body: object }}
 */
export async function cleanupUserStatsHandler(userId) {
  if (!userId) {
    return { status: 400, body: { error: 'Le champ `userId` est requis.' } };
  }

  const connected = await connectToDatabase();
  if (!connected) {
    return { status: 500, body: { error: 'Erreur de connexion à la base de données.' } };
  }

  const service = createUserCleanupService();

  try {
    const deleted = await service.deleteAllUserData(userId);

    // Si rien n’a été supprimé, cela veut dire que l’utilisateur n’existait pas
    if (!deleted) {
      return {
        status: 404,
        body: { error: 'Aucune statistique trouvée pour cet utilisateur.' }
      };
    }

    // Kafka : seulement si suppression effective
    await publishStatDeleted(userId);

    return {
      status: 200,
      body: { message: 'Toutes les données utilisateur ont été supprimées.' }
    };
  } catch (error) {
    console.error('Erreur dans /api/statistics/deleteUserStats :', error);
    return {
      status: 500,
      body: { error: 'Erreur interne du serveur.' }
    };
  }  
}

/**
 * Handler API Next.js
 */
export default async function handler(req, res) {
  if (!validateMethod(req, res, ['DELETE'])) return;

  try {
    const { userId } = req.query;
    const result = await cleanupUserStatsHandler(userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Erreur dans /api/statistics/deleteUserStats :', error);
    responseError(res);
  }
}