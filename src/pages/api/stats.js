import { getSpotifyStats, getAccessTokenFromCode } from '../../services/spotifyService';
import { getUserStats as getAppleMusicStats } from '../../services/appleMusicService';
import { validateMethod, ensureDatabaseConnection } from '../../services/apiHandlerService';
import { UserMusicStatistic } from '../../models/UserStats';
import {TopListenedMusic} from '../../models/TopListenedMusic';
import {TopListenedArtist} from '../../models/TopListenedArtist';

/**
 * @swagger
 * /api/stats:
 *   get:
 *     summary: Récupère et enregistre les statistiques musicales d'un utilisateur
 *     description: |
 *       Récupère les statistiques musicales d'un utilisateur depuis Spotify ou Apple Music 
 *       en utilisant un code d'autorisation. Les données sont ensuite stockées en base.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: L'identifiant de l'utilisateur
 *         schema:
 *           type: string
 *       - in: query
 *         name: platform
 *         required: true
 *         description: La plateforme musicale (spotify ou appleMusic)
 *         schema:
 *           type: string
 *           enum: [spotify, appleMusic]
 *       - in: query
 *         name: code
 *         required: true
 *         description: Code d'autorisation pour récupérer les données utilisateur
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statistiques musicales de l'utilisateur enregistrées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: Number
 *                   description: L'identifiant de l'utilisateur
 *                   example: 1
 *                 favorite_genre:
 *                   type: string
 *                   maxLength: 255
 *                   description: Genre musical préféré
 *                   example: spotify
 *                 music_platform:
 *                   type: string
 *                   maxLength: 255
 *                   description: Plateforme musicale utilisée
 *                 top_listened_artists:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       user_id:
 *                         type: Number
 *                         description: L'identifiant de l'utilisateur
 *                         example: 1 
 *                       artist_name:
 *                         type: string
 *                         maxLength: 255
 *                         description: Le nom d'un des artistes les plus écoutés par l'utilisateur
 *                         example: "Nom Artiste"
 *                       ranking:
 *                         type: Number
 *                         description: Le classement de l'artiste
 *                         example: 1
 *                 top_listened_musics:
 *                    type: array
 *                    items:
 *                      type: object
 *                      properties:
 *                        user_id:
 *                          type: Number
 *                          description: L'identifiant de l'utilisateur
 *                          example: 1 
 *                        music_name:
 *                          type: string
 *                          maxLength: 255
 *                          description: Le nom d'une des musiques les plus écoutées par l'utilisateur
 *                          example: "Nom Musique"
 *                        artist_name:
 *                          type: string
 *                          maxLength: 255
 *                          description: Le nom de l'artiste de la musique
 *                          example: "Nom Artiste"
 *                        ranking:
 *                          type: Number
 *                          description: Le classement de la musique
 *                          example: 1
 *       400:
 *         description: Requête invalide - `code`, `userId` et/ou `platform` manquant(s),
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Requête invalide - `code`, `userId` et/ou `platform` manquant(s).
 *       500:
 *         description: Erreur interne du serveur.
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
 * Gestionnaire de requête pour récupérer les statistiques musicales d'un utilisateur.
 * 
 * @param {import('next').NextApiRequest} req - Objet de la requête HTTP.
 * @param {import('next').NextApiResponse} res - Objet de la réponse HTTP.
 * @returns {Promise<void>} - Retourne une réponse JSON contenant les statistiques musicales de l'utilisateur.
 */
export default async function handler(req, res) {
  try {
    const { userId, platform, code } = req.query;

    // Vérifie si la méthode HTTP est autorisée
    if (!validateMethod(req, res)) return;

    // Vérification des paramètres requis
    if (!userId || !platform || !code) {
      return res.status(400).json({ message: 'Requête invalide - `code`, `userId` et/ou `platform` manquant(s)' });
    }

    // Vérification de la plateforme
    if (!['spotify', 'appleMusic'].includes(platform)) {
      return res.status(400).json({ message: 'Plateforme non valide' });
    }

    // Connexion à la base de données
    if (!(ensureDatabaseConnection(res))) return;

    let stats;

    // Récupération des statistiques selon la plateforme
    switch (platform) {
      case 'spotify':
        if (code) await getAccessTokenFromCode(code);
        stats = await getSpotifyStats();
        break;
      case 'appleMusic':
        stats = await getAppleMusicStats(userId);
        break;
    }

    // Enregistrement des artistes et musiques les plus écoutés
    const savedArtists = await saveTopArtists(userId, stats.topArtists);
    const savedMusics = await saveTopMusics(userId, stats.topMusics);

    // Mise à jour ou insertion des statistiques de l'utilisateur
    await updateUserMusicStatistics(userId, platform, stats, savedArtists, savedMusics);

    res.status(200).json({ message: 'Informations ajoutées dans la base de données.' });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ message: 'Erreur interne du serveur' });
  }
}

/**
 * Enregistre ou met à jour les artistes les plus écoutés en base de données.
 * 
 * @param {number} userId - Identifiant de l'utilisateur.
 * @param {Array} top_listened_artists - Liste des artistes les plus écoutés.
 * @returns {Promise<Array>} - Liste des artistes enregistrés.
 */
async function saveTopArtists(userId, top_listened_artists) {
  try {
    return await Promise.all(
      top_listened_artists.map(artist => 
        TopListenedArtist.findOneAndUpdate(
          { user_id: userId, artist_name: artist.artist_name },
          { user_id: userId, artist_name: artist.artist_name, ranking: artist.ranking },
          { upsert: true, new: true, runValidators: true }
        )
      )
    );
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des 'top artists':", error);
    throw error;
  }
}

/**
 * Enregistre ou met à jour les musiques les plus écoutées en base de données.
 * 
 * @param {number} userId - Identifiant de l'utilisateur.
 * @param {Array} top_listened_musics - Liste des musiques les plus écoutées.
 * @returns {Promise<Array>} - Liste des musiques enregistrées.
 */
async function saveTopMusics(userId, top_listened_musics) {
  try {
    return await Promise.all(
      top_listened_musics.map(music => 
        TopListenedMusic.findOneAndUpdate(
          { user_id: userId, music_name: music.music_name, artist_name: music.artist_name },
          { user_id: userId, music_name: music.music_name, artist_name: music.artist_name, ranking: music.ranking },
          { upsert: true, new: true, runValidators: true }
        )
      )
    );
  } catch (error) {
    console.error("Erreur lors de l'enregistrement des 'top musics':", error);
    throw error;
  }
}

/**
 * Met à jour ou insère les statistiques musicales d'un utilisateur en base de données.
 * 
 * @param {number} userId - Identifiant de l'utilisateur
 * @param {string} platform - Plateforme musicale (spotify ou appleMusic)
 * @param {Object} stats - Données des statistiques musicales de l'utilisateur
 * @param {Array} savedArtists - Liste des artistes enregistrés en base
 * @param {Array} savedMusics - Liste des musiques enregistrées en base
 * @returns {Promise<void>}
 */
async function updateUserMusicStatistics(userId, platform, stats, savedArtists, savedMusics) {
  try {
    await UserMusicStatistic.findOneAndUpdate(
      { user_id: userId },
      {
        user_id: userId,
        favorite_genre: stats.favoriteGenre,
        music_platform: platform,
        top_listened_artists: savedArtists.map(a => a._id), // Stocke les ID des artistes
        top_listened_musics: savedMusics.map(m => m._id), // Stocke les ID des musiques
      },
      { upsert: true, new: true, runValidators: true }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour des statistiques utilisateur :", error);
    throw error;
  }
}