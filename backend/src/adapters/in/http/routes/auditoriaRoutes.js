import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../../../../domain/entities/User.js';

export const createAuditoriaRouter = (auditoriaController) => {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/',
    requireRoles(ROLES.AUDITOR),
    auditoriaController.getHistorial
  );

  return router;
};
