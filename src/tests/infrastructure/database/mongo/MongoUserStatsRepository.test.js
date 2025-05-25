import { jest } from '@jest/globals';

// Mocks dynamiques
const findOneMock = jest.fn();
const findOneAndUpdateMock = jest.fn();
const deleteOneMock = jest.fn();

jest.unstable_mockModule('infrastructure/models/UserStats.js', () => ({
  default: {
    findOne: findOneMock,
    findOneAndUpdate: findOneAndUpdateMock,
    deleteOne: deleteOneMock,
  }
}));

/**
 * @description
 * Tests unitaires du repository MongoUserStatsRepository.
 * Vérifie que les méthodes find, upsert et delete fonctionnent correctement
 * avec les appels simulés à Mongoose.
 */
describe('MongoUserStatsRepository', () => {
  let MongoUserStatsRepository;
  let repo;

  beforeEach(async () => {
    const repoModule = await import('infrastructure/database/mongo/MongoUserStatsRepository.js');
    MongoUserStatsRepository = repoModule.default;
    repo = new MongoUserStatsRepository();

    findOneMock.mockReset();
    findOneAndUpdateMock.mockReset();
    deleteOneMock.mockReset();
  });

  /**
   * @description
   * GIVEN : un utilisateur existant avec des statistiques musicales
   * WHEN  : la méthode findByUserId est appelée
   * THEN  : elle retourne les données peuplées avec les artistes et musiques
   */
  it('shouldReturnUserStatsWithPopulatedArtistsAndMusics', async () => {
    // GIVEN
    const fakeData = { user_id: 1, favorite_genre: 'rock' };
    const populateMock = jest.fn().mockReturnThis();
    const leanMock = jest.fn().mockResolvedValue(fakeData);

    findOneMock.mockReturnValue({
      populate: populateMock,
      lean: leanMock,
    });

    // WHEN
    const result = await repo.findByUserId(1);

    // THEN
    expect(result).toEqual(fakeData);
    expect(findOneMock).toHaveBeenCalledWith({ user_id: 1 });
    expect(populateMock).toHaveBeenCalledWith('top_listened_artists');
    expect(populateMock).toHaveBeenCalledWith('top_listened_musics');
    expect(leanMock).toHaveBeenCalled();
  });

  /**
   * @description
   * GIVEN : un utilisateur et un objet de données à insérer ou mettre à jour
   * WHEN  : la méthode updateOrCreate est appelée
   * THEN  : elle effectue un upsert et retourne le document mis à jour
   */
  it('shouldUpsertUserStatsAndReturnUpdatedDocument', async () => {
    // GIVEN
    const userId = 42;
    const data = { favorite_genre: 'pop', music_platform: 'spotify' };
    const expected = { _id: 'abc123', ...data };

    findOneAndUpdateMock.mockResolvedValue(expected);

    // WHEN
    const result = await repo.updateOrCreate(userId, data);

    // THEN
    expect(result).toEqual(expected);
    expect(findOneAndUpdateMock).toHaveBeenCalledWith(
      { user_id: userId },
      { $set: data },
      { upsert: true, new: true, runValidators: true }
    );
  });

  /**
   * @description
   * GIVEN : un identifiant utilisateur
   * WHEN  : la méthode deleteByUserId est appelée
   * THEN  : elle supprime le document correspondant et retourne le nombre de suppressions
   */
  it('shouldDeleteUserStatsAndReturnDeletedCount', async () => {
    // GIVEN
    deleteOneMock.mockResolvedValue({ deletedCount: 1 });

    // WHEN
    const result = await repo.deleteByUserId(123);

    // THEN
    expect(result).toBe(1);
    expect(deleteOneMock).toHaveBeenCalledWith({ user_id: 123 });
  });
});