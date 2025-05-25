/**
 * @typedef {import('express').Express} Express
 */

/**
 * @typedef {import('kafkajs').Producer} KafkaProducer
 */

/**
 * @typedef {Object} Request - Objet représentant la requête HTTP
 * @property {string} method
 * @property {Object} headers
 * @property {Object} query
 * @property {Object} body
 */

/**
 * @typedef {Object} Response - Objet représentant la réponse HTTP
 * @property {function(number): Response} status
 * @property {function(string): Response} send
 * @property {function(Object): Response} json
 * @property {function(string): void} redirect
 */