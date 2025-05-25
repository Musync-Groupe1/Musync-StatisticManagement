/**
 * @fileoverview Endpoint API pour récupérer la plateforme musicale utilisée par un utilisateur.
 * Utilise `UserService` pour accéder à la collection `User` et retourne le champ `music_platform`.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoUserRepository from 'infrastructure/database/mongo/MongoUserRepository.js';
import UserService from 'core/services/userService.js';
import { isValidUserId } from 'infrastructure/utils/inputValidator.js';

/**
 * @swagger
 * /api/statistics/platform:
 *   get:
 *     summary: Récupère la plateforme musicale utilisée par un utilisateur
 *     description: |
 *       Permet d’obtenir la plateforme musicale (Spotify, Soundcloud, etc.)
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
 *                   description: La plateforme musicale que l'utilisateur utilise
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
 *                   example: "Paramètre `userId` manquant ou invalide."
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
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 * @returns {Promise<void>} - Réponse JSON contenant la plateforme musicale, ou un message d’erreur.
 *
 * @example
 * {
 *   "music_platform": "spotify"
 * }
 */
export default async function handler(req, res) {
  // Vérifie la méthode HTTP
  if (!validateMethod(req, res)) return;

  const { userId } = req.query;

  // Vérification des paramètres requis et valides
  if (!userId || !isValidUserId(userId)) {
    return res.status(400).json({ error: 'Paramètre `userId` manquant ou invalide.' });
  }

  try {
    // Connexion à la base de données
    await connectToDatabase();

    const service = new UserService({
      userRepo: new MongoUserRepository()
    });

    const platform = await service.findPlatformByUserId(userId);

    if (!platform) return res.status(404).json({ error: 'Aucune plateforme trouvée.' });

    res.status(200).json({ music_platform: platform });
  } catch (e) {
    console.error(e);
    responseError(res);
  }
}