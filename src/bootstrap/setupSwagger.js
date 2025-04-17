/**
 * @fileoverview Intègre Swagger UI à l’application Express.
 * Permet de visualiser et tester l’API REST de façon interactive sur /api-docs.
 */

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from '../config/swaggerConfig.js';

/**
 * Monte la documentation Swagger UI sur le serveur Express.
 *
 * @function setupSwaggerDocs
 * @param {import('express').Express} server - Instance du serveur Express
 *
 * @example
 * import express from 'express';
 * import { setupSwaggerDocs } from './setupSwagger.js';
 *
 * const app = express();
 * setupSwaggerDocs(app);
 */
export function setupSwaggerDocs(server) {
  server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}