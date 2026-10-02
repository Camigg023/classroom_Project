import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../../../../domain/entities/User.js';

export const createUserRouter = (userController) => {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/agentes',
    requireRoles(ROLES.COORDINADOR, ROLES.AUDITOR),
    userController.getAgentesActivos
  );

  return router;
};
