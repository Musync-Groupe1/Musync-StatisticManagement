import { getEnvVar } from '../utils/envUtils.js';
import axios from 'axios';
import { Kafka } from 'kafkajs';
import kafkaConfig from './kafkaConfig.js';
import { isValidMusicPlatform } from '../utils/inputValidator.js';

const _kafka = new Kafka({
  clientId: kafkaConfig.clientId,
  brokers: kafkaConfig.brokers,
});

const _consumer = _kafka.consumer({ groupId: 'music-statistics-user-group' });
let _isConsumerRunning = false;

/**
 * Extrait les données utilisateur pertinentes depuis un message Kafka.
 * - Récupère l'identifiant utilisateur et la première plateforme musicale valide.
 *
 * @param {Object} data - Données extraites du message Kafka.
 * @param {Object} data.user - Objet contenant l'ID utilisateur.
 * @param {Array<Object>} data.social_media - Liste des réseaux sociaux liés à l'utilisateur.
 * @returns {{ userId: string, platform: string } | null} - Données utilisateur pertinentes, ou `null` si invalides.
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
 * Initialise et démarre le consommateur Kafka.
 * - Se connecte à Kafka.
 * - S'abonne au topic `user`.
 * - Lance l'écoute et le traitement des messages.
 *
 * @async
 * @function startUserConsumer
 * @returns {Promise<void>}
 */
export async function startUserConsumer() {
  if (_isConsumerRunning) {
    console.warn('[Kafka][consumer] Consumer déjà démarré. Ignoré.');
    return;
  }

  await _consumer.connect();
  await _consumer.subscribe({ topic: 'user', fromBeginning: false });

  console.log('[Kafka][consumer] En écoute sur le topic "user"...');

  await _consumer.run({
    eachMessage: async ({ message }) => {
      await handleUserMessage(message);
    },
  });

  _isConsumerRunning = true;
}

/**
 * Traite un message Kafka reçu du topic `user`.
 * - Parse le message.
 * - Extrait les données utilisateur pertinentes.
 * - Appelle l'API interne pour créer les statistiques.
 *
 * @async
 * @param {Object} message - Message brut reçu depuis Kafka.
 * @param {Buffer} message.value - Contenu du message encodé en Buffer.
 * @returns {Promise<void>}
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

async function getServiceToken() {
    const response = await axios.post('http://keycloak:8080/realms/Musync/protocol/openid-connect/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: getEnvVar('KEYCLOAK_CLIENT_ID'),
      client_secret: getEnvVar('KEYCLOAK_CLIENT_SECRET'),
    }), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

/**
 * Envoie une requête HTTP POST à l'API interne pour créer les statistiques utilisateur.
 *
 * @async
 * @param {string} userId - Identifiant unique de l'utilisateur.
 * @param {string} platform - Plateforme musicale validée (ex: 'spotify').
 * @returns {Promise<void>}
 */
async function sendUserToStatisticsApi(userId, platform) {
  try {
    const baseUrl = getEnvVar('BASE_URL');
    //const token = await getServiceToken();

    const response = await axios.post(`${baseUrl}/api/statistics/create`, {
      userId,
      music_platform: platform,
    }/*, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }*/);

    console.log(`[Kafka][consumer] Utilisateur ${userId} inséré avec succès.\nStatus: ${response.status}`);
  } catch (err) {
    console.error(`[Kafka][consumer] Échec d’envoi pour user ${userId} (${platform}) :`, err.message);
  }
}

/**
 * Déconnecte proprement le consommateur Kafka.
 * - Ferme la connexion au cluster Kafka.
 *
 * @async
 * @function disconnectUserConsumer
 * @returns {Promise<void>}
 */
export async function disconnectUserConsumer() {
  try {
    await _consumer.disconnect();
    console.log('[Kafka] Consumer déconnecté');
  } catch (err) {
    console.error('[Kafka] Erreur lors de la déconnexion du consumer Kafka :', err);
  } finally {
    _consumer = null;
    _isConsumerRunning = false;
  }
}