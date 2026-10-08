import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

export const createNotificacionRouter = (notificacionController) => {
  const router = Router();

  router.use(authenticate);

  router.get('/', notificacionController.getMisNotificaciones);
  router.patch('/:id/leida', notificacionController.marcarLeida);

  return router;
};
