import { getUserStats as getSpotifyStats, getAccessTokenFromCode } from '../../services/spotify';
import { getUserStats as getAppleMusicStats } from '../../services/appleMusic';
import UserStats from '../../models/UserStats';
import TopListenedMusic from '../../models/TopListenedMusic';
import TopListenedArtist from '../../models/TopListenedArtist';
import connectToDatabase from '../../services/database';

export default async function handler(req, res) {
  const { method } = req;
  const { userId, platform, code } = req.query;

  console.log('Received request:', { userId, platform, code });

  // Connexion à la base de données
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Failed to connect to the database', error });
  }

  if (method === 'GET') {
    try {
      let stats;

      if (platform === 'spotify') {
        // Si un code d'autorisation est présent, obtenir le jeton d'accès
        if (code) {
          console.log('Code received:', code);
          await getAccessTokenFromCode(code); // Utilisez le code pour obtenir le jeton
        }

        stats = await getSpotifyStats(userId); // Obtenez les données de l'utilisateur
      } else if (platform === 'appleMusic') {
        stats = await getAppleMusicStats(userId);
      } else {
        console.error('Invalid platform:', platform);
        return res.status(400).json({ message: 'Invalid platform' });
      }

      // Insérer les artistes et morceaux dans les collections respectives
      const topArtists = await Promise.all(
        stats.topArtists.map(async (artist, index) => {
          console.log('Artist from Spotify:', artist);  // Log pour vérifier les données

          if (!artist.top_listened_artist || !artist.top_ranking) {
            console.error('Invalid artist data:', artist);
            throw new Error('Invalid artist data');
          }

          const existingArtist = await TopListenedArtist.findOne({ top_listened_artist: artist.top_listened_artist });

          if (!existingArtist) {
            const newArtist = new TopListenedArtist({
              top_listened_artist: artist.top_listened_artist,
              top_ranking: artist.top_ranking,
            });
            return await newArtist.save();
          }

          return existingArtist;
        })
      );

      const topTracks = await Promise.all(
        stats.topTracks.map(async (track) => {
          // Log des données du track pour vérifier sa structure
          console.log('Track from Spotify:', track);
      
          // Vérification des données de la musique
          if (!track.top_listened_music || !track.artist_name || typeof track.top_ranking !== 'number') {
            console.error('Invalid track data:', track);
            throw new Error('Invalid track data');
          }
      
          // Recherche de la musique dans la base de données
          const existingTrack = await TopListenedMusic.findOne({ top_listened_music: track.trackName });
      
          if (!existingTrack) {
            // Si la musique n'existe pas, on la crée
            const newTrack = new TopListenedMusic({
              top_listened_music: track.top_listened_music,
              artist_name: track.artist_name,
              top_ranking: track.top_ranking,
            });
      
            // Enregistrement dans la base de données
            return await newTrack.save();
          }
      
          // Retourner la musique existante si elle est déjà présente
          return existingTrack;
        })
      );
      

      // Sauvegarder les statistiques dans la collection UserStats
      const userStats = new UserStats({
        userId,
        platform,
        topTracks: topTracks.map((track) => ({
          trackName: track.top_listened_music, // Nom de la musique
          artist: track.artist_name, // Nom de l'artiste
          ranking: track.top_ranking, // Classement de la musique
        })),
        topArtists: topArtists.map((artist) => ({
          artistName: artist.top_listened_artist, // Nom de l'artiste
          ranking: artist.top_ranking, // Classement de l'artiste
        }))
      });

      await userStats.save();

      // Répondre avec les statistiques
      res.status(200).json(userStats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: 'Error fetching user stats', error });
    }
  } else {
    console.error('Method Not Allowed:', method);
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}