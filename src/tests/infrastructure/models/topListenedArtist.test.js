import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import TopListenedArtist from 'infrastructure/models/TopListenedArtist.js';

let mongoServer;

/**
 * @description
 * Tests unitaires du modèle Mongoose `TopListenedArtist`.
 * Vérifie la validité du schéma, la présence des contraintes et le respect de l’unicité par utilisateur + ranking.
 */
describe('TopListenedArtist model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await TopListenedArtist.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await TopListenedArtist.deleteMany();
  });

  /**
   * @description
   * GIVEN : un document complet et valide
   * WHEN  : il est sauvegardé dans la base
   * THEN  : il est persisté avec les bonnes valeurs
   */
  it('shouldCreateDocumentWhenDataIsValid', async () => {
    // GIVEN
    const artist = new TopListenedArtist({
      user_id: 1,
      artist_name: 'The Weeknd',
      ranking: 1
    });

    // WHEN
    const saved = await artist.save();

    // THEN
    expect(saved._id).toBeDefined();
    expect(saved.artist_name).toBe('The Weeknd');
    expect(saved.ranking).toBe(1);
  });

  /**
   * @description
   * GIVEN : un document sans les champs requis
   * WHEN  : il est sauvegardé
   * THEN  : une erreur est levée à cause du schéma
   */
  it('shouldThrowValidationErrorWhenRequiredFieldsAreMissing', async () => {
    // GIVEN
    const invalidArtist = new TopListenedArtist({ user_id: 1 });

    // WHEN / THEN
    await expect(invalidArtist.save()).rejects.toThrow();
  });

  /**
   * @description
   * GIVEN : deux artistes pour le même utilisateur avec le même ranking
   * WHEN  : le second est sauvegardé
   * THEN  : une erreur est levée à cause de la contrainte d’unicité
   */
  it('shouldEnforceUniqueRankingConstraintPerUser', async () => {
    // GIVEN
    const artist1 = new TopListenedArtist({
      user_id: 42,
      artist_name: 'Drake',
      ranking: 1
    });

    const artist2 = new TopListenedArtist({
      user_id: 42,
      artist_name: 'Adele',
      ranking: 1
    });

    await artist1.save();

    // WHEN / THEN
    await expect(artist2.save()).rejects.toThrow();
  });
});