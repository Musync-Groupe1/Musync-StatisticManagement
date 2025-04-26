import {
    isValidUserId,
    isValidRanking,
    isValidMusicPlatform,
    isUserStatsEmpty
  } from 'infrastructure/utils/inputValidator.js';
  
  describe('inputValidator utility functions', () => {
    describe('isValidUserId', () => {
      it('should return true for integer string', () => {
        expect(isValidUserId('123')).toBe(true);
      });
  
      it('should return true for integer number', () => {
        expect(isValidUserId(456)).toBe(true);
      });
  
      it('should return false for non-integer string', () => {
        expect(isValidUserId('abc')).toBe(false);
      });
  
      it('should return false for float number', () => {
        expect(isValidUserId(12.5)).toBe(false);
      });
  
      it('should return false for null or undefined', () => {
        expect(isValidUserId(null)).toBe(false);
        expect(isValidUserId(undefined)).toBe(false);
      });
    });
  
    describe('isValidRanking', () => {
      it('should return true for valid rankings (1, 2, 3)', () => {
        expect(isValidRanking(1)).toBe(true);
        expect(isValidRanking('2')).toBe(true);
        expect(isValidRanking(3)).toBe(true);
      });
  
      it('should return false for values outside 1-3', () => {
        expect(isValidRanking(0)).toBe(false);
        expect(isValidRanking(4)).toBe(false);
        expect(isValidRanking('10')).toBe(false);
      });
  
      it('should return false for non-numeric values', () => {
        expect(isValidRanking('abc')).toBe(false);
        expect(isValidRanking(null)).toBe(false);
      });
    });
  
    describe('isValidMusicPlatform', () => {
      it('should return true for supported platforms (case insensitive)', () => {
        expect(isValidMusicPlatform('spotify')).toBe(true);
        expect(isValidMusicPlatform('Spotify')).toBe(true);
        expect(isValidMusicPlatform('SPOTIFY')).toBe(true);
      });
  
      it('should return false for unsupported platforms', () => {
        expect(isValidMusicPlatform('deezer')).toBe(false);
        expect(isValidMusicPlatform('')).toBe(false);
        expect(isValidMusicPlatform(null)).toBe(false);
      });
    });
  
    describe('isUserStatsEmpty', () => {
      it('should return true for null or undefined stats', () => {
        expect(isUserStatsEmpty(null)).toBe(true);
        expect(isUserStatsEmpty(undefined)).toBe(true);
      });
  
      it('should return true when both top_listened_artists and top_listened_musics are empty or missing', () => {
        expect(isUserStatsEmpty({})).toBe(true);
        expect(isUserStatsEmpty({ top_listened_artists: [], top_listened_musics: [] })).toBe(true);
      });
  
      it('should return false if top_listened_artists has data', () => {
        expect(isUserStatsEmpty({ top_listened_artists: [{ name: 'artist' }], top_listened_musics: [] })).toBe(false);
      });
  
      it('should return false if top_listened_musics has data', () => {
        expect(isUserStatsEmpty({ top_listened_artists: [], top_listened_musics: [{ name: 'song' }] })).toBe(false);
      });
    });
  });  