const express = require("express");
const next = require("next");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./src/config/swagger");

const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;
const app = next({ dev });
const handle = app.getRequestHandler();

const server = express();

// Parsage des requêtes JSON et URL encodées
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Documentation Swagger disponible sur /api-docs
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.prepare()
  .then(() => {
    // Gestion des routes API et Next.js
    server.all("*", (req, res) => handle(req, res));

    // Lancement du serveur
    server.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur http://localhost:${PORT}`);
      console.log(`📄 Documentation Swagger : http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("❌ Erreur lors du démarrage du serveur :", err);
    process.exit(1);
  });