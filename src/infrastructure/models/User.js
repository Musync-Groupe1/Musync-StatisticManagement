/**
 * @fileoverview Modèle Mongoose pour la collection `User`.
 * Stocke la plateforme musicale utilisée par l'utilisateur.
 */

import mongoose from 'mongoose';

const ALLOWED_PLATFORMS = ['spotify', 'soundcloud'];

/**
 * Schéma utilisateur : identifiant + plateforme musicale utilisée
 */
const UserSchema = new mongoose.Schema({
  /** Identifiant unique de l’utilisateur. */
  user_id: {
    type: Number,
    required: true,
    unique: true
  },
  /** Plateforme musicale utilisée par l'utilisateur (Spotify, Soundcloud...). */
  music_platform: {
    type: String,
    enum: ALLOWED_PLATFORMS,
    required: true,
    trim: true
  }},
   {
    versionKey: false,
    timestamps: true
   }
);

// Évite les redéfinitions si le modèle est déjà enregistré
const User = mongoose.models.User || mongoose.model(
  'User',
  UserSchema
);

export default User;