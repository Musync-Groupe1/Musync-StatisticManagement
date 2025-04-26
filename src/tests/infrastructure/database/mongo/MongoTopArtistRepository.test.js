import { jest } from '@jest/globals';

import MongoTopArtistRepository from 'infrastructure/database/mongo/MongoTopArtistRepository.js';
import TopListenedArtist from 'infrastructure/models/TopListenedArtist.js';

describe('MongoTopArtistRepository', () => {
  const repo = new MongoTopArtistRepository();

  afterEach(() => {
    jest.restoreAllMocks(); // Nettoyage des mocks après chaque test
  });

  it('shouldReturnAllArtistsForUserId', async () => {
    // GIVEN : on mocke le comportement chaîné .select().sort().lean()
    const mockSelect = jest.fn().mockReturnThis();
    const mockSort = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockResolvedValue([{ artist_name: 'Drake' }]);

    jest.spyOn(TopListenedArtist, 'find').mockReturnValue({
      select: mockSelect,
      sort: mockSort,
      lean: mockLean,
    });

    // WHEN : on appelle la méthode de repo
    const result = await repo.findAllByUserId(1);

    // THEN : le résultat correspond aux données simulées
    expect(result).toEqual([{ artist_name: 'Drake' }]);
  });

  it('shouldReturnArtistByUserIdAndRanking', async () => {
    // GIVEN : mock de findOne().lean()
    const mockLean = jest.fn().mockResolvedValue({ artist_name: 'Kanye', ranking: 2 });

    jest.spyOn(TopListenedArtist, 'findOne').mockReturnValue({
      lean: mockLean
    });

    // WHEN
    const result = await repo.findByUserIdAndRanking(123, 2);

    // THEN
    expect(result).toEqual({ artist_name: 'Kanye', ranking: 2 });
  });

  it('shouldUpsertMultipleArtistsIndividually', async () => {
    // GIVEN : on simule findOneAndUpdate qui retourne un objet à chaque appel
    const mockUpdate = jest.fn().mockResolvedValue({ _id: 'mock-id' });

    jest.spyOn(TopListenedArtist, 'findOneAndUpdate').mockImplementation(mockUpdate);

    // WHEN
    const result = await repo.upsertMany(42, [
      { artist_name: 'Artist A', ranking: 1 },
      { artist_name: 'Artist B', ranking: 2 },
    ]);

    // THEN : 2 appels indépendants, un résultat par artiste
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ _id: 'mock-id' }, { _id: 'mock-id' }]);
  });

  it('shouldDeleteAllArtistsByUserIdAndReturnCount', async () => {
    // GIVEN
    jest.spyOn(TopListenedArtist, 'deleteMany').mockResolvedValue({ deletedCount: 2 });

    // WHEN
    const result = await repo.deleteAllByUserId(55);

    // THEN
    expect(result).toBe(2);
  });
});