/**
 * @fileoverview Endpoint API pour supprimer toutes les statistiques d’un utilisateur.
 * Supprime la plateforme, le genre musical, les artistes et musiques les plus écoutés.
 * Déclenche également un message Kafka (`USER_STATS_DELETED`) si suppression effective.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import { createUserCleanupService } from 'core/factories/userCleanupServiceFactory.js';
import { publishStatDeleted } from 'core/events/producers/StatDeletedProducer.js';
import { isValidUserId } from 'infrastructure/utils/inputValidator.js';

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
 *       Envoie ensuite un message Kafka `USER_STATS_DELETED` si la suppression a été effectuée.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: Identifiant de l'utilisateur cible
 *     responses:
 *       200:
 *         description: Données supprimées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Toutes les données utilisateur ont été supprimées.
 *       400:
 *         description: Paramètre manquant ou invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Le champ `userId` est requis et doit être un entier valide.
 *       404:
 *         description: Aucune donnée trouvée pour cet utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Aucune statistique trouvée pour cet utilisateur.
 *       500:
 *         description: Erreur interne serveur
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
 * Handler API DELETE `/api/statistics/deleteUserStats`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
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

/**
 * Supprime toutes les statistiques d’un utilisateur si celui-ci existe,
 * et publie un message Kafka si la suppression a eu lieu.
 *
 * @param {string|number} userId - Identifiant de l’utilisateur
 * @returns {Promise<{status: number, body: object}>} Résultat de la suppression
 */
async function cleanupUserStatsHandler(userId) {
  // Vérification des paramètres requis
  if (!userId || !isValidUserId(userId)) {
    return {
      status: 400,
      body: { error: 'Le champ `userId` est requis et doit être un entier valide.' },
    };
  }

  const connected = await connectToDatabase();
  if (!connected) {
    return {
      status: 500,
      body: { error: 'Erreur de connexion à la base de données.' },
    };
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