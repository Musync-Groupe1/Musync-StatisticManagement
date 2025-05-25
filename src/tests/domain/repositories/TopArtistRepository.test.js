import TopArtistRepository from 'domain/repositories/TopArtistRepository.js';

describe('TopArtistRepository abstract interface', () => {
  let repo;

  beforeEach(() => {
    repo = new TopArtistRepository();
  });

  /**
   * @description
   * Ce test vérifie que `findAllByUserId()` lève une erreur car cette méthode est abstraite
   *
   * GIVEN : Une instance de la classe abstraite TopArtistRepository
   * WHEN  : On appelle la méthode findAllByUserId()
   * THEN  : Une erreur "non implémenté" doit être levée
   */
  it('shouldThrowOnFindAllByUserId', async () => {
    await expect(repo.findAllByUserId(1)).rejects.toThrow(
      'TopArtistRepository.findAllByUserId() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `findByUserIdAndRanking()` lève une erreur car elle est abstraite
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle findByUserIdAndRanking()
   * THEN  : Une exception explicite doit être levée
   */
  it('shouldThrowOnFindByUserIdAndRanking', async () => {
    await expect(repo.findByUserIdAndRanking(1, 1)).rejects.toThrow(
      'TopArtistRepository.findByUserIdAndRanking() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `upsertMany()` lève une erreur car elle est abstraite
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle upsertMany()
   * THEN  : Une erreur "non implémenté" doit être levée
   */
  it('shouldThrowOnUpsertMany', async () => {
    await expect(repo.upsertMany(1, [])).rejects.toThrow(
      'TopArtistRepository.upsertMany() non implémenté'
    );
  });

  /**
   * @description
   * Ce test vérifie que `deleteAllByUserId()` lève une erreur car elle est abstraite
   *
   * GIVEN : Une instance abstraite
   * WHEN  : On appelle deleteAllByUserId()
   * THEN  : Une erreur "non implémenté" doit être levée
   */
  it('shouldThrowOnDeleteAllByUserId', async () => {
    await expect(repo.deleteAllByUserId(1)).rejects.toThrow(
      'TopArtistRepository.deleteAllByUserId() non implémenté'
    );
  });
});