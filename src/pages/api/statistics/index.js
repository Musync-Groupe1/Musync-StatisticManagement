/**
 * @fileoverview Endpoint API pour récupérer et stocker les statistiques musicales d’un utilisateur.
 * Utilise le pattern Strategy + UseCase pour s’adapter à plusieurs plateformes de streaming (Spotify, Deezer...).
 * La logique OAuth (redirection, code, state) est gérée pour Spotify.
 */

import { validateMethod, responseError } from 'infrastructure/utils/apiHandler.js';
import connectToDatabase from 'infrastructure/database/mongooseClient.js';

import { getPlatformStrategy } from 'core/factories/PlatformFactory.js';
import FetchUserMusicStats from 'core/usecases/FetchUserMusicStats.js';

import MongoUserStatsRepository from 'infrastructure/database/mongo/MongoUserStatsRepository.js';
import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';
import MongoUserRepository from 'infrastructure/database/mongo/MongoUserRepository.js';

import UserService from 'core/services/userService.js';

import { generateSpotifyAuthUrl, decodeSpotifyState } from 'infrastructure/services/spotifyAuthService.js';

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Récupère et stocke les statistiques musicales d’un utilisateur
 *     description: |
 *       Utilise un code d’autorisation OAuth pour interroger une API de plateforme musicale
 *       (ex : Spotify) et stocker les artistes, musiques et genres favoris dans la base MongoDB.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: Identifiant unique de l’utilisateur
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         required: true
 *         description: La plateforme musical que l'utilisateur utilise
 *         schema:
 *           type: string
 *           enum: [spotify, deezer]
 *       - in: query
 *         name: code
 *         required: true
 *         description: Code d’autorisation OAuth de la plateforme
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: false
 *         description: Paramètre encodé pour sécuriser l’échange OAuth
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Succès - Statistiques récupérées et enregistrées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Statistiques utilisateur mises à jour."
 *                 top_artists_saved:
 *                   type: integer
 *                   description: Nombre d'artistes qui a été récupéré et sauvegardé
 *                   example: 3
 *                 top_musics_saved:
 *                   type: integer
 *                   description: Nombre de musiques qui a été récupéré et sauvegardé
 *                   example: 3
 *       400:
 *         description: Requête invalide - paramètres manquants
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "`userId`, `platform` et `code` sont requis."
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
 * Handler API GET `/api/statistics`
 *
 * Ce endpoint gère deux cas :
 * 1. S’il n’y a pas de `code` (première visite), on redirige l’utilisateur vers Spotify pour autorisation.
 * 2. Sinon, on reçoit un `code` et un `state`, on échange le token, puis on récupère les statistiques musicales.
 *
 * Ce processus s’appuie sur :
 * - Le pattern OAuth 2.0 avec redirection
 * - Une factory de stratégies pour supporter plusieurs plateformes
 * - Un use case centralisé (FetchUserMusicStats) pour orchestrer les opérations
 *
 * @param {Object} req - Requête HTTP entrante
 * @param {Object} res - Réponse HTTP sortante
 * @returns {Promise<void>} - Réponse JSON avec confirmation et compteurs d’insertions
 */
export default async function handler(req, res) {
  if (!validateMethod(req, res, ['GET'])) return;

  const { userId, code, state } = req.query;

  try {
    await connectToDatabase();
    const userService = new UserService({ userRepo: new MongoUserRepository() });

    // 1. Cas initial : redirection OAuth (pas de code, mais userId présent)
    if (!code && userId) {
      const user = await userService.findByUserId(Number(userId));

      if (!user) {
        res.status(404).json({ error: 'Utilisateur introuvable.' });
        return;
      }

      if (!user.music_platform) {
        res.status(400).json({ error: 'Aucune plateforme musicale définie pour cet utilisateur.' });
        return;
      }

      switch (user.music_platform) {
        case 'spotify': {
          const redirectUrl = generateSpotifyAuthUrl(userId, user.music_platform);
          res.redirect(redirectUrl);
          return;
        }
        default:
          res.status(400).json({ error: `Plateforme non supportée : ${user.music_platform}` });
          return;
      }
    }

    // 2. Cas retour OAuth (avec code + state)
    if (!code || !state) {
      res.status(400).json({ error: '`code` et `state` sont requis après redirection.' });
      return;
    }

    let parsedState;
    try {
      parsedState = decodeSpotifyState(state);
    } catch (err) {
      res.status(400).json({ error: 'State invalide ou corrompu : ' + err.message });
      return;
    }

    const resolvedUserId = Number(parsedState.userId);
    const resolvedPlatform = parsedState.platform;

    if (!resolvedUserId || !resolvedPlatform) {
      res.status(400).json({ error: '`userId` et `platform` manquants dans le state OAuth.' });
      return;
    }

    // Utilisation de la stratégie adaptée
    const strategy = await getPlatformStrategy(resolvedPlatform, code);

    const usecase = new FetchUserMusicStats({
      strategy,
      userId: resolvedUserId,
      userStatRepo: new MongoUserStatsRepository(),
      artistRepo: new MongoTopArtistRepository(),
      musicRepo: new MongoTopMusicRepository()
    });

    const result = await usecase.execute();

    res.status(200).json({
      message: 'Statistiques utilisateur mises à jour.',
      top_artists_saved: result.savedArtists.length,
      top_musics_saved: result.savedMusics.length
    });
  } catch (error) {
    console.error('Erreur dans /api/statistics :', error);
    responseError(res);
  }
}