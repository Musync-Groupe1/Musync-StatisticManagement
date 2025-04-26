import UserMusicStats from 'domain/entities/UserMusicStats.js';

describe('UserMusicStats Entity', () => {
  /**
   * @description
   * Ce test vérifie que l’entité est correctement instanciée lorsque
   * toutes les propriétés sont fournies.
   *
   * GIVEN : Des données complètes (userId, genre, plateforme, artistes, musiques)
   * WHEN  : Une instance de UserMusicStats est créée
   * THEN  : Les attributs doivent correspondre aux données d’entrée
   */
  it('shouldInstantiateCorrectlyWithAllFields', () => {
    // GIVEN
    const data = {
      userId: 1,
      favoriteGenre: 'rock',
      musicPlatform: 'spotify',
      topArtists: [{ artist_name: 'Artist 1', ranking: 1 }],
      topMusics: [{ music_name: 'Song 1', artist_name: 'Artist 1', ranking: 1 }]
    };

    // WHEN
    const stats = new UserMusicStats(data);

    // THEN
    expect(stats.userId).toBe(1);
    expect(stats.favoriteGenre).toBe('rock');
    expect(stats.topArtists).toHaveLength(1);
    expect(stats.topMusics).toHaveLength(1);
  });

  /**
   * @description
   * Ce test s'assure que la méthode `isComplete()` retourne `false` lorsque
   * des informations obligatoires sont manquantes ou invalides.
   *
   * GIVEN : Plusieurs cas d'instanciations incomplètes (genre manquant, tableau invalide, etc.)
   * WHEN  : La méthode isComplete() est appelée
   * THEN  : Elle doit retourner false
   */
  it('shouldReturnFalseFromIsCompleteWhenAnyRequiredDataIsMissing', () => {
    // CASE 1 : favoriteGenre manquant
    const s1 = new UserMusicStats({
      userId: 1,
      favoriteGenre: null,
      topArtists: [],
      topMusics: []
    });
    expect(s1.isComplete()).toBe(false);

    // CASE 2 : topArtists n’est pas un tableau
    const s2 = new UserMusicStats({
      userId: 1,
      favoriteGenre: 'rock',
      topArtists: null,
      topMusics: []
    });
    expect(s2.isComplete()).toBe(false);

    // CASE 3 : topMusics n’est pas un tableau
    const s3 = new UserMusicStats({
      userId: 1,
      favoriteGenre: 'rock',
      topArtists: [],
      topMusics: null
    });
    expect(s3.isComplete()).toBe(false);
  });

  /**
   * @description
   * Ce test vérifie que `isComplete()` retourne true lorsque tous les champs nécessaires sont présents.
   *
   * GIVEN : Une instance avec genre, artistes (tableau), musiques (tableau)
   * WHEN  : La méthode isComplete() est appelée
   * THEN  : Elle doit retourner true
   */
  it('shouldReturnTrueFromIsCompleteWhenAllDataIsProvidedCorrectly', () => {
    const stats = new UserMusicStats({
      userId: 1,
      favoriteGenre: 'jazz',
      topArtists: [],
      topMusics: []
    });

    expect(stats.isComplete()).toBe(true);
  });

  /**
   * @description
   * Ce test garantit que la méthode statique `.empty()` retourne une instance vide
   * avec les bonnes valeurs par défaut.
   *
   * GIVEN : Un userId passé à UserMusicStats.empty()
   * WHEN  : L’objet est instancié
   * THEN  : Les champs doivent être null ou des tableaux vides, et isComplete() retourne false
   */
  it('shouldCreateAnEmptyInstanceWithNullValuesUsingEmpty', () => {
    const stats = UserMusicStats.empty(42);

    expect(stats.userId).toBe(42);
    expect(stats.topArtists).toEqual([]);
    expect(stats.topMusics).toEqual([]);
    expect(stats.isComplete()).toBe(false);
  });
});