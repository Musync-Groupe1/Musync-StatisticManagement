/**
 * @fileoverview Client de connexion à MongoDB centralisé pour toute l'application.
 * Empêche les connexions multiples et expose une fonction unique pour initier la base.
 */

import mongoose from 'mongoose';

import '../models/UserStats.js';
import '../models/TopListenedArtist.js';
import '../models/TopListenedMusic.js';

/**
 * Établit une connexion avec MongoDB si elle n’est pas déjà active.
 *
 * Cette fonction vérifie d'abord l'état de la connexion via `mongoose.connection.readyState`.
 * Si une connexion existe déjà, elle est réutilisée.
 * Sinon, une tentative de connexion est effectuée via `mongoose.connect()` avec l’URI
 * contenue dans la variable d’environnement `MONGODB_URI`.
 *
 * @async
 * @function connectToDatabase
 * @returns {Promise<boolean>} `true` si la connexion est réussie ou déjà active, `false` sinon
 *
 * @example
 * const connected = await connectToDatabase();
 * if (!connected) {
 *   return res.status(500).json({ error: "Base de données indisponible" });
 * }
 */
const connectToDatabase = async () => {
  // 0 : disconnected —> on doit se connecter
  if (mongoose.connection.readyState !== 0) {
    console.log('[MongoDB] Déjà connecté.');
    return true;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('[MongoDB] Connexion réussie.');
    return true;
  } catch (error) {
    console.error('[MongoDB] Échec de connexion :', error);
    return false;
  }
};

export default connectToDatabase;