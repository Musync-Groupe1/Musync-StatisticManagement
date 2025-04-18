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
 * @param {Express} server - Instance du serveur Express
 */
export function setupSwaggerDocs(server) {
  server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}