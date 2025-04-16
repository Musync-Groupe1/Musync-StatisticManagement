import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuration Swagger (OpenAPI 3)
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Music Statistics API',
      version: '1.0.0',
      description: 'API de gestion des statistiques musicales utilisateur via différentes plateformes.',
      contact: {
        name: 'Support API',
        email: 'support@musicstats.com',
      },
    },
    servers: [
      {
        url: process.env.BASE_URL || 'http://localhost:3000',
        description: 'Serveur de développement',
      },
    ],
    components: {
      schemas: {
        // Schéma pour les 3 musiques les plus écoutées d'un utilisateur
        TopListenedMusic: {
          type: "object",
          required: ["user_id", "music_name", "artist_name", "ranking"],
          properties: {
            user_id: { type: "integer", example: 12345, description: "Identifiant unique de l'utilisateur." },
            music_name: { type: "string", maxLength: 255, example: "Musique 1", description: "Nom de la musique écoutée." },
            artist_name: { type: "string", maxLength: 255, example: "Artiste 1", description: "Nom de l'artiste interprète de la musique." },
            ranking: { type: "integer", minimum: 1, maximum: 3, example: 1, unique: true, description: "Classement de la musique parmi les 3 plus écoutées." },
          },
        },
        // Schéma pour les 3 artistes les plus écoutés d'un utilisateur
        TopListenedArtist: {
          type: "object",
          required: ["user_id", "artist_name", "ranking"],
          properties: {
            user_id: { type: "integer", example: 12345, description: "Identifiant unique de l'utilisateur." },
            artist_name: { type: "string", maxLength: 255, example: "Artiste 1", description: "Nom de l'artiste." },
            ranking: { type: "integer", minimum: 1, example: 1, uniue: true, description: "Classement de l'artiste parmi les 3 plus écoutés."},
          },
        },
        // Schéma pour les statistiques utilisateur
        UserMusicStatistic: {
          type: "object",
          required: ["user_id", "favorite_genre", "music_platform"],
          properties: {
            user_id: { type: "integer", unique: true, example: 12345, description: "Identifiant unique de l'utilisateur." },
            favorite_genre: { type: "string", example: "Rock", description: "Genre musical favori de l'utilisateur." },
            music_platform: { 
              type: "string", 
              enum: ["spotify", "appleMusic"], 
              example: "spotify",
              description: "Plateforme de musique utilisée par l'utilisateur."
            },
            top_listened_artists: {
              type: "array",
              items: { $ref: "#/components/schemas/TopListenedArtist" },
              description: "Liste des 3 artistes les plus écoutés par l'utilisateur."
            },
            top_listened_musics: {
              type: "array",
              items: { $ref: "#/components/schemas/TopListenedMusic" },
              description: "Liste des 3 musiques les plus écoutées par l'utilisateur."
            },
          },
        },
      },
    },
  },
  apis: [path.resolve(__dirname, "../pages/api/**/*.js")],
};

// Génération du document Swagger (utilisable pour SwaggerUI)
const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;