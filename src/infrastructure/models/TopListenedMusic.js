/**
 * @fileoverview Modèle Mongoose pour les musiques les plus écoutées par un utilisateur.
 * Chaque document représente une musique associée à un utilisateur, avec classement et artiste.
 */

import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour une musique populaire écoutée par un utilisateur.
 * Ce schéma permet d’enregistrer les 3 morceaux favoris d’un utilisateur dans la base MongoDB.
 */
const TopListenedMusicSchema = new mongoose.Schema({
  /** Identifiant unique de l’utilisateur. */
  user_id: { 
    type: Number, 
    required: true,
    index: true
  },
  /** Nom de la musique. */
  music_name: { 
    type: String, 
    required: true, 
    maxlength: 255, 
    trim: true,
  },
  /** Nom de l’artiste ayant interprété la musique. */
  artist_name: { 
    type: String, 
    required: true, 
    maxlength: 255, 
    trim: true,
  },
  /** Classement de la musique dans le top personnel de l’utilisateur (1 à 3). */
  ranking: { 
    type: Number, 
    required: true,
    min: 1,
    max: 3
  }},
   {
     versionKey: false,
     timestamps: true,
   }
); 

// Unicité combinée : un utilisateur ne peut pas avoir deux musiques au même rang
TopListenedMusicSchema.index({ user_id: 1, ranking: 1 }, { unique: true });

/**
 * Modèle Mongoose pour la collection `TopListenedMusic`.
 * Vérifie si le modèle est déjà déclaré, sinon le crée.
 *
 * @constant {mongoose.Model}
 */
const TopListenedMusic = mongoose.models.TopListenedMusic || mongoose.model(
  'TopListenedMusic',
  TopListenedMusicSchema
);

export default TopListenedMusic;