/**
 * @fileoverview Producteur Kafka pour notifier la mise à jour des statistiques d’un utilisateur.
 * Envoie un message structuré au topic Kafka `statistic`, incluant :
 *   - `event`: "USER_STATS_UPDATED"
 *   - `userId`: identifiant de l’utilisateur
 *   - `favorite_genre`, `top_artists`, `top_musics` : données facultatives
 */

import { getKafkaProducer } from 'infrastructure/kafka/kafkaClient.js';
import kafkaConfig from 'infrastructure/kafka/kafkaConfig.js';

/**
 * Publie un message Kafka indiquant que les statistiques d’un utilisateur ont été mises à jour.
 *
 * @async
 * @function publishStatUpdated
 * @param {Object} payload - Données statistiques utilisateur
 * @param {string|number} payload.userId - Identifiant unique de l’utilisateur
 * @param {string} [payload.favorite_genre] - Genre musical préféré
 * @param {Array<Object>} [payload.top_artists] - Top artistes
 * @param {Array<Object>} [payload.top_musics] - Top musiques
 * @returns {Promise<void>}
 */
export async function publishStatUpdated(payload) {
  if (!payload?.userId) {
    console.warn('[Kafka][Producer] Aucun userId fourni, message non publié.');
    return;
  }

  try {
    const producer = await getKafkaProducer();
    const message = buildStatUpdatedMessage(payload);

    await sendKafkaMessage(producer, kafkaConfig.topic, message);

    console.log(`[Kafka][Producer] Statistiques mises à jour publiées pour user ${payload.userId}`);
  } catch (err) {
    console.error(`[Kafka][Producer] Échec de l’envoi du message Kafka :`, err);
  }
}

/**
 * Construit un message Kafka pour signaler la mise à jour des stats utilisateur.
 *
 * @private
 * @param {Object} payload - Données utilisateur à publier
 * @returns {Object} - Message Kafka formaté avec `key` et `value`
 */
function buildStatUpdatedMessage(payload) {
  return {
    key: String(payload.userId),
    value: JSON.stringify({
      event: 'USER_STATS_UPDATED',
      userId: payload.userId,
      favorite_genre: payload.favorite_genre,
      top_artists: payload.top_artists,
      top_musics: payload.top_musics,
    }),
  };
}

/**
 * Envoie un message Kafka vers un topic donné.
 *
 * @private
 * @param {Producer} producer - Producteur Kafka connecté
 * @param {string} topic - Nom du topic Kafka
 * @param {Object} message - Message avec `key` et `value`
 * @returns {Promise<void>}
 */
async function sendKafkaMessage(producer, topic, message) {
  await producer.send({
    topic,
    messages: [message],
  });
}