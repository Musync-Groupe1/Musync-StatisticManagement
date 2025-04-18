import { validateInput } from 'infrastructure/utils/inputValidator.js';

describe('validateInput - Vérifie si une entrée est alphanumérique avec ou sans espaces', () => {
  
  /**
   * GIVEN une chaîne alphanumérique avec espaces
   * WHEN on la valide
   * THEN le résultat doit être `true`
   */
  it('shouldReturnTrueForAlphanumericStringWithSpaces', () => {
    // GIVEN
    const input = 'Hello World 123';

    // WHEN
    const result = validateInput(input);

    // THEN
    expect(result).toBe(true);
  });

  /**
   * GIVEN une chaîne alphanumérique sans espaces
   * WHEN on la valide
   * THEN le résultat doit être `true`
   */
  it('shouldReturnTrueForPureAlphanumericString', () => {
    // GIVEN
    const input = 'Hello123';

    // WHEN
    const result = validateInput(input);

    // THEN
    expect(result).toBe(true);
  });

  /**
   * GIVEN une chaîne contenant des caractères spéciaux
   * WHEN on la valide
   * THEN le résultat doit être `false`
   */
  it('shouldReturnFalseForStringWithSpecialCharacters', () => {
    // GIVEN
    const input = 'Hello@123!';

    // WHEN
    const result = validateInput(input);

    // THEN
    expect(result).toBe(false);
  });

  /**
   * GIVEN une chaîne vide
   * WHEN on la valide
   * THEN le résultat doit être `false`
   */
  it('shouldReturnFalseForEmptyString', () => {
    // GIVEN
    const input = '';

    // WHEN
    const result = validateInput(input);

    // THEN
    expect(result).toBe(false);
  });

  /**
   * GIVEN une valeur non textuelle (ex: un nombre)
   * WHEN on la valide
   * THEN le résultat doit être `false`
   */
  it('shouldReturnFalseForNonStringInput', () => {
    // GIVEN
    const input = 12345;

    // WHEN
    const result = validateInput(input);

    // THEN
    expect(result).toBe(false);
  });
});