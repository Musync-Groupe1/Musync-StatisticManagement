import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les musiques les plus écoutées.
 * Ce schéma définit la structure d'un document représentant une musique populaire avec son artiste et son classement.
 */
const topListenedMusicSchema = new mongoose.Schema({
  // Le nom de la musique. Obligatoire et limité à 255 caractères.
  top_listened_music: { 
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
  top_ranking: { 
    type: Number, 
    required: true,
    min: 1, // Le classement commence à 1
  },
});

/**
 * Le modèle de Mongoose pour les musiques les plus écoutées.
 * Si le modèle a déjà été défini, il est utilisé ; sinon, un nouveau modèle est créé.
 */
const TopListenedMusic = mongoose.models.TopListenedMusic || mongoose.model('TopListenedMusic', topListenedMusicSchema);

export default TopListenedMusic;