import { db } from './connection.js';

const createPlayersTable = `
  CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY,
    display_name VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
`;

const createSongsTable = `
  CREATE TABLE IF NOT EXISTS songs (
    id UUID PRIMARY KEY,
    youtube_id VARCHAR(20) NOT NULL,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    theme VARCHAR(50) NOT NULL
  );
`;

const createIndexes = `
  CREATE INDEX IF NOT EXISTS idx_songs_theme ON songs(theme);
  CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
  CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
`;

async function migrate() {
  console.log('Running migrations...');
  
  try {
    await db.query(createPlayersTable);
    console.log('✓ Created players table');
    
    await db.query(createSongsTable);
    console.log('✓ Created songs table');
    
    await db.query(createIndexes);
    console.log('✓ Created indexes');
    
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.pool.end();
  }
}

migrate();
