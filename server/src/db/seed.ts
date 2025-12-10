import { v4 as uuidv4 } from 'uuid';
import { db } from './connection.js';

interface SeedSong {
  youtubeId: string;
  title: string;
  artist: string;
  theme: string;
}

const seedSongs: SeedSong[] = [
  // Anime Tokyo Lounge
  { youtubeId: 'FvO1qlBbqLU', title: 'Cruel Angel\'s Thesis', artist: 'Yoko Takahashi', theme: 'anime' },
  { youtubeId: '4xwXpj5Xzjk', title: 'Unravel', artist: 'TK from Ling Tosite Sigure', theme: 'anime' },
  { youtubeId: 'iOsN2FP3-l4', title: 'Gurenge', artist: 'LiSA', theme: 'anime' },
  { youtubeId: 'CjUvNrLqT4c', title: 'Blue Bird', artist: 'Ikimono Gakari', theme: 'anime' },
  { youtubeId: 'pdAoYar8Y0c', title: 'Again', artist: 'YUI', theme: 'anime' },
  
  // K-pop Seoul Studio
  { youtubeId: '9bZkp7q19f0', title: 'Gangnam Style', artist: 'PSY', theme: 'kpop' },
  { youtubeId: 'gdZLi9oWNZg', title: 'Dynamite', artist: 'BTS', theme: 'kpop' },
  { youtubeId: 'IHNzOHi8sJs', title: 'Kill This Love', artist: 'BLACKPINK', theme: 'kpop' },
  { youtubeId: 'WPdWvnAAurg', title: 'Cheer Up', artist: 'TWICE', theme: 'kpop' },
  { youtubeId: 'pBuZEGYXA6E', title: 'Love Shot', artist: 'EXO', theme: 'kpop' },
  
  // Bollywood Mumbai Rooftop
  { youtubeId: 'l_MyUGq7pgs', title: 'Kal Ho Naa Ho', artist: 'Sonu Nigam', theme: 'bollywood' },
  { youtubeId: 'DJztXj2GPfk', title: 'Chaiyya Chaiyya', artist: 'Sukhwinder Singh', theme: 'bollywood' },
  { youtubeId: 'gUyM3xkb3aI', title: 'Tum Hi Ho', artist: 'Arijit Singh', theme: 'bollywood' },
  { youtubeId: 'Jv4Lfhg3Lfw', title: 'Kajra Re', artist: 'Alisha Chinai', theme: 'bollywood' },
  { youtubeId: 'cNJ2Y_bVnSk', title: 'Bole Chudiyan', artist: 'Udit Narayan', theme: 'bollywood' },
  
  // Hollywood LA Concert Hall
  { youtubeId: 'fJ9rUzIMcZQ', title: 'Bohemian Rhapsody', artist: 'Queen', theme: 'hollywood' },
  { youtubeId: 'hTWKbfoikeg', title: 'Smells Like Teen Spirit', artist: 'Nirvana', theme: 'hollywood' },
  { youtubeId: 'btPJPFnesV4', title: 'Eye of the Tiger', artist: 'Survivor', theme: 'hollywood' },
  { youtubeId: 'ZbZSe6N_BXs', title: 'Happy', artist: 'Pharrell Williams', theme: 'hollywood' },
  { youtubeId: 'CevxZvSJLk8', title: 'Roar', artist: 'Katy Perry', theme: 'hollywood' },
  
  // Taylor Swift Broadway Stage
  { youtubeId: 'WA4iX5D9Z64', title: 'Shake It Off', artist: 'Taylor Swift', theme: 'taylor-swift' },
  { youtubeId: 'e-ORhEE9VVg', title: 'Blank Space', artist: 'Taylor Swift', theme: 'taylor-swift' },
  { youtubeId: 'QcIy9NiNbmo', title: 'Anti-Hero', artist: 'Taylor Swift', theme: 'taylor-swift' },
  { youtubeId: 'nfWlot6h_JM', title: 'Shake It Off (Karaoke)', artist: 'Taylor Swift', theme: 'taylor-swift' },
  { youtubeId: 'VuNIsY6JdUw', title: 'You Belong With Me', artist: 'Taylor Swift', theme: 'taylor-swift' },
];

async function seed() {
  console.log('Seeding database...');
  
  try {
    // Clear existing songs
    await db.query('DELETE FROM songs');
    console.log('✓ Cleared existing songs');
    
    // Insert seed songs
    for (const song of seedSongs) {
      await db.query(
        `INSERT INTO songs (id, youtube_id, title, artist, theme)
         VALUES ($1, $2, $3, $4, $5)`,
        [uuidv4(), song.youtubeId, song.title, song.artist, song.theme]
      );
    }
    
    console.log(`✓ Inserted ${seedSongs.length} songs`);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

seed();
