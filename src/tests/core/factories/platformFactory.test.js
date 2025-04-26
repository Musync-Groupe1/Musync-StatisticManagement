await import('../../setup/jest.setup.mocks.js');
const { getPlatformStrategy } = await import('../../../core/factories/PlatformFactory.js');
const { default: SpotifyStrategy } = await import('../../../core/strategies/SpotifyStrategy.js');

/**
 * @description
 * Tests unitaires de la factory `getPlatformStrategy`, qui retourne une stratégie musicale selon la plateforme.
 * 
 * GIVEN : Une plateforme (ex. 'spotify')
 * WHEN  : On appelle la factory avec cette plateforme et un code OAuth
 * THEN  : On obtient une instance de la stratégie correspondante, ou une erreur si la plateforme n’est pas prise en charge
 */
describe('getPlatformStrategy', () => {

  /**
   * GIVEN : Une plateforme "spotify" et un code OAuth
   * WHEN  : On appelle la factory
   * THEN  : Elle doit retourner une instance de SpotifyStrategy initialisée
   */
  it('shouldReturnSpotifyStrategy_whenPlatformIsSpotify', async () => {
    // GIVEN
    const mockCode = 'mock-code';

    // WHEN
    const strategy = await getPlatformStrategy('spotify', mockCode);

    // THEN
    expect(SpotifyStrategy).toHaveBeenCalledWith({ code: mockCode });
    expect(strategy.init).toHaveBeenCalled();
    expect(strategy.getStats).toBeDefined();
  });

  /**
   * GIVEN : Une plateforme inconnue
   * WHEN  : On appelle la factory
   * THEN  : Une erreur doit être levée mentionnant l’invalidité
   */
  it('shouldThrowError_whenPlatformIsUnknown', async () => {
    await expect(getPlatformStrategy('unknown', 'code'))
      .rejects
      .toThrow('Plateforme inconnue : unknown');
  });
});