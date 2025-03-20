import { UserMusicStatistic } from '../models/UserStats';
import { TopListenedArtist } from '../models/TopListenedArtist';
import { TopListenedMusic } from '../models/TopListenedMusic';

/**
 * Récupère les statistiques musicales d'un utilisateur par son ID.
 * @param {Number} userId - L'identifiant de l'utilisateur.
 * @returns {Promise<Object>} - Les statistiques musicales de l'utilisateur.
 */
export async function getUserMusicStats(userId) {
  try {
    const userStats = await UserMusicStatistic.findOne({ user_id: userId })
      .populate('top_listened_artists') // Récupère les infos des artistes
      .populate('top_listened_musics'); // Récupère les infos des musiques

    if (!userStats) {
      throw new Error(`Aucune statistique trouvée pour l'utilisateur ${userId}`);
    }

    return userStats;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats utilisateur: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère le genre de musique préféré d'un utilisateur.
 * @param {Number} userId - L'identifiant de l'utilisateur.
 * @returns {Promise<String>} - Le genre de musique préféré de l'utilisateur.
 */
export async function getUserFavoriteGenre(userId) {
    try {
      const userStats = await UserMusicStatistic.findOne({ user_id: userId }).select('favorite_genre');
  
      if (!userStats) {
        throw new Error(`Aucun genre favori trouvé pour l'utilisateur ${userId}`);
      }
  
      return userStats.favorite_genre;
    } catch (error) {
      console.error(`Erreur lors de la récupération du genre favori: ${error.message}`);
      throw error;
    }
}

/**
 * Récupère la plateforme musicale utilisée par un utilisateur.
 * @param {Number} userId - L'identifiant de l'utilisateur.
 * @returns {Promise<String>} - La plateforme musicale de l'utilisateur.
 */
export async function getUserMusicPlatform(userId) {
    try {
      const userStats = await UserMusicStatistic.findOne({ user_id: userId }).select('music_platform');
  
      if (!userStats) {
        throw new Error(`Aucune plateforme trouvée pour l'utilisateur ${userId}`);
      }
  
      return userStats.music_platform;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la plateforme musicale: ${error.message}`);
      throw error;
    }
}

/**
 * Récupère la liste des musiques les plus écoutées par un utilisateur.
 * @param {Number} userId - L'identifiant de l'utilisateur.
 * @returns {Promise<Array>} - Un tableau contenant les musiques préférées de l'utilisateur.
 */
export async function getUserTopListenedMusics(userId) {
  try {
      const userMusics = await TopListenedMusic.find({ user_id: userId });

      if (!userMusics.length) {
          throw new Error(`Aucune musique trouvée pour l'utilisateur ${userId}`);
      }

      return userMusics;
  } catch (error) {
      console.error(`Erreur lors de la récupération des musiques de l'utilisateur: ${error.message}`);
      throw error;
  }
}

/**
 * Récupère la liste des artistes les plus écoutés par un utilisateur.
 * @param {Number} userId - L'identifiant de l'utilisateur.
 * @returns {Promise<Array>} - Un tableau contenant les artistes préférés de l'utilisateur.
 */
export async function getUserTopListenedArtists(userId) {
  try {
      const userArtists = await TopListenedArtist.find({ user_id: userId });

      if (!userArtists.length) {
          throw new Error(`Aucun artiste trouvé pour l'utilisateur ${userId}`);
      }

      return userArtists;
  } catch (error) {
      console.error(`Erreur lors de la récupération des artistes de l'utilisateur: ${error.message}`);
      throw error;
  }
}

/**
 * Récupère le nom d'une musique écoutée par un utilisateur en fonction de son classement.
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {Number} ranking - Le classement de la musique.
 * @returns {Promise<String>} - Le nom de la musique.
 */
export async function getMusicByUserAndRanking(userId, ranking) {
  try {
    if (ranking < 1 || ranking > 3) {
      throw new Error('Le classement (ranking) doit être compris entre 1 et 3.');
    }

    // Récupére les informations de l'utilisateur
    const userStats = await UserMusicStatistic.findOne({ user_id: userId }).populate('top_listened_musics');

    if (!userStats || !userStats.top_listened_musics.length) {
      throw new Error(`Aucune musique trouvée pour l'utilisateur avec ID ${userId}.`);
    }

    // Trouve la musique avec le rang donné
    const music = userStats.top_listened_musics.find((m) => m.ranking === ranking);

    if (!music) {
      throw new Error(`Aucune musique trouvée avec le classement ${ranking} pour l'utilisateur ${userId}.`);
    }

    return music.music_name;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la musique: ${error.message}`);
    throw error;
  }
}

/**
 * Récupère le nom d'un artiste écouté par un utilisateur en fonction de son classement.
 * @param {String} userId - L'ID de l'utilisateur.
 * @param {Number} ranking - Le classement de l'artiste.
 * @returns {Promise<String>} - Le nom de l'artiste.
 */
export async function getArtistByUserAndRanking(userId, ranking) {
  try {
    // Vérification du ranking (doit être entre 1 et 3)
    if (ranking < 1 || ranking > 3) {
      throw new Error('Le classement (ranking) doit être compris entre 1 et 3.');
    }

    // Récupérer les informations de l'utilisateur
    const userStats = await UserMusicStatistic.findOne({ user_id: userId }).populate('top_listened_artists');

    if (!userStats || !userStats.top_listened_artists.length) {
      throw new Error(`Aucun artiste trouvé pour l'utilisateur avec ID ${userId}.`);
    }

    // Trouver l'artiste avec le classement donné
    const artist = userStats.top_listened_artists.find((a) => a.ranking === ranking);

    if (!artist) {
      throw new Error(`Aucun artiste trouvé avec le classement ${ranking} pour l'utilisateur ${userId}.`);
    }

    return artist.artist_name;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'artiste: ${error.message}`);
    throw error;
  }
}