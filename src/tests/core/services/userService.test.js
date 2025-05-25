import { jest } from '@jest/globals';
import UserService from 'core/services/userService.js';

describe('UserService', () => {
  let mockUserRepo;
  let service;

  beforeEach(() => {
    mockUserRepo = {
      findPlatformByUserId: jest.fn(),
      findByUserId: jest.fn(),
      exists: jest.fn(),
      updateOrCreate: jest.fn(),
      deleteByUserId: jest.fn(),
    };

    service = new UserService({ userRepo: mockUserRepo });
  });

  describe('findPlatformByUserId', () => {
    it('should return platform from repository', async () => {
      // GIVEN
      mockUserRepo.findPlatformByUserId.mockResolvedValue('spotify');

      // WHEN
      const result = await service.findPlatformByUserId('user-123');

      // THEN
      expect(mockUserRepo.findPlatformByUserId).toHaveBeenCalledWith('user-123');
      expect(result).toBe('spotify');
    });
  });

  describe('findByUserId', () => {
    it('should return user object from repository', async () => {
      // GIVEN
      const fakeUser = { user_id: '123', music_platform: 'spotify' };
      mockUserRepo.findByUserId.mockResolvedValue(fakeUser);

      // WHEN
      const result = await service.findByUserId('123');

      // THEN
      expect(mockUserRepo.findByUserId).toHaveBeenCalledWith('123');
      expect(result).toEqual(fakeUser);
    });
  });

  describe('exists', () => {
    it('should return true if user exists', async () => {
      // GIVEN
      mockUserRepo.exists.mockResolvedValue(true);

      // WHEN
      const result = await service.exists('user-abc');

      // THEN
      expect(mockUserRepo.exists).toHaveBeenCalledWith('user-abc');
      expect(result).toBe(true);
    });
  });

  describe('updateOrCreate', () => {
    it('should call updateOrCreate with userId and platform', async () => {
      // GIVEN
      const savedUser = { user_id: '42', music_platform: 'spotify' };
      mockUserRepo.updateOrCreate.mockResolvedValue(savedUser);

      // WHEN
      const result = await service.updateOrCreate('42', 'spotify');

      // THEN
      expect(mockUserRepo.updateOrCreate).toHaveBeenCalledWith('42', 'spotify');
      expect(result).toEqual(savedUser);
    });
  });

  describe('deleteByUserId', () => {
    it('should call deleteByUserId and return deleted count', async () => {
      // GIVEN
      mockUserRepo.deleteByUserId.mockResolvedValue(1);

      // WHEN
      const result = await service.deleteByUserId('42');

      // THEN
      expect(mockUserRepo.deleteByUserId).toHaveBeenCalledWith('42');
      expect(result).toBe(1);
    });
  });
});