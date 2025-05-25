import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import TopListenedMusic from 'infrastructure/models/TopListenedMusic.js';

let mongoServer;

/**
 * @description
 * Tests unitaires du modèle `TopListenedMusic`.
 * Vérifie la persistance de documents valides, la validation des champs obligatoires
 * et le respect de la contrainte d’unicité sur le couple (user_id, ranking).
 */
describe('TopListenedMusic model', () => {
  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await TopListenedMusic.syncIndexes();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await TopListenedMusic.deleteMany();
  });

  /**
   * @description
   * GIVEN : un document musique avec des données valides
   * WHEN  : il est sauvegardé en base
   * THEN  : il est stocké avec les bonnes valeurs
   */
  it('shouldCreateMusicDocumentWhenDataIsValid', async () => {
    // GIVEN
    const music = new TopListenedMusic({
      user_id: 1,
      music_name: 'Blinding Lights',
      artist_name: 'The Weeknd',
      ranking: 1
    });

    // WHEN
    const saved = await music.save();

    // THEN
    expect(saved._id).toBeDefined();
    expect(saved.music_name).toBe('Blinding Lights');
    expect(saved.artist_name).toBe('The Weeknd');
    expect(saved.ranking).toBe(1);
  });

  /**
   * @description
   * GIVEN : un document musique incomplet
   * WHEN  : une tentative de sauvegarde est faite
   * THEN  : une erreur de validation est levée
   */
  it('shouldThrowValidationErrorWhenRequiredFieldsAreMissing', async () => {
    // GIVEN
    const invalidMusic = new TopListenedMusic({ user_id: 1 });

    // WHEN / THEN
    await expect(invalidMusic.save()).rejects.toThrow();
  });

  /**
   * @description
   * GIVEN : deux musiques avec le même ranking pour un même utilisateur
   * WHEN  : la seconde est sauvegardée
   * THEN  : une erreur d’unicité est levée
   */
  it('shouldEnforceUniqueRankingConstraintPerUser', async () => {
    // GIVEN
    const music1 = new TopListenedMusic({
      user_id: 42,
      music_name: 'Track 1',
      artist_name: 'Artist A',
      ranking: 1
    });

    const music2 = new TopListenedMusic({
      user_id: 42,
      music_name: 'Track 2',
      artist_name: 'Artist B',
      ranking: 1
    });

    await music1.save();

    // WHEN / THEN
    await expect(music2.save()).rejects.toThrow();
  });
});