import { jest } from '@jest/globals';

import MongoTopMusicRepository from 'infrastructure/database/mongo/MongoTopMusicRepository.js';
import TopListenedMusic from 'infrastructure/models/TopListenedMusic.js';

describe('MongoTopMusicRepository', () => {
  const repo = new MongoTopMusicRepository();

  afterEach(() => {
    jest.restoreAllMocks(); // Nettoie les mocks entre chaque test
  });

  it('shouldReturnAllMusicsForUserId', async () => {
    // GIVEN : mock de la chaîne Mongoose find().select().sort().lean()
    const mockSelect = jest.fn().mockReturnThis();
    const mockSort = jest.fn().mockReturnThis();
    const mockLean = jest.fn().mockResolvedValue([
      { music_name: 'Bad Habits', artist_name: 'Ed Sheeran' }
    ]);

    jest.spyOn(TopListenedMusic, 'find').mockReturnValue({
      select: mockSelect,
      sort: mockSort,
      lean: mockLean,
    });

    // WHEN
    const result = await repo.findAllByUserId(42);

    // THEN
    expect(result).toEqual([
      { music_name: 'Bad Habits', artist_name: 'Ed Sheeran' }
    ]);
  });

  it('shouldReturnMusicByUserIdAndRanking', async () => {
    // GIVEN : mock de findOne().lean()
    const mockLean = jest.fn().mockResolvedValue({
      music_name: 'Poker Face',
      artist_name: 'Lady Gaga'
    });

    jest.spyOn(TopListenedMusic, 'findOne').mockReturnValue({ lean: mockLean });

    // WHEN
    const result = await repo.findByUserIdAndRanking(123, 2);

    // THEN
    expect(result).toEqual({
      music_name: 'Poker Face',
      artist_name: 'Lady Gaga'
    });
  });

  it('shouldUpsertMultipleMusicsIndividually', async () => {
    // GIVEN : mock de findOneAndUpdate pour 2 musiques
    const mockUpdate = jest.fn().mockResolvedValue({ _id: 'music-id' });

    jest.spyOn(TopListenedMusic, 'findOneAndUpdate').mockImplementation(mockUpdate);

    // WHEN
    const result = await repo.upsertMany(99, [
      { music_name: 'Song A', artist_name: 'Artist A', ranking: 1 },
      { music_name: 'Song B', artist_name: 'Artist B', ranking: 2 },
    ]);

    // THEN
    expect(mockUpdate).toHaveBeenCalledTimes(2);
    expect(result).toEqual([{ _id: 'music-id' }, { _id: 'music-id' }]);
  });

  it('shouldDeleteAllMusicsByUserIdAndReturnCount', async () => {
    // GIVEN
    jest.spyOn(TopListenedMusic, 'deleteMany').mockResolvedValue({ deletedCount: 3 });

    // WHEN
    const result = await repo.deleteAllByUserId(101);

    // THEN
    expect(result).toBe(3);
  });
});