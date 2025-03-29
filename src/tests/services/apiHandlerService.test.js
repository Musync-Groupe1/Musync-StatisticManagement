import connectToDatabase from '../../services/databaseService';
import {
  validateMethod,
  setSecurityHeaders,
  validateInput,
  ensureDatabaseConnection,
  responseError
} from '../../services/apiHandlerService';

describe('validateMethod', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { 
      setHeader: jest.fn() 
    };
  });

  test('Should return true if the method is GET', () => {
    // GIVEN
    req.method = 'GET';

    // WHEN
    const result = validateMethod(req, res);

    // THEN
    expect(result).toBe(true);
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  test('Should return false if the method is not GET', () => {
    // GIVEN
    req.method = 'POST';

    // WHEN
    const result = validateMethod(req, res);

    // THEN
    expect(result).toBe(false);
    expect(res.setHeader).toHaveBeenCalledWith("Allow", "GET");
  });
});

describe('setSecurityHeaders', () => {
  let res;

  beforeEach(() => {
    res = { 
      setHeader: jest.fn() 
    };
  });

  test('Should set Content-Security-Policy header', () => {
    // GIVEN
    setSecurityHeaders(res);

    // WHEN & THEN
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Security-Policy",
      "default-src 'self'"
    );
  });

  test('Should set X-Content-Type-Options header', () => {
    // GIVEN
    setSecurityHeaders(res);

    // WHEN & THEN
    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Content-Type-Options",
      "nosniff"
    );
  });

  test('Devrait définir X-Frame-Options', () => {
    // GIVEN
    setSecurityHeaders(res);

    // WHEN & THEN
    expect(res.setHeader).toHaveBeenCalledWith(
      "X-Frame-Options",
      "DENY"
    );
  });

  test('Devrait définir Strict-Transport-Security', () => {
    // GIVEN
    setSecurityHeaders(res);

    // WHEN & THEN
    expect(res.setHeader).toHaveBeenCalledWith(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  });

  test('Devrait appeler setHeader quatre fois', () => {
    // GIVEN
    setSecurityHeaders(res);

    // WHEN & THEN
    expect(res.setHeader).toHaveBeenCalledTimes(4);
  });
});

describe('validateInput', () => {
  test('Should return false if the input is empty or null', () => {
    // GIVEN
    const inputs = [null, undefined, ''];

    // WHEN
    inputs.forEach(input => {
      const result = validateInput(input);

      // THEN
      expect(result).toBe(false);
    });
  });

  test('Should return false if the input is not a string', () => {
    // GIVEN
    const inputs = [123, {}, [], true];

    // WHEN
    inputs.forEach(input => {
      const result = validateInput(input);

      // THEN
      expect(result).toBe(false);
    });
  });

  test('Should return false if the input contains non-alphanumeric characters', () => {
    // GIVEN
    const inputs = ['hello@world', 'bonjour#123', 'invalid-input!'];

    // WHEN
    inputs.forEach(input => {
      const result = validateInput(input);

      // THEN
      expect(result).toBe(false);
  });
  });

  test('Should return true if the input is a valid alphanumeric string', () => {
    // GIVEN
    const inputs = ['HelloWorld', 'Bonjour123', 'Valid Input'];

    // WHEN
    inputs.forEach(input => {
      const result = validateInput(input);

      // THEN
      expect(result).toBe(true);
    });
  });

  test('Should return false if the input contains special characters, even with spaces', () => {
    // GIVEN
    const inputs = ['Invalid Input!', 'Another$Test'];

    // WHEN
    inputs.forEach(input => {
      const result = validateInput(input);

      // THEN
      expect(result).toBe(false);
    });
  });
});

jest.mock('../../services/databaseService');

describe('ensureDatabaseConnection', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('Should return true when the database connection is successful', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(true);

    // WHEN
    const result = await ensureDatabaseConnection();

    // THEN
    expect(result).toBe(true);
    expect(connectToDatabase).toHaveBeenCalledTimes(1);
  });

  test('Should return false when the database connection fails', async () => {
    // GIVEN
    connectToDatabase.mockResolvedValue(false);

    // WHEN
    const result = await ensureDatabaseConnection();

    // THEN
    expect(result).toBe(false);
    expect(connectToDatabase).toHaveBeenCalledTimes(1);
  });

  test('Should return false when an error is thrown during the connection', async () => {
    // GIVEN
    connectToDatabase.mockRejectedValue(new Error('Connection failed'));
  
    // WHEN
    const result = await ensureDatabaseConnection();
  
    // THEN
    expect(result).toBe(false);
    expect(connectToDatabase).toHaveBeenCalledTimes(1);
  });
});

jest.useFakeTimers();

describe('responseError', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
    jest.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('Should return a response with a 500 status and an error message', () => {
    // GIVEN
    responseError(res);
  
    // WHEN
    jest.runAllTimers();
  
    // THEN
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Erreur interne du serveur." });
  });

  test('Should apply a random delay between 500ms and 1500ms', () => {
    // GIVEN
    responseError(res);
  
    // WHEN
    expect(setTimeout).toHaveBeenCalledTimes(1);
  
    // THEN
    const delay = setTimeout.mock.calls[0][1];
    expect(delay).toBeGreaterThanOrEqual(500);
    expect(delay).toBeLessThanOrEqual(1500);
  });
  
});