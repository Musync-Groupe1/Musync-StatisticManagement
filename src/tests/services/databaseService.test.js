import mongoose from 'mongoose';
import connectToDatabase from '../../services/databaseService';

/**
 * Mock de mongoose pour simuler la connexion et éviter d'utiliser une base de données réelle.
 */
jest.mock('mongoose', () => {
  const originalMongoose = jest.requireActual('mongoose');

  return {
    ...originalMongoose,
    connect: jest.fn(), // Mock de la connexion
    connection: {
      ...originalMongoose.connection,
      readyState: 0, // État initial : non connecté
    },
  };
});

describe('connectToDatabase', () => {
  let connectSpy;
  let consoleErrorSpy;

  /**
   * Avant tous les tests :
   * - Réinitialise les mocks.
   * - Espionne les fonctions importantes (`mongoose.connect` et `console.error`).
   */
  beforeAll(() => {
    connectSpy = jest.spyOn(mongoose, 'connect');
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * Après chaque test :
   * - Réinitialise l'état de la connexion.
   * - Efface les appels des fonctions espionnées.
   */
  afterEach(() => {
    mongoose.connection.readyState = 0; // Remet l'état de connexion à "non connecté"
    jest.clearAllMocks();
  });

  /**
   * Après tous les tests :
   * - Déconnecte mongoose pour éviter les "open handles".
   * - Restaure le comportement normal de `console.error`.
   */
  afterAll(async () => {
    await mongoose.disconnect();
    consoleErrorSpy.mockRestore();
  });

  /**
   * Vérifie que la connexion à MongoDB est bien établie si elle ne l'est pas encore.
   */
  it('doit se connecter à MongoDB si non connecté', async () => {
    mongoose.connection.readyState = 0; // Simule une connexion non établie

    await connectToDatabase();

    expect(connectSpy).toHaveBeenCalledWith(process.env.MONGODB_URI);
  });

  /**
   * Vérifie qu'aucune tentative de connexion n'est effectuée si MongoDB est déjà connecté.
   */
  it('ne doit pas se reconnecter si déjà connecté', async () => {
    mongoose.connection.readyState = 1; // 1 = Déjà connecté

    await connectToDatabase();

    expect(connectSpy).not.toHaveBeenCalled();
  });

  /**
   * Vérifie que l'erreur est correctement gérée et loggée si la connexion échoue.
   */
  it('doit capturer et afficher une erreur en cas d’échec de connexion', async () => {
    mongoose.connection.readyState = 0; // Simule une connexion non établie

    // Simule une erreur de connexion
    connectSpy.mockRejectedValueOnce(new Error('Échec de connexion'));

    await expect(connectToDatabase()).rejects.toThrow('Échec lors de la connexion à la base de données');

    expect(consoleErrorSpy).toHaveBeenCalledWith('Échec lors de la connexion à la base de données:', expect.any(Error));
  });
});