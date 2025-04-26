import { jest } from '@jest/globals';

/**
 * @description
 * Ce bloc configure un mock complet de la classe `SpotifyStrategy` via `jest.unstable_mockModule`.
 * 
 * Cela permet de simuler son comportement **avant l'importation réelle** du module testé,
 * notamment pour les tests d'intégration ou de use case (ex : `FetchUserMusicStats`).
 *
 * La stratégie Spotify simulée :
 * - accepte un constructeur vide
 * - expose une méthode `init` qui ne fait rien (mockée en resolved `undefined`)
 * - expose une méthode `getStats` qui retourne un jeu de données statique
 *   contenant :
 *   - un genre musical préféré (`pop`)
 *   - des tableaux vides pour les artistes et musiques
 *
 * Ce mock est utilisé pour **tester l'orchestration sans appel réel à Spotify**.
 */
jest.unstable_mockModule('core/strategies/SpotifyStrategy.js', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      init: jest.fn().mockResolvedValue(undefined),
      getStats: jest.fn().mockResolvedValue({
        favoriteGenre: 'pop',
        topArtists: [],
        topMusics: []
      })
    }))
  };
});