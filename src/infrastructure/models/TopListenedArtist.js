/**
 * @fileoverview Modèle Mongoose pour les artistes les plus écoutés.
 * Représente un document dans la collection `toplistenedartists` en base MongoDB.
 * Ce modèle est utilisé pour stocker les artistes classés dans le top 3 par utilisateur.
 */

import mongoose from 'mongoose';

/**
 * Schéma Mongoose décrivant la structure d’un document artiste le plus écouté.
 * Ce schéma est utilisé pour mapper les documents dans MongoDB via Mongoose.
 */
const TopListenedArtistSchema = new mongoose.Schema({
  /** Identifiant unique de l’utilisateur auquel est lié cet artiste. */
  user_id: { 
    type: Number, 
    required: true, 
    index: true
  },
  /**
   * Nom de l’artiste le plus écouté.
   * Doit être une chaîne de caractères non vide, tronquée à 255 caractères.
   */
  artist_name: { 
    type: String, 
    required: true, 
    maxlength: 255, 
    trim: true,
  },
  /** Classement de l’artiste (1 à 3) dans le top de l’utilisateur. */
  ranking: { 
    type: Number, 
    required: true,
    min: 1,
    max: 3
  }}, {
    versionKey: false,
    timestamps: true
  });

// Contrainte d’unicité : un utilisateur ne peut avoir qu’un seul artiste à un rang donné
TopListenedArtistSchema.index({ user_id: 1, ranking: 1 }, { unique: true });

/**
 * Modèle Mongoose pour la collection `TopListenedArtist`.
 * Vérifie si le modèle est déjà déclaré, sinon le crée.
 *
 * @constant {mongoose.Model}
 */
const TopListenedArtist = mongoose.models.TopListenedArtist || mongoose.model(
  'TopListenedArtist',
  TopListenedArtistSchema
);

export default TopListenedArtist;