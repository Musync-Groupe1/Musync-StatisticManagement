import mongoose from 'mongoose';

/**
 * Connexion à la base de données MongoDB.
 *
 * Cette fonction vérifie d'abord l'état de la connexion à la base de données.
 * Si la connexion n'est pas déjà établie, elle tente de se connecter à MongoDB en utilisant
 * l'URL de connexion définie dans la variable d'environnement `MONGODB_URI`.
 *
 * @throws {Error} Si la connexion échoue, une erreur est levée.
 */
const connectToDatabase = async () => {
  // Vérifier si la connexion MongoDB est déjà ouverte
  if (mongoose.connection.readyState === 0) {
    try {
      // Tentative de connexion à MongoDB en utilisant l'URL de connexion
      console.log('Connexion à la base de données...');
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connecté à la base de données');
    } catch (error) {
      console.error('Échec lors de la connexion à la base de données:', error);
      return Promise.reject(new Error('Échec lors de la connexion à la base de données'));
    }
  } else {
    console.log('Déjà connecté à la base de données');
  }
};

export default connectToDatabase;
