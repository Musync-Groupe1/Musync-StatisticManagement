/**
 * @fileoverview Fournit une initialisation et un accès centralisé au producteur Kafka.
 * Utilise `kafkajs` pour gérer la connexion à Kafka, avec une logique de singleton
 * pour éviter de multiples connexions concurrentes.
 */

import { Kafka } from 'kafkajs';
import config from './kafkaConfig.js';

// Création d'une instance Kafka avec les paramètres définis dans la configuration
const kafka = new Kafka({
  clientId: config.clientId,
  brokers: config.brokers,
});

// Producteur Kafka unique pour toute l'application
/** @type {KafkaProducer|null} */
let _producer = null;

/**
 * Initialise le producteur Kafka s'il ne l'est pas encore.
 * Utilise une instance unique (singleton) pour éviter les connexions multiples.
 *
 * @async
 * @function initKafka
 * @returns {Promise<void>}
 */
export const initKafka = async () => {
  if (!_producer) {
    _producer = kafka.producer();
    await _producer.connect();
    console.log('[Kafka] Producer connecté');
  }
};

/**
 * Retourne une instance unique du producteur Kafka.
 * Si le producteur n'a pas encore été initialisé, il est créé et connecté automatiquement.
 *
 * @async
 * @function getKafkaProducer
 * @returns {Promise<KafkaProducer>} Instance du producteur Kafka
 */
export const getKafkaProducer = async () => {
  if (!_producer) {
    console.warn('[Kafka] Producer non initialisé');
    _producer = kafka.producer();
    await _producer.connect();
    console.log('[Kafka] Producer connecté');
  }
  return _producer;
};