import UserStatsRepository from 'domain/repositories/UserStatsRepository.js';

describe('UserStatsRepository abstract interface', () => {
  let repo;

  beforeEach(() => {
    repo = new UserStatsRepository();
  });

  /**
   * @description
   * Ce test vérifie que `findByUserId()` lève une exception car non implémentée.
   *
   * GIVEN : Une instance abstraite de UserStatsRepository
   * WHEN  : On appelle findByUserId()
   * THEN  : Une erreur "non implémenté" doit être levée
   */
  it('shouldThrowOnFindByUserId', async () => {
    await expect(repo.findByUserId(1)).rejects.toThrow(
      'UserStatsRepository.findByUserId() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `updateOrCreate()` lève une exception car non implémentée.
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle updateOrCreate()
   * THEN  : Une erreur "non implémenté" doit être levée
   */
  it('shouldThrowOnUpdateOrCreate', async () => {
    await expect(repo.updateOrCreate(1, {})).rejects.toThrow(
      'UserStatsRepository.updateOrCreate() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `deleteByUserId()` lève une exception car non implémentée.
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle deleteByUserId()
   * THEN  : Une erreur "non implémenté" doit être levée
   */
  it('shouldThrowOnDeleteByUserId', async () => {
    await expect(repo.deleteByUserId(1)).rejects.toThrow(
      'UserStatsRepository.deleteByUserId() non implémenté'
    );
  });
});