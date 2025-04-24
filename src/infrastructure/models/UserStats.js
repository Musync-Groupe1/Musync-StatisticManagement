import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les statistiques utilisateur.
 * Ce schéma définit la structure des données des statistiques d'un utilisateur, 
 * incluant ses artistes et morceaux les plus écoutés.
 */
const UserMusicStatisticSchema = new mongoose.Schema({
  // Identifiant de l'utilisateur. 
  // Obligatoire pour relier les statistiques à un utilisateur spécifique.
  user_id: { 
    type: Number, 
    required: true, 
    unique: true
  },
  favorite_genre: {
    type: String,
    required: true
  },
  // Plateforme de musique utilisée. 
  // Obligatoire pour savoir d'où proviennent les données (Spotify, Deezeer, etc.).
  music_platform: {
    type: String,
    enum: ['spotify', 'deezer'],
    required: true
  },
  // Liste des artistes les plus écoutés.
  // Chaque objet contient le nom de l'artiste et son classement.
  top_listened_artists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TopListenedArtist' }],
  top_listened_musics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TopListenedMusic' }]
}, { versionKey: false });

/**
 * Le modèle de Mongoose pour les statistiques utilisateur.
 * Si le modèle a déjà été défini, il est utilisé ; sinon, un nouveau modèle est créé.
 */
const UserMusicStatistic = mongoose.models.UserMusicStatistic || mongoose.model(
  'UserMusicStatistic',
  UserMusicStatisticSchema
);

export default UserMusicStatistic;