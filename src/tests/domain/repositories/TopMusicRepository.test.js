import TopMusicRepository from 'domain/repositories/TopMusicRepository.js';

describe('TopMusicRepository abstract interface', () => {
  let repo;

  beforeEach(() => {
    repo = new TopMusicRepository();
  });

  /**
   * @description
   * Ce test vérifie que `findAllByUserId()` lève une erreur car non implémentée.
   *
   * GIVEN : Une instance abstraite de TopMusicRepository
   * WHEN  : On appelle findAllByUserId()
   * THEN  : Une exception "non implémenté" est levée
   */
  it('shouldThrowOnFindAllByUserId', async () => {
    await expect(repo.findAllByUserId(1)).rejects.toThrow(
      'TopMusicRepository.findAllByUserId() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `findByUserIdAndRanking()` lève une erreur car non implémentée.
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle findByUserIdAndRanking()
   * THEN  : Une exception explicite est levée
   */
  it('shouldThrowOnFindByUserIdAndRanking', async () => {
    await expect(repo.findByUserIdAndRanking(1, 1)).rejects.toThrow(
      'TopMusicRepository.findByUserIdAndRanking() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `upsertMany()` lève une erreur car non implémentée.
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle upsertMany()
   * THEN  : Une exception explicite est levée
   */
  it('shouldThrowOnUpsertMany', async () => {
    await expect(repo.upsertMany(1, [])).rejects.toThrow(
      'TopMusicRepository.upsertMany() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `deleteAllByUserId()` lève une erreur car non implémentée.
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle deleteAllByUserId()
   * THEN  : Une exception explicite est levée
   */
  it('shouldThrowOnDeleteAllByUserId', async () => {
    await expect(repo.deleteAllByUserId(1)).rejects.toThrow(
      'TopMusicRepository.deleteAllByUserId() non implémenté'
    );
  });
});