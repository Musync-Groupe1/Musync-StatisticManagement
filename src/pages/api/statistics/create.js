/**
 * @fileoverview Endpoint temporaire pour créer un utilisateur dans la collection `User`.
 * Permet de tester manuellement l’insertion dans la base sans validation stricte.
 */

import connectToDatabase from 'infrastructure/database/mongooseClient.js';
import User from 'infrastructure/models/User.js';

/**
 * Handler API POST `/api/user/create`
 *
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { userId, platform } = req.query;

  try {
    await connectToDatabase();

    const createdUser = await User.create({
      user_id: userId,
      music_platform: platform,
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès.',
      user: createdUser,
    });
  } catch (error) {
    console.error('Erreur lors de la création de l’utilisateur :', error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
}