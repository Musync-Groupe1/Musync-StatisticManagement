/**
 * @fileoverview Point d'entrée principal du serveur Node.js.
 * Initialise l’application Next.js, configure Express.js, Kafka, Swagger et lance le serveur.
 */

import express from "express";
import next from "next";

// Kafka : Producteur/Consumer + Création topics + Déconnexion
import { initKafka } from './src/infrastructure/kafka/kafkaClient.js';
import { initKafkaTopics } from './src/infrastructure/kafka/initKafkaTopics.js';
import { startUserConsumer } from './src/infrastructure/kafka/userConsumer.js';
import { shutdownKafkaServer } from './src/bootstrap/shutdownKafka.js';

// Swagger : Documentation interactive API
import { setupSwaggerDocs } from './src/bootstrap/setupSwagger.js';

// Détection de l’environnement
const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

// Définition dynamique du BASE_URL
const BASE_URL = dev
  ? `http://localhost:${PORT}`
  : process.env.BASE_URL || `http://music-statistics-service:${PORT}`;

  // Initialisation de Next.js
const app = next({ dev });
const handle = app.getRequestHandler();

// Création du serveur Express pour encapsuler l'app
const server = express();

/**
 * Fonction principale de démarrage du serveur
 * - Prépare Next.js
 * - Configure Swagger
 * - Initialise Kafka
 * - Démarre le serveur HTTP
 */
async function startServer() {
  try {
    // Préparation des pages Next.js
    await app.prepare();

    // Intégration de Swagger à Express
    setupSwaggerDocs(server);

    // Connexion Kafka (producteur + topics + consumer)
    await initKafka();
    await initKafkaTopics();
    await startUserConsumer();

    // Gestion de toutes les routes via Next.js
    server.all("*", (req, res) => handle(req, res));

    // Démarrage du serveur sur l'URL spécifiée
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Serveur prêt sur ${BASE_URL}`);
      console.log(`Swagger UI : ${BASE_URL}/api-docs`);
    });
  } catch (err) {
    console.error("Erreur au démarrage du serveur :", err);
    process.exit(1); // Quitte le processus en cas d’erreur critique
  }
}

// Gestion des signaux système pour arrêt contrôlé
process.on('SIGINT', shutdownKafkaServer);
process.on('SIGTERM', shutdownKafkaServer);

// Lance le serveur
startServer();