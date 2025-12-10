import { Router } from 'express';
import { profileController } from '../controllers/profileController.js';

export const profileRouter = Router();

profileRouter.post('/', profileController.create);
profileRouter.get('/:id', profileController.getById);
profileRouter.put('/:id', profileController.update);
