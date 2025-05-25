/**
 * @fileoverview Endpoint API pour récupérer un artiste spécifique du top 3 d’un utilisateur.
 * Utilise un repository MongoDB pour accéder aux données, selon l’architecture Clean.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import { isValidUserId, isValidRanking } from 'infrastructure/utils/inputValidator.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MusicStatsService from 'core/services/musicStatsService.js';

/**
 * @swagger
 * /api/statistics/ranking/artist:
 *   get:
 *     summary: Récupère un artiste faisant parti du du top 3 des plus écoutés par l'utilisateur
 *     description: |
 *       Permet de récupérer le nom d'un artiste parmi les 3 les plus écoutés par un utilisateur donné,
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
 *         description: Classement de l'artiste dans le top 3 (1, 2 ou 3)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 3
 *     responses:
 *       200:
 *         description: Succès - Nom de l'artiste trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 artist_name:
 *                   type: string
 *                   maxLength: 255
 *                   description: Le nom de l'artiste correspondant au classsement donné
 *                   example: "The Weeknd"
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
 *         description: Aucun artiste trouvé pour cet utilisateur et ce classement
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
 * Handler API GET `/api/statistics/rankings/artist`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 * @returns {Promise<void>} - Résultat de la requête, JSON
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

    // Appelle le service pour récupérer l'artiste classé N
    const musicStatsService = new MusicStatsService({
      artistRepo: new MongoTopArtistRepository()
    });

    const artist = await musicStatsService.getArtistByRanking(userId, parseInt(ranking));

    if (!artist) return res.status(404).json({ error: 'Aucun artiste trouvé.' });

    res.status(200).json({ artist_name: artist.artist_name });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}