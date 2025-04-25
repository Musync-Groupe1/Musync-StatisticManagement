/**
 * @fileoverview Configuration Kafka utilisée par le service des statistiques musicales.
 * Ce fichier centralise les paramètres de connexion et de topic Kafka utilisés
 * pour produire et consommer des messages dans l'écosystème Kafka.
 */

import { getEnvVar } from '../utils/envUtils.js';

/**
 * Objet de configuration Kafka.
 *
 * @typedef {Object} KafkaConfig
 * @property {string} clientId - Identifiant du client Kafka (utile pour le logging côté broker).
 * @property {string[]} brokers - Liste des adresses des brokers Kafka (host:port).
 * @property {string} topic - Nom du topic Kafka principal utilisé par l’application.
 */

/**
 * Configuration Kafka pour le service des statistiques.
 * - clientId : Identifie ce service auprès de Kafka
 * - brokers : Adresse des brokers accessibles depuis l'application
 * - topic : Nom du topic utilisé pour publier les événements de statistiques
 *
 * @type {KafkaConfig}
 */
const kafkaConfig = {
    clientId: getEnvVar('KAFKA_CLIENT_ID'),
    brokers: [getEnvVar('KAFKA_BROKER')],
    topic: getEnvVar('KAFKA_TOPIC'),
};

export default kafkaConfig;