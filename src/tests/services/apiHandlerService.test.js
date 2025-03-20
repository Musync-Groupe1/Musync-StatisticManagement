import connectToDatabase from '../../services/databaseService';
import { validateMethod, ensureDatabaseConnection, responseError } from '../../services/apiHandlerService';

jest.mock('../../services/databaseService'); // Mock du service de connexion à MongoDB

describe('API Utilities', () => {
  let req, res, consoleErrorSpy;

  /**
   * Avant chaque test :
   * - Réinitialise `req` et `res` avec des mocks.
   * - Espionne `console.error` pour capturer les erreurs sans polluer la sortie.
   */
  beforeEach(() => {
    req = { method: 'GET', url: '/api/test' };
    res = {
      status: jest.fn().mockReturnThis(), // Permet de chaîner `.json()`
      json: jest.fn(),
    };
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  /**
   * Après tous les tests, restaure le comportement normal de `console.error`.
   */
  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  // 🔹 TESTS POUR validateMethod
  describe('validateMethod', () => {
    it('devrait autoriser une requête GET', () => {
      const result = validateMethod(req, res);
      expect(result).toBe(true);
      expect(res.status).not.toHaveBeenCalled(); // Ne doit pas envoyer d'erreur
    });

    it('devrait refuser une requête non-GET', () => {
      req.method = 'POST'; // Simule une requête non GET

      const result = validateMethod(req, res);

      expect(result).toBe(false);
      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({ error: 'Méthode non autorisée' });
    });
  });

  // 🔹 TESTS POUR ensureDatabaseConnection
  describe('ensureDatabaseConnection', () => {
    it('devrait établir une connexion à MongoDB', async () => {
      connectToDatabase.mockResolvedValueOnce(); // Simule une connexion réussie

      const result = await ensureDatabaseConnection(res);

      expect(result).toBe(true);
      expect(connectToDatabase).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled(); // Ne doit pas envoyer d'erreur
    });

    it('devrait renvoyer une erreur 500 en cas d’échec de connexion', async () => {
      connectToDatabase.mockRejectedValueOnce(new Error('Échec de connexion')); // Simule une erreur

      const result = await ensureDatabaseConnection(res);

      expect(result).toBe(false);
      expect(connectToDatabase).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Erreur de connexion à la base de données:",
        expect.any(Error)
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Impossible de se connecter à la base de données." });
    });
  });

  // 🔹 TESTS POUR responseError
  describe('responseError', () => {
    it('devrait logger l’erreur et retourner une erreur 500', () => {
      const error = new Error('Erreur simulée');

      responseError(req, res, error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(`Erreur API ${req.url}:`, error);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne du serveur." });
    });
  });
});
