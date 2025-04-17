/**
 * @fileoverview Modèle Mongoose pour les statistiques musicales d’un utilisateur.
 * Ce schéma regroupe les préférences musicales (genre, plateforme) et les tops musiques/artistes.
 */

import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les statistiques utilisateur.
 * Ce document représente les données agrégées extraites de plateformes musicales (Spotify, Deezer...).
 */
const UserMusicStatisticSchema = new mongoose.Schema({
  /**
   * Identifiant unique de l'utilisateur.
   * Chaque utilisateur ne peut avoir qu’un seul document de statistiques.
   */
  user_id: { 
    type: Number, 
    required: true, 
    unique: true,
    index: true,
  },
  /** Genre musical préféré de l’utilisateur. */
  favorite_genre: {
    type: String,
    required: true,
    trim: true,
  },
  /** Plateforme musicale utilisée pour extraire les données (Spotify, Deezer...). */
  music_platform: {
    type: String,
    required: true,
    enum: ['spotify', 'deezer'],
  },
  /**
   * Références vers les artistes les plus écoutés.
   * Limité à 3 artistes maximum.
   */
  top_listened_artists: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TopListenedArtist',
      },
    ],
    validate: {
      validator: function (arr) {
        return arr.length <= 3;
      },
      message: 'Un utilisateur ne peut avoir que 3 artistes dans son top.',
    },
  },
  /**
   * Références vers les musiques les plus écoutées.
   * Limité à 3 musiques maximum.
   */
  top_listened_musics: {
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TopListenedMusic',
      },
    ],
    validate: {
      validator: function (arr) {
        return arr.length <= 3;
      },
      message: 'Un utilisateur ne peut avoir que 3 musiques dans son top.',
    },
  },
},
{
  versionKey: false,
  timestamps: true,
}
);

/**
 * Modèle Mongoose pour la collection `UserMusicStatistic`.
 * Vérifie si le modèle est déjà déclaré, sinon le crée.
 *
 * @constant {mongoose.Model}
 */
const UserMusicStatistic = mongoose.models.UserMusicStatistic || mongoose.model(
  'UserMusicStatistic',
  UserMusicStatisticSchema
);

export default UserMusicStatistic;