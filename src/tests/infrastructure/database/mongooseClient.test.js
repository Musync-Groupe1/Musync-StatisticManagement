import { jest } from '@jest/globals';

/**
 * On mocke manuellement le module `mongoose` avant tout import
 * pour intercepter le comportement de `connect`, `readyState`, etc.
 */
jest.unstable_mockModule('mongoose', () => {
  const mockConnect = jest.fn();

  return {
    default: {
      connect: mockConnect,
      connection: { readyState: 1 },
      model: jest.fn(() => ({})),
      models: {},
      Schema: class {
        constructor(definition, options) {
          this.definition = definition;
          this.options = options;
        }
        static Types = { ObjectId: 'ObjectId' };
        index() {}
      }
    }
  };
});

// Import dynamique de mongoose et du client
const mongoose = await import('mongoose').then(m => m.default);
const connectToDatabase = (await import('infrastructure/database/mongooseClient.js')).default;

describe('connectToDatabase', () => {
  let consoleLogSpy, consoleErrorSpy;

  beforeAll(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shouldReturnTrueWhenAlreadyConnected', async () => {
    // GIVEN : la connexion est déjà active
    mongoose.connection.readyState = 1;

    // WHEN : on appelle connectToDatabase
    const result = await connectToDatabase();

    // THEN : on ne tente pas de se reconnecter, on retourne true
    expect(result).toBe(true);
    expect(mongoose.connect).not.toHaveBeenCalled();
  });

  it('shouldConnectAndReturnTrueWhenDisconnected', async () => {
    // GIVEN : simulateur de déconnexion
    mongoose.connection.readyState = 0;
    mongoose.connect.mockResolvedValueOnce();

    // WHEN
    const result = await connectToDatabase();

    // THEN : une connexion est initiée et réussie
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);
    expect(result).toBe(true);
  });

  it('shouldReturnFalseWhenConnectionFails', async () => {
    // GIVEN : échec simulé de la connexion
    mongoose.connection.readyState = 0;
    mongoose.connect.mockRejectedValueOnce(new Error('Connection failed'));

    // WHEN
    const result = await connectToDatabase();

    // THEN : l’échec est géré, la fonction retourne `false`
    expect(mongoose.connect).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});