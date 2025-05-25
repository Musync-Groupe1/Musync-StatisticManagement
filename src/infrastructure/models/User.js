/**
 * @fileoverview Modèle Mongoose pour la collection `User`.
 * Stocke la plateforme musicale utilisée par l'utilisateur.
 */

import mongoose from 'mongoose';

const ALLOWED_PLATFORMS = ['spotify'];

/**
 * Schéma utilisateur : identifiant + plateforme musicale utilisée
 */
const UserSchema = new mongoose.Schema({
  /** Identifiant unique de l’utilisateur (UUID au format chaîne). */
  user_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  /** Plateforme musicale utilisée par l'utilisateur. */
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