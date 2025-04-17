/**
 * @fileoverview Cas d'utilisation pour récupérer et sauvegarder les statistiques musicales
 * d'un utilisateur en utilisant une stratégie (ex : Spotify, Apple Music...).
 * Applique les principes de Clean Architecture : le UseCase dépend de l’abstraction, pas de l’implémentation.
 * 
 * Intègre également une publication Kafka sur le topic "statistic" pour notifier
 * les autres services (ex: RelationshipManagement) de la mise à jour des données.
 */

import { publishStatUpdated } from 'core/events/producers/StatUpdatedProducer.js';

export default class FetchUserMusicStats {

  /**
   * Initialise le cas d’usage avec les dépendances nécessaires.
   *
   * @param {Object} deps - Dépendances injectées
   * @param {Object} deps.strategy - Stratégie de plateforme (SpotifyStrategy, etc.)
   * @param {string|number} deps.userId - ID unique de l’utilisateur
   * @param {Object} deps.userRepo - Repository pour les statistiques globales utilisateur
   * @param {Object} deps.artistRepo - Repository pour les artistes les plus écoutés
   * @param {Object} deps.musicRepo - Repository pour les musiques les plus écoutées
   */
  constructor({ strategy, userId, userRepo, artistRepo, musicRepo }) {
    this.strategy = strategy;
    this.userId = userId;
    this.userRepo = userRepo;
    this.artistRepo = artistRepo;
    this.musicRepo = musicRepo;
  }

  /**
   * Exécute le cas d’usage :
   * - Récupère les données musicales depuis la stratégie
   * - Enregistre les artistes et musiques via leurs repositories respectifs
   * - Met à jour ou insère les statistiques utilisateur (genre préféré + plateforme)
   *
   * @returns {Promise<Object>} Données sauvegardées : artistes et musiques
   *
   * @example
   * {
   *   savedArtists: [ { _id: "...", artist_name: "...", ... } ],
   *   savedMusics: [ { _id: "...", music_name: "...", ... } ]
   * }
   */
  async execute() {
    const { favoriteGenre, topArtists, topMusics } = await this.strategy.getStats();

    // Upsert des artistes et musiques en base
    const savedArtists = await this.artistRepo.upsertMany(this.userId, topArtists);
    const savedMusics = await this.musicRepo.upsertMany(this.userId, topMusics);

    // Mise à jour des statistiques globales
    await this.userRepo.updateOrCreate(this.userId, {
      favorite_genre: favoriteGenre,
      music_platform: 'spotify',
      top_listened_artists: savedArtists.map(a => a._id),
      top_listened_musics: savedMusics.map(m => m._id),
    });

    // Publication d’un événement Kafka
    await publishStatUpdated({
      userId: this.userId,
      favorite_genre: favoriteGenre,
      top_artists: savedArtists.map(a => ({
        artist_name: a.artist_name,
        ranking: a.ranking
      })),
      top_musics: savedMusics.map(m => ({
        music_name: m.music_name,
        artist_name: m.artist_name,
        ranking: m.ranking
      }))
    });

    return { savedArtists, savedMusics };
  }
}