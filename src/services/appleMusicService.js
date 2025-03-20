import axios from 'axios';
import 'dotenv/config';

// Récupérer le Top 3 des morceaux
async function getTopTracks() {
  try {
    const response = await axios.get('https://api.music.apple.com/v1/me/library/songs', {
      headers: {
        Authorization: `Bearer ${process.env.APPLE_MUSIC_API_KEY}`,
      },
    });

    return response.data.data.slice(0, 3).map((song, index) => ({
      top_listened_music: song.attributes.name,
      artist_name: song.attributes.artistName,
      top_ranking: index + 1,
    }));
  } catch (error) {
    console.error('Error fetching top tracks from Apple Music', error);
    throw error;
  }
}

// Récupérer les Top 3 artistes
async function getTopArtists() {
  try {
    const topTracks = await getTopTracks();

    return topTracks.map((track, index) => ({
      top_listened_artist: track.artist_name,
      top_ranking: index + 1,
    }));
  } catch (error) {
    console.error('Error fetching top artists from Apple Music', error);
    throw error;
  }
}

// Récupérer les statistiques de l'utilisateur (artistes et morceaux)
export async function getUserStats() {
  try {
    const topArtists = await getTopArtists();
    const topTracks = await getTopTracks();
    return { topArtists, topTracks };
  } catch (error) {
    console.error('Error fetching user stats from Apple Music', error);
    throw error;
  }
}

export { getTopArtists, getTopTracks, getUserStats };