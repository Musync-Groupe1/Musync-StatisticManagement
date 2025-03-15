import mongoose from 'mongoose';

/**
 * Schéma Mongoose pour les statistiques utilisateur.
 * Ce schéma définit la structure des données des statistiques d'un utilisateur, incluant ses artistes et morceaux les plus écoutés.
 */
const userStatsSchema = new mongoose.Schema({
  // Identifiant de l'utilisateur. Obligatoire pour relier les statistiques à un utilisateur spécifique.
  userId: { 
    type: String, 
    required: true, 
    trim: true,
  },
  // Plateforme de musique utilisée. Obligatoire pour savoir d'où proviennent les données (Spotify, Apple Music, etc.).
  platform: { 
    type: String, 
    required: true, 
    enum: ['spotify', 'appleMusic'],
  },
  // Liste des artistes les plus écoutés. Chaque objet contient le nom de l'artiste et son classement.
  topArtists: [{
    artistName: { 
      type: String, 
      required: true, 
      trim: true,
    },
    ranking: { 
      type: Number, 
      required: true,
      min: 1, // Le classement commence à 1
    },
  }],
  // Liste des morceaux les plus écoutés. Chaque objet contient le nom du morceau, l'artiste et son classement.
  topTracks: [{
    trackName: { 
      type: String, 
      required: true, 
      trim: true,
    },
    artist: { 
      type: String, 
      required: true, 
      trim: true,
    },
    ranking: { 
      type: Number, 
      required: true,
      min: 1, // Le classement commence à 1
    },
  }],
});

/**
 * Le modèle de Mongoose pour les statistiques utilisateur.
 * Si le modèle a déjà été défini, il est utilisé ; sinon, un nouveau modèle est créé.
 */
const UserStats = mongoose.models.UserStats || mongoose.model('UserStats', userStatsSchema);

export default UserStats;