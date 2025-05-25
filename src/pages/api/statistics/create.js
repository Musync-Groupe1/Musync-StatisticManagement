/**
 * @fileoverview Endpoint pour insérer ou mettre à jour un utilisateur dans la collection `User`.
 * Ce point d'entrée est destiné à être appelé automatiquement par le Kafka consumer
 * après réception d’un message sur le topic "user". Il ne valide que les plateformes musicales supportées.
 */

import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import MongoUserRepository from 'infrastructure/database/mongo/MongoUserRepository.js';
import UserService from 'core/services/userService.js';
import {isValidUserId, isValidMusicPlatform} from 'infrastructure/utils/inputValidator.js';

/**
 * @swagger
 * /api/statistics/create:
 *   post:
 *     summary: Crée ou met à jour un utilisateur en base MongoDB
 *     description:
 *       Endpoint utilisé par un consumer Kafka pour insérer ou mettre à jour
 *       un utilisateur avec son ID et sa plateforme musicale.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - music_platform
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: Identifiant unique de l'utilisateur
 *                 example: "fd961a0f-c94c-47ca-b0d9-8592e1fb79d1"
 *               music_platform:
 *                 type: string
 *                 description: >
 *                   Plateforme musicale utilisée (ex: spotify)
 *                 enum: [spotify]
 *                 example: spotify
 *     responses:
 *       201:
 *         description: Utilisateur créé ou mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur créé ou mis à jour avec succès.
 *                 user:
 *                   type: object
 *                   description: Document utilisateur inséré/mis à jour
 *       400:
 *         description: Paramètre invalide ou manquant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Paramètre `userId` invalide.
 *       405:
 *         description: Méthode HTTP non autorisée
 *       500:
 *         description: Erreur interne du serveur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erreur serveur.
 */

/**
 * Handler API POST `/api/statistics/create`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { userId, music_platform } = req.body;

  // Vérification des paramètres
  if (!isValidUserId(userId)) {
    return res.status(400).json({ error: 'Paramètre "userId" invalide : un UUID est requis.' });
  }

  if (!isValidMusicPlatform(music_platform)) {
    return res.status(400).json({ error: 'Plateforme musicale non supportée.' });
  }

  try {
    await connectToDatabase();

    const userService = new UserService({
      userRepo: new MongoUserRepository()
    });

    const user = await userService.updateOrCreate(userId, music_platform);

    res.status(201).json({
      message: 'Utilisateur créé ou mis à jour avec succès.',
      user,
    });
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour de l’utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}