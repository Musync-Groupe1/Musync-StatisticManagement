import axios from 'axios';
import { Kafka } from 'kafkajs';
import kafkaConfig from './kafkaConfig.js';
import { isValidMusicPlatform } from '../utils/inputValidator.js';

const kafka = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers,
});

const consumer = kafka.consumer({ groupId: 'music-statistics-user-group' });

/**
 * Extrait l'ID utilisateur et la première plateforme musicale valide.
 * @param {Object} data - Données du message Kafka
 * @returns {{ userId: number, platform: string }|null}
 */
function extractRelevantUserData(data) {
  const userId = data?.user?.user_id;
  const socialMediaList = data?.social_media;

  if (!userId || !Array.isArray(socialMediaList)) {
    console.warn('[Kafka][consumer] Message mal formé ou incomplet. Ignoré.');
    return null;
  }

  const platform = socialMediaList
    .map((media) => media?.social_media_name?.toLowerCase())
    .find(isValidMusicPlatform);

  if (!platform) {
    console.info(`[Kafka][consumer] Aucune plateforme musicale valide trouvée pour l'utilisateur ${userId}`);
    return null;
  }

  return { userId, platform };
}

/**
 * Envoie une requête POST à l’API /api/statistics/create
 * @param {number} userId
 * @param {string} platform
 */
async function sendUserToStatisticsApi(userId, platform) {
  try {
    const response = await axios.post('http://localhost:3000/api/statistics/create', {
      userId,
      music_platform: platform,
    });
    console.log(`[Kafka][consumer] Utilisateur ${userId} inséré avec succès. Status: ${response.status}`);
  } catch (err) {
    console.error(`[Kafka][consumer] Échec d’envoi pour user ${userId} (${platform}) :`, err.message);
  }
}

/**
 * Traite chaque message Kafka reçu
 * @param {Object} message
 */
async function handleUserMessage(message) {
  try {
    const data = JSON.parse(message.value.toString());
    const userData = extractRelevantUserData(data);

    if (!userData) return;

    const { userId, platform } = userData;

    console.log(`[Kafka][consumer] Appel de /api/statistics/create pour user ${userId} (${platform})`);
    await sendUserToStatisticsApi(userId, platform);
  } catch (err) {
    console.error('[Kafka][consumer] Erreur de parsing ou de traitement du message :', err.message);
  }
}

/**
 * Démarre le consumer Kafka
 */
export async function startUserConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: 'user', fromBeginning: false });

  console.log('[Kafka][consumer] En écoute sur le topic "user"...');

  await consumer.run({
    eachMessage: async ({ message }) => {
      await handleUserMessage(message);
    },
  });
}