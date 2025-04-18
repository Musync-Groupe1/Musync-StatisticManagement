/**
 * @fileoverview Point d'entrée principal du serveur Node.js.
 * Initialise l’application Next.js, configure Express.js, Kafka, Swagger et lance le serveur.
 */

import express from "express";
import next from "next";

// Kafka : Producteur + Création automatique des topics
import { initKafka } from './src/infrastructure/kafka/kafkaClient.js';
import { initKafkaTopics } from './src/infrastructure/kafka/initKafkaTopics.js';

// Swagger : Documentation interactive API
import { setupSwaggerDocs } from './src/bootstrap/setupSwagger.js';

// Détection de l’environnement
const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

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

    // Connexion et initialisation du producteur Kafka
    await initKafka();
    await initKafkaTopics();

    // Gestion de toutes les routes via Next.js
    server.all("*", (req, res) => handle(req, res));

    // Démarrage du serveur sur le port spécifié
    server.listen(PORT, () => {
      console.log(`Serveur prêt sur http://localhost:${PORT}`);
      console.log(`Swagger UI : http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("Erreur au démarrage du serveur :", err);
    process.exit(1); // Quitte le processus en cas d’erreur critique
  }
}

// Lance le serveur
startServer();