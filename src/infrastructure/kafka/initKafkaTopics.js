/**
 * @fileoverview Initialise les topics Kafka requis à l’application.
 * Connecte un admin Kafka, vérifie l’existence du topic, le crée si nécessaire.
 * Réessaie jusqu’à 5 fois en cas d’échec de connexion.
 */

import { Kafka } from 'kafkajs';
import kafkaConfig from './kafkaConfig.js';

// Création d'une instance Kafka avec la configuration de l'application
const _kafka = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers,
});

/**
 * Initialise les topics Kafka nécessaires à l'application.
 *
 * - Connecte un admin Kafka
 * - Vérifie si le topic défini dans `kafkaConfig.topic` existe
 * - Si le topic n'existe pas, il est automatiquement créé
 * - En cas d'échec de connexion, tente 5 fois avec 5 secondes d’attente entre chaque
 *
 * @async
 * @function initKafkaTopics
 * @returns {Promise<void>} - Ne retourne rien mais log l’état de création/connexion
 *
 * @example
 * await initKafkaTopics();
 */
export async function initKafkaTopics() {
  const admin = _kafka.admin();
  let retries = 5;

  while (retries > 0) {
    try {
      console.log('[Kafka] Connexion à Kafka (admin)...');
      await admin.connect();
      console.log('[Kafka] Connecté');

      const topics = await admin.listTopics();

      // Crée le topic s’il n’existe pas
      if (!topics.includes(kafkaConfig.topic)) {
        await admin.createTopics({
          topics: [{ topic: kafkaConfig.topic }],
        });
        console.log(`[Kafka] Topic "${kafkaConfig.topic}" créé`);
      } else {
        console.log(`[Kafka] Topic "${kafkaConfig.topic}" déjà existant`);
      }

      await admin.disconnect();
      break; // Sortie après succès
    } catch (err) {
      retries--;
      console.error(`[Kafka] Connexion échouée. Nouvel essai dans 5s... (${retries} tentatives restantes)`);
      await new Promise((res) => setTimeout(res, 5000));
      if (retries === 0) {
        console.error('[Kafka] Erreur d\'initialisation des topics après plusieurs tentatives :', err);
        throw new Error('Impossible d\'initialiser les topics Kafka');
      }
    }
  }
}