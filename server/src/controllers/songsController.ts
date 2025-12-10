import { Request, Response } from 'express';
import { db } from '../db/connection.js';

export const songsController = {
  async list(req: Request, res: Response) {
    try {
      const { theme } = req.query;
      
      let query = 'SELECT id, youtube_id, title, artist, theme FROM songs';
      const params: string[] = [];
      
      if (theme && typeof theme === 'string') {
        query += ' WHERE theme = $1';
        params.push(theme);
      }
      
      query += ' ORDER BY title ASC';
      
      const result = await db.query(query, params);
      
      res.json({
        songs: result.rows.map((row: { id: string; youtube_id: string; title: string; artist: string; theme: string }) => ({
          id: row.id,
          youtubeId: row.youtube_id,
          title: row.title,
          artist: row.artist,
          theme: row.theme
        })),
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error listing songs:', error);
      res.status(500).json({ error: 'Failed to list songs' });
    }
  },

  async search(req: Request, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }
      
      const searchTerm = `%${q}%`;
      
      const result = await db.query(
        `SELECT id, youtube_id, title, artist, theme 
         FROM songs 
         WHERE title ILIKE $1 OR artist ILIKE $1
         ORDER BY title ASC`,
        [searchTerm]
      );
      
      res.json({
        songs: result.rows.map((row: { id: string; youtube_id: string; title: string; artist: string; theme: string }) => ({
          id: row.id,
          youtubeId: row.youtube_id,
          title: row.title,
          artist: row.artist,
          theme: row.theme
        })),
        total: result.rows.length
      });
    } catch (error) {
      console.error('Error searching songs:', error);
      res.status(500).json({ error: 'Failed to search songs' });
    }
  }
};
