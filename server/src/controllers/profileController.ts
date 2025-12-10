import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/connection.js';

function validateDisplayName(name: unknown): { valid: boolean; error?: string } {
  if (typeof name !== 'string') {
    return { valid: false, error: 'Display name must be a string' };
  }
  if (name.length < 3 || name.length > 20) {
    return { valid: false, error: 'Display name must be 3-20 characters' };
  }
  return { valid: true };
}

export const profileController = {
  async create(req: Request, res: Response) {
    try {
      const { displayName } = req.body;
      
      const validation = validateDisplayName(displayName);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const id = uuidv4();
      const now = new Date();
      
      const result = await db.query(
        `INSERT INTO players (id, display_name, created_at, last_active)
         VALUES ($1, $2, $3, $4)
         RETURNING id, display_name, created_at, last_active`,
        [id, displayName, now, now]
      );

      const player = result.rows[0];
      res.status(201).json({
        id: player.id,
        displayName: player.display_name,
        createdAt: player.created_at,
        lastActive: player.last_active
      });
    } catch (error) {
      console.error('Error creating profile:', error);
      res.status(500).json({ error: 'Failed to create profile' });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const result = await db.query(
        'SELECT id, display_name, created_at, last_active FROM players WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const player = result.rows[0];
      res.json({
        id: player.id,
        displayName: player.display_name,
        createdAt: player.created_at,
        lastActive: player.last_active
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { displayName } = req.body;
      
      const validation = validateDisplayName(displayName);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const result = await db.query(
        `UPDATE players 
         SET display_name = $1, last_active = $2
         WHERE id = $3
         RETURNING id, display_name, created_at, last_active`,
        [displayName, new Date(), id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      const player = result.rows[0];
      res.json({
        id: player.id,
        displayName: player.display_name,
        createdAt: player.created_at,
        lastActive: player.last_active
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
};
