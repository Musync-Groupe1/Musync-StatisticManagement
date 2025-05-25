import { jest } from '@jest/globals';
import MongoUserRepository from 'infrastructure/database/mongo/MongoUserRepository.js';
import User from 'infrastructure/models/User.js';

describe('MongoUserRepository', () => {
  const repo = new MongoUserRepository();

  afterEach(() => {
    jest.restoreAllMocks(); // Réinitialisation des mocks après chaque test
  });

  it('shouldReturnPlatformForUserId', async () => {
    // GIVEN
    jest.spyOn(User, 'findOne').mockReturnValue({
      lean: jest.fn().mockResolvedValue({ music_platform: 'spotify' }),
    });

    // WHEN
    const platform = await repo.findPlatformByUserId('user-123');

    // THEN
    expect(platform).toBe('spotify');
  });

  it('shouldReturnNullWhenUserNotFound', async () => {
    // GIVEN
    jest.spyOn(User, 'findOne').mockReturnValue({
      lean: jest.fn().mockResolvedValue(null),
    });

    // WHEN
    const platform = await repo.findPlatformByUserId('unknown');

    // THEN
    expect(platform).toBeNull();
  });

  it('shouldUpdateOrCreateUser', async () => {
    // GIVEN
    const mockUser = { user_id: 'abc', music_platform: 'spotify' };
    jest.spyOn(User, 'findOneAndUpdate').mockResolvedValue(mockUser);

    // WHEN
    const result = await repo.updateOrCreate('abc', 'spotify');

    // THEN
    expect(User.findOneAndUpdate).toHaveBeenCalledWith(
      { user_id: 'abc' },
      { user_id: 'abc', music_platform: 'spotify' },
      { upsert: true, new: true, runValidators: true }
    );
    expect(result).toEqual(mockUser);
  });

  it('shouldDeleteUserByUserId', async () => {
    // GIVEN
    jest.spyOn(User, 'deleteOne').mockResolvedValue({ deletedCount: 1 });

    // WHEN
    const result = await repo.deleteByUserId('user-42');

    // THEN
    expect(User.deleteOne).toHaveBeenCalledWith({ user_id: 'user-42' });
    expect(result).toBe(1);
  });

  it('shouldReturnTrueIfUserExists', async () => {
    // GIVEN
    jest.spyOn(User, 'exists').mockResolvedValue(true);

    // WHEN
    const result = await repo.exists('existing-id');

    // THEN
    expect(User.exists).toHaveBeenCalledWith({ user_id: 'existing-id' });
    expect(result).toBe(true);
  });

  it('shouldReturnFalseIfUserDoesNotExist', async () => {
    // GIVEN
    jest.spyOn(User, 'exists').mockResolvedValue(null);

    // WHEN
    const result = await repo.exists('nonexistent');

    // THEN
    expect(result).toBe(false);
  });

  it('shouldFindUserByUserId', async () => {
    // GIVEN
    const mockUser = { user_id: 'user-1', music_platform: 'spotify' };
    jest.spyOn(User, 'findOne').mockReturnValue({
      lean: jest.fn().mockResolvedValue(mockUser),
    });

    // WHEN
    const result = await repo.findByUserId('user-1');

    // THEN
    expect(result).toEqual(mockUser);
  });
});