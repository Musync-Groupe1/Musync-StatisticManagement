import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les musiques les plus écoutées.
 * Ce schéma définit la structure d'un document représentant une musique populaire avec son artiste et son classement.
 */
const topListenedMusicSchema = new mongoose.Schema({
  // Identifiant de l'utilisateur. Obligatoire pour relier les musiques à un utilisateur spécifique.
  user_id: { 
    type: Number, 
    required: true, 
  },
  // Le nom de la musique. Obligatoire et limité à 255 caractères.
  music_name: { 
    type: String, 
    required: true, 
    maxlength: 255, 
    trim: true,
  },
  // Le nom de l'artiste de la musique. Obligatoire et limité à 255 caractères.
  artist_name: { 
    type: String, 
    required: true, 
    maxlength: 255, 
    trim: true,
  },
  // Le classement de la musique. Obligatoire, doit être un nombre entier.
  ranking: { 
    type: Number, 
    required: true,
    unique: true,
    min: 1, // Le classement commence à 1
    max: 3  // Le classement se finit à 3
  }}, { versionKey: false });

/**
 * Le modèle de Mongoose pour les musiques les plus écoutées.
 * Si le modèle a déjà été défini, il est utilisé ; sinon, un nouveau modèle est créé.
 */
export const TopListenedMusic = mongoose.models.TopListenedMusic || mongoose.model(
  'TopListenedMusic', topListenedMusicSchema
);