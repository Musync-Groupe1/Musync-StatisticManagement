import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import UserMusicStatistic from 'infrastructure/models/UserStats.js';

/**
 * @description
 * Tests du modèle `UserMusicStatistic`.
 * On valide :
 * - la création de documents valides,
 * - la limite de 3 artistes/musiques,
 * - la validité de l’enum `music_platform`.
 */
describe('UserMusicStatistic model', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await UserMusicStatistic.deleteMany();
  });

  /**
   * GIVEN un document utilisateur avec des champs valides
   * WHEN il est sauvegardé
   * THEN il doit être persisté sans erreur
   */
  it('shouldSaveUserMusicStatisticWhenValid', async () => {
    // GIVEN
    const userStat = new UserMusicStatistic({
      user_id: 1,
      favorite_genre: 'rock',
      music_platform: 'spotify',
      top_listened_artists: [],
      top_listened_musics: []
    });

    // WHEN
    const saved = await userStat.save();

    // THEN
    expect(saved._id).toBeDefined();
    expect(saved.user_id).toBe(1);
  });

  /**
   * GIVEN un document avec plus de 3 artistes
   * WHEN on le valide
   * THEN une erreur doit être levée
   */
  it('shouldThrowValidationErrorWhenMoreThanThreeArtists', async () => {
    // GIVEN
    const userStat = new UserMusicStatistic({
      user_id: 2,
      favorite_genre: 'pop',
      music_platform: 'spotify',
      top_listened_artists: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ],
      top_listened_musics: []
    });

    // WHEN / THEN
    await expect(userStat.validate()).rejects.toThrow(/3 artistes/);
  });

  /**
   * GIVEN un document avec plus de 3 musiques
   * WHEN on le valide
   * THEN une erreur doit être levée
   */
  it('shouldThrowValidationErrorWhenMoreThanThreeMusics', async () => {
    // GIVEN
    const userStat = new UserMusicStatistic({
      user_id: 3,
      favorite_genre: 'jazz',
      music_platform: 'deezer',
      top_listened_artists: [],
      top_listened_musics: [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId()
      ]
    });

    // WHEN / THEN
    await expect(userStat.validate()).rejects.toThrow(/3 musiques/);
  });

  /**
   * GIVEN une plateforme musicale invalide
   * WHEN on valide le document
   * THEN une erreur d’énumération doit être levée
   */
  it('shouldThrowValidationErrorWhenMusicPlatformIsInvalid', async () => {
    // GIVEN
    const userStat = new UserMusicStatistic({
      user_id: 4,
      favorite_genre: 'electro',
      music_platform: 'youtube',
      top_listened_artists: [],
      top_listened_musics: []
    });

    // WHEN / THEN
    await expect(userStat.validate()).rejects.toThrow(/music_platform: `youtube` is not a valid enum value/);
  });
});