import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les artistes les plus écoutés.
 * Ce schéma définit la structure d'un document représentant un artiste populaire avec son classement.
 */
const topListenedArtistSchema = new mongoose.Schema({
  // Le nom de l'artiste. Obligatoire et limité à 255 caractères.
  top_listened_artist: { 
    type: String, 
    required: true, 
    maxlength: 255, 
    trim: true,
  },
  // Le classement de l'artiste. Obligatoire, doit être un nombre entier.
  top_ranking: { 
    type: Number, 
    required: true,
    min: 1, // Le classement commence à 1
  },
});

/**
 * Le modèle de Mongoose pour les artistes les plus écoutés.
 * Si le modèle a déjà été défini, il est utilisé ; sinon, un nouveau modèle est créé.
 */
const TopListenedArtist = mongoose.models.TopListenedArtist || mongoose.model('TopListenedArtist', topListenedArtistSchema);

export default TopListenedArtist;