import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Définition des options Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Music Statistics API",
      version: "1.2.0",
      description: "API de gestion des statistiques musicales d'un utilisateur.",
      contact: {
        name: "Support API",
        email: "support@musicstats.com",
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || "http://localhost:3000",
        description: "Serveur de développement",
      },
    ],
    components: {
      schemas: {
        // Schéma pour les 3 musiques les plus écoutées d'un utilisateur
        TopListenedMusic: {
          type: "object",
          properties: {
            user_id: { type: "integer", example: 12345 },
            music_name: { type: "string", maxLength: 255, example: "Musique 1" },
            artist_name: { type: "string", maxLength: 255, example: "Artiste 1" },
            ranking: { type: "integer", minimum: 1, maximum: 3, example: 1 },
          },
        },
        // Schéma pour les 3 artistes les plus écoutés d'un utilisateur
        TopListenedArtist: {
          type: "object",
          properties: {
            user_id: { type: "integer", example: 12345 },
            artist_name: { type: "string", maxLength: 255, example: "Artiste 1" },
            ranking: { type: "integer", minimum: 1, example: 1 },
          },
        },
        // Schéma pour les statistiques utilisateur
        UserMusicStatistic: {
          type: "object",
          properties: {
            user_id: { type: "integer", unique: true, example: 12345 },
            favorite_genre: { type: "string", example: "Rock" },
            music_platform: { 
              type: "string", 
              enum: ["spotify", "appleMusic"], 
              example: "spotify" 
            },
            top_listened_artists: {
              type: "array",
              items: { $ref: "#/components/schemas/TopListenedArtist" },
            },
            top_listened_musics: {
              type: "array",
              items: { $ref: "#/components/schemas/TopListenedMusic" },
            },
          },
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../pages/api/**/*.js")],
};

// Génération du Swagger
const swaggerSpec = swaggerJSDoc(options);

// Exportation
export default swaggerSpec;
