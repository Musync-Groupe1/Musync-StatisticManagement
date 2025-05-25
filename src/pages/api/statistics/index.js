/**
 * @fileoverview Endpoint API pour récupérer et stocker les statistiques musicales d’un utilisateur.
 * Utilise le pattern Strategy + UseCase pour s’adapter à plusieurs plateformes musicales (Spotify...).
 * Gère aussi la logique OAuth 2.0 (étape de redirection puis récupération du code).
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
import { isValidUserId, isValidMusicPlatform } from 'infrastructure/utils/inputValidator.js';

/**
 * @swagger
 * /api/statistics:
 *   get:
 *     summary: Récupère et stocke les statistiques musicales d’un utilisateur
 *     description: |
 *       Ce endpoint gère le processus OAuth 2.0 :
 *       - Il redirige l’utilisateur vers une plateforme musicale (Spotify) s’il n’a pas encore autorisé l’accès.
 *       - Il traite le retour avec un code OAuth pour extraire et sauvegarder les données musicales.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: false
 *         description: ID de l’utilisateur pour lancer la redirection OAuth
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         required: false
 *         description: Plateforme musicale ciblée (spotify, ...)
 *         schema:
 *           type: string
 *           enum: [spotify]
 *       - in: query
 *         name: code
 *         required: false
 *         description: Code d’autorisation OAuth (retourné par Spotify)
 *         schema:
 *           type: string
 *       - in: query
 *         name: state
 *         required: false
 *         description: Paramètre de sécurité encodé par l’application
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistiques musicales sauvegardées avec succès
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
 *                   example: 3
 *                 top_musics_saved:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Requête invalide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "`userId`, `platform` et `code` sont requis."
 *       500:
 *         description: Erreur serveur
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
 * Handler principal GET `/api/statistics`
 *
 * @param {Request} req - Objet de la requête HTTP
 * @param {Response} res - Objet de la réponse HTTP
 * @returns {Promise<void>} - Réponse JSON avec confirmation et compteurs d’insertions
 */
export default async function handler(req, res) {
  if (!validateMethod(req, res, ['GET'])) return;

  const { userId, code, state } = req.query;

  try {
    // Étape 1 : Redirection OAuth si pas encore d'autorisation
    if (!code && userId) {
      return await handleOAuthRedirect(res, userId);
    }

    // Étape 2 : Traitement retour OAuth avec code/state
    if (!code || !state) {
      return res.status(400).json({ error: '`code` et `state` sont requis après redirection.' });
    }

    return await handleOAuthCallback(res, code, state);
  } catch (error) {
    console.error('[Statistics Endpoint] Erreur générale :', error);
    responseError(res);
  }
}

/**
 * Gère le premier appel sans `code` OAuth : redirige l'utilisateur vers la plateforme musicale (ex: Spotify).
 *
 * @async
 * @function handleOAuthRedirect
 * @param {Response} res  - Objet de réponse HTTP Next.js
 * @param {string} userId - Identifiant utilisateur reçu dans la requête
 * @returns {Promise<Response>}  - Redirection vers l'URL OAuth ou erreur
 */
async function handleOAuthRedirect(res, userId) {
  if (!userId || !isValidUserId(userId)) {
    return res.status(400).json({ error: 'Paramètre `userId` manquant ou invalide.' });
  }

  await connectToDatabase();
  const userService = new UserService({ userRepo: new MongoUserRepository() });
  const user = await userService.findByUserId(userId);

  if (!user) {
    return res.status(404).json({ error: 'Utilisateur introuvable.' });
  }

  if (!user.music_platform || !isValidMusicPlatform(user.music_platform)) {
    return res.status(400).json({ error: 'Plateforme musicale non supportée ou manquante.' });
  }

  switch (user.music_platform) {
    case 'spotify': {
      const redirectUrl = generateSpotifyAuthUrl(userId, user.music_platform);
      return res.redirect(redirectUrl);
    }
    default:
      return res.status(400).json({ error: `Plateforme non supportée : ${user.music_platform}` });
  }
}

/**
 * Gère le retour OAuth avec `code` et `state` : décode le state, sélectionne la stratégie,
 * exécute le use case de récupération/sauvegarde des statistiques musicales.
 *
 * @async
 * @function handleOAuthCallback
 * @param {Response} res - Objet de réponse HTTP
 * @param {string} code - Code OAuth reçu après redirection (ex: de Spotify)
 * @param {string} state - Chaîne encodée contenant userId et platform
 * @returns {Promise<Response>} - Résultat JSON avec confirmation de sauvegarde
 */
async function handleOAuthCallback(res, code, state) {
  let parsedState;

  try {
    parsedState = decodeSpotifyState(state);
  } catch (err) {
    return res.status(400).json({ error: 'State invalide ou corrompu : ' + err.message });
  }

  const resolvedUserId = parsedState.userId;
  const resolvedPlatform = parsedState.platform;

  if (!isValidUserId(resolvedUserId) || !isValidMusicPlatform(resolvedPlatform)) {
    return res.status(400).json({ error: '`userId` ou `platform` invalide(s) dans le state OAuth.' });
  }

  const strategy = await getPlatformStrategy(resolvedPlatform, code);

  const usecase = new FetchUserMusicStats({
    strategy,
    userId: resolvedUserId,
    userStatRepo: new MongoUserStatsRepository(),
    artistRepo: new MongoTopArtistRepository(),
    musicRepo: new MongoTopMusicRepository()
  });

  const result = await usecase.execute();

  return res.status(200).json({
    message: 'Statistiques utilisateur mises à jour.',
    top_artists_saved: result.savedArtists.length,
    top_musics_saved: result.savedMusics.length
  });
}