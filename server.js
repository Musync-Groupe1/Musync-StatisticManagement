import express from "express";
import next from "next";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./src/config/swaggerConfig.js";
import path from "path";
import { fileURLToPath } from "url";

const dev = process.env.NODE_ENV !== "production";
const PORT = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();
const server = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Laisse Next.js gérer tout le reste (pages + SSR)
app.prepare()
  .then(() => {
    server.all("*", (req, res) => handle(req, res));
    server.listen(PORT, () => {
      console.log(`🚀 Serveur prêt sur http://localhost:${PORT}`);
      console.log(`📄 Swagger UI : http://localhost:${PORT}/api-docs`);
    });
  })
  .catch((err) => {
    console.error("Erreur au démarrage du serveur :", err);
    process.exit(1);
  });