import { Router } from 'express';
import { songsController } from '../controllers/songsController.js';

export const songsRouter = Router();

songsRouter.get('/', songsController.list);
songsRouter.get('/search', songsController.search);
