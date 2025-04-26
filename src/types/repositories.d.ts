/**
 * @file Définition globale des interfaces (typedefs) pour les repositories du domaine musical.
 * Utilisable dans tout le projet avec JSDoc pour une documentation claire et un bon support IDE.
 */

/**
 * @typedef {Object} UserStatsRepository
 * @property {(userId: string | number) => Promise<Object|null>} findByUserId - Récupère les stats d'un utilisateur
 * @property {(userId: string | number, data: Object) => Promise<any>} updateOrCreate - Met à jour ou insère les stats
 */

/**
 * @typedef {Object} TopArtistRepository
 * @property {(userId: string | number) => Promise<Object[]>} findAllByUserId - Récupère tous les artistes d'un utilisateur
 * @property {(userId: string | number, ranking: number) => Promise<Object|null>} findByUserIdAndRanking - Récupère un artiste par classement
 * @property {(userId: string | number, artistsArray: Object[]) => Promise<Object[]>} upsertMany - Insère ou met à jour plusieurs artistes
 */

/**
 * @typedef {Object} TopMusicRepository
 * @property {(userId: string | number) => Promise<Object[]>} findAllByUserId - Récupère toutes les musiques d'un utilisateur
 * @property {(userId: string | number, ranking: number) => Promise<Object|null>} findByUserIdAndRanking - Récupère une musique par classement
 * @property {(userId: string | number, musicsArray: Object[]) => Promise<Object[]>} upsertMany - Insère ou met à jour plusieurs musiques
 */