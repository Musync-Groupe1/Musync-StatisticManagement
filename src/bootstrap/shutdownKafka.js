/**
 * @fileoverview Gère l'arrêt contrôlé du serveur, notamment la déconnexion propre de Kafka.
 */

import { disconnectKafka } from '../infrastructure/kafka/kafkaClient.js';
import { disconnectUserConsumer } from '../infrastructure/kafka/userConsumer.js';

/**
 * Gère l'arrêt contrôlé du serveur et la déconnexion de Kafka.
 * - Déconnecte proprement le producteur Kafka et les consommateurs.
 * - Force l'arrêt du processus si la déconnexion prend trop de temps.
 *
 * @async
 * @function shutdownKafkaServer
 */
export async function shutdownKafkaServer() {
    console.log('Arrêt du serveur demandé. Déconnexion de Kafka...');
  
    // Timeout de secours : force l'arrêt si ça prend trop longtemps
    const timeout = setTimeout(() => {
      console.error('Déconnexion Kafka. Forçage de l’arrêt.');
      process.exit(1);
    }, 5000); // 5 secondes
  
    try {
      await Promise.all([
        disconnectKafka(),
        disconnectUserConsumer()
      ]);
      console.log('Kafka déconnecté');
    } catch (err) {
      console.error('Erreur lors de la déconnexion Kafka :', err);
    } finally {
      clearTimeout(timeout);
      process.stdout.write('', () => {
        process.exit(0);
      });
    }
}