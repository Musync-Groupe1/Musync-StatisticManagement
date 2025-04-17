/**
 * @fileoverview Producteur Kafka pour notifier la mise à jour des statistiques d’un utilisateur.
 * Envoie un message JSON au topic `statistic` avec les données liées à l’utilisateur.
 */

import { getKafkaProducer } from 'infrastructure/kafka/kafkaClient.js';
import kafkaConfig from 'infrastructure/kafka/kafkaConfig.js';

/**
 * Publie un message Kafka lorsque les statistiques musicales d’un utilisateur sont mises à jour.
 *
 * @async
 * @function publishStatUpdated
 * @param {Object} payload - Données des statistiques utilisateur à publier
 * @param {string|number} payload.userId - ID unique de l’utilisateur
 * @param {string} [payload.favorite_genre] - Genre musical préféré
 * @param {Array<Object>} [payload.top_artists] - Liste des artistes les plus écoutés
 * @param {Array<Object>} [payload.top_musics] - Liste des musiques les plus écoutées
 * @returns {Promise<void>}
 */
export async function publishStatUpdated(payload) {
  // Vérification minimale : l’envoi est conditionné à la présence d’un userId
  if (!payload?.userId) {
    console.warn('[Kafka] Aucun userId fourni, message non publié.');
    return;
  }

  try {
    // Récupération (ou init) d’un producteur Kafka
    const producer = await getKafkaProducer();

    // Construction du message Kafka
    const message = {
      key: String(payload.userId), // Sert au partitionnement
      value: JSON.stringify(payload), // Données encodées en JSON
    };

    // Envoi au topic configuré
    await producer.send({
      topic: kafkaConfig.topic,
      messages: [message],
    });

    console.log(`[Kafka] Statistiques envoyées avec succès pour l’utilisateur ${payload.userId}`);
  } catch (err) {
    console.error(`[Kafka] Échec de l’envoi du message pour user ${payload.userId} :`, err);
  }
}