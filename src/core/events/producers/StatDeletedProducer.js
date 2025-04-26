/**
 * @fileoverview Producteur Kafka pour notifier la suppression des statistiques d’un utilisateur.
 * Envoie un message JSON structuré au topic Kafka principal défini dans la config (`statistic`).
 * Ce message contient :
 *   - `event`: identifiant de l’action (`USER_STATS_DELETED`)
 *   - `userId`: identifiant unique de l’utilisateur concerné
 */

import { getKafkaProducer } from 'infrastructure/kafka/kafkaClient.js';
import kafkaConfig from 'infrastructure/kafka/kafkaConfig.js';

/**
 * Émet un événement Kafka notifiant la suppression des statistiques utilisateur.
 *
 * @async
 * @function publishStatDeleted
 * @param {string|number} userId - Identifiant unique de l’utilisateur
 * @returns {Promise<void>} - Ne retourne rien, loggue le statut de l’envoi
 *
 * @example
 * await publishStatDeleted(123);
 */
export async function publishStatDeleted(userId) {
  if (!userId) {
    console.warn('[Kafka][Producer] userId manquant — suppression non publiée.');
    return;
  }

  try {
    const producer = await getKafkaProducer();
    const message = buildUserStatDeletedMessage(userId);

    await sendKafkaMessage(producer, kafkaConfig.topic, message);

    console.log(`[Kafka][Producer] Suppression envoyée pour user ${userId}`);
  } catch (error) {
    console.error('[Kafka][Producer] Échec de publication suppression :', error);
  }
}

/**
 * Génère le message Kafka JSON à envoyer pour la suppression des stats utilisateur.
 *
 * @private
 * @param {string|number} userId - Identifiant utilisateur
 * @returns {Object} - Objet formaté pour Kafka
 */
function buildUserStatDeletedMessage(userId) {
  return {
    key: String(userId),
    value: JSON.stringify({
      event: 'USER_STATS_DELETED',
      userId
    })
  };
}

/**
 * Envoie un message via Kafka sur un topic donné.
 *
 * @private
 * @param {Producer} producer - Producteur Kafka déjà connecté
 * @param {string} topic - Nom du topic Kafka
 * @param {Object} message - Message Kafka contenant `key` et `value`
 * @returns {Promise<void>}
 */
async function sendKafkaMessage(producer, topic, message) {
  await producer.send({
    topic,
    messages: [message]
  });
}