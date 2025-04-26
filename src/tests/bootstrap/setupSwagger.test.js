import express from 'express';
import request from 'supertest';
import { setupSwaggerDocs } from '../../bootstrap/setupSwagger.js';

/**
 * @description
 * Ce test vérifie que la documentation Swagger est bien exposée sur la route `/api-docs`.
 * 
 * GIVEN : Un serveur Express avec Swagger monté via `setupSwaggerDocs`
 * WHEN  : On effectue une requête GET vers `/api-docs`
 * THEN  : Le serveur doit répondre avec un statut HTTP de redirection (301 vers `/api-docs/`)
 */

describe('Swagger Integration (integration test)', () => {
  it('should expose Swagger UI on /api-docs', async () => {
    // GIVEN
    const app = express();
    setupSwaggerDocs(app);

    // WHEN
    const res = await request(app).get('/api-docs');

    // THEN
    expect(res.status).toBe(301);
    expect(res.header.location).toBe('/api-docs/');
  });
});
