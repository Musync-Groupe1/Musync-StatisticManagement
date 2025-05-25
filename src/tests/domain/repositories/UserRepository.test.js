import UserRepository from 'domain/repositories/UserRepository.js';

describe('UserRepository abstract interface', () => {
  let repo;

  beforeEach(() => {
    repo = new UserRepository();
  });

  /**
   * Vérifie que findPlatformByUserId() lève une erreur.
   */
  it('shouldThrowOnFindPlatformByUserId', async () => {
    await expect(repo.findPlatformByUserId('123')).rejects.toThrow(
      'UserRepository.findPlatformByUserId() non implémenté'
    );
  });

  /**
   * Vérifie que updateOrCreate() lève une erreur.
   */
  it('shouldThrowOnUpdateOrCreate', async () => {
    await expect(repo.updateOrCreate('123', 'spotify')).rejects.toThrow(
      'UserRepository.updateOrCreate() non implémenté'
    );
  });

  /**
   * Vérifie que deleteByUserId() lève une erreur.
   */
  it('shouldThrowOnDeleteByUserId', async () => {
    await expect(repo.deleteByUserId('123')).rejects.toThrow(
      'UserRepository.deleteByUserId() non implémenté'
    );
  });

  /**
   * Vérifie que exists() lève une erreur.
   */
  it('shouldThrowOnExists', async () => {
    await expect(repo.exists('123')).rejects.toThrow(
      'UserRepository.exists() non implémenté'
    );
  });

  /**
   * Vérifie que findByUserId() lève une erreur.
   */
  it('shouldThrowOnFindByUserId', async () => {
    await expect(repo.findByUserId('123')).rejects.toThrow(
      'UserRepository.findByUserId() non implémenté'
    );
  });
});