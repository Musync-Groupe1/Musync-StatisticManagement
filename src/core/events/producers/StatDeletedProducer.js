/**
 * @fileoverview Producteur Kafka pour notifier la suppression des statistiques d’un utilisateur.
 * Envoie un message JSON au topic `statistic` contenant uniquement l’identifiant de l’utilisateur
 * et un champ `event` pour indiquer le type d’action (`USER_STATS_DELETED`).
 */

import { getKafkaProducer } from 'infrastructure/kafka/kafkaClient.js';
import kafkaConfig from 'infrastructure/kafka/kafkaConfig.js';

/**
 * Publie un message Kafka lorsque les statistiques musicales d’un utilisateur sont supprimées.
 *
 * @async
 * @function publishStatDeleted
 * @param {string|number} userId - Identifiant unique de l’utilisateur
 * @returns {Promise<void>}
 *
 * @example
 * await publishStatDeleted(123);
 * Envoie un message Kafka avec le contenu :
 *  {
 *    "event": "USER_STATS_DELETED",
 *    "userId": 123
 *  }
 */
export async function publishStatDeleted(userId) {
  if (!userId) {
    console.warn('[Kafka][Producer] userId manquant — suppression non publiée.');
    return;
  }

  try {
    const producer = await getKafkaProducer();

    const message = {
      key: String(userId),
      value: JSON.stringify({
        event: 'USER_STATS_DELETED',
        userId
      })
    };

    await producer.send({
      topic: kafkaConfig.topic,
      messages: [message]
    });

    console.log(`[Kafka][Producer] Suppression envoyée pour user ${userId}`);
  } catch (error) {
    console.error('[Kafka][Producer] Échec de publication suppression :', error);
  }
}