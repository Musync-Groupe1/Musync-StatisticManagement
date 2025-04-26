import { jest } from '@jest/globals';
import {
  validateMethod,
  setSecurityHeaders,
  responseError
} from 'infrastructure/utils/apiHandler.js';

describe('apiHandler - validateMethod', () => {
  /**
   * GIVEN une méthode HTTP autorisée
   * WHEN on appelle validateMethod avec cette méthode
   * THEN la fonction doit retourner `true` et ne pas modifier la réponse
   */
  it('shouldReturnTrueIfMethodIsAllowed', () => {
    // GIVEN
    const req = { method: 'GET' };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };

    // WHEN
    const result = validateMethod(req, res, ['GET', 'POST']);

    // THEN
    expect(result).toBe(true);
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  /**
   * GIVEN un appel à validateMethod sans liste de méthodes autorisées
   * WHEN la méthode est GET
   * THEN elle doit être acceptée par défaut
   */
  it('shouldDefaultToGetWhenNoMethodListProvided', () => {
    // GIVEN
    const req = { method: 'GET' };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };

    // WHEN
    const result = validateMethod(req, res);

    // THEN
    expect(result).toBe(true);
    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  /**
   * GIVEN une méthode non autorisée
   * WHEN on appelle validateMethod
   * THEN la fonction doit retourner `false` et répondre avec un 405
   */
  it('shouldReturnFalseAndSet405WhenMethodIsNotAllowed', () => {
    // GIVEN
    const req = { method: 'DELETE' };
    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      end: jest.fn()
    };

    // WHEN
    const result = validateMethod(req, res, ['GET', 'POST']);

    // THEN
    expect(result).toBe(false);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'GET, POST');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.end).toHaveBeenCalledWith('Méthode DELETE non autorisée');
  });
});

describe('apiHandler - setSecurityHeaders', () => {
  /**
   * GIVEN une réponse HTTP
   * WHEN on appelle setSecurityHeaders
   * THEN tous les headers de sécurité doivent être ajoutés
   */
  it('shouldSetAllSecurityHeaders', () => {
    // GIVEN
    const res = { setHeader: jest.fn() };

    // WHEN
    setSecurityHeaders(res);

    // THEN
    expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', "default-src 'self'");
    expect(res.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
    expect(res.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    expect(res.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  });
});

describe('apiHandler - responseError', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /**
   * GIVEN une erreur serveur simulée
   * WHEN on appelle responseError
   * THEN la réponse doit contenir un 500 après un court délai
   */
  it('shouldReturn500WithErrorMessageAfterTimeout', () => {
    // GIVEN
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // WHEN
    responseError(res);
    jest.runAllTimers();

    // THEN
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Erreur interne du serveur.' });
  });
});