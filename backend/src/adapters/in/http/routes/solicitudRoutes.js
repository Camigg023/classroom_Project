import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRoles } from '../middlewares/roleMiddleware.js';
import { ROLES } from '../../../../domain/entities/User.js';

export const createSolicitudRouter = (solicitudController) => {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/',
    requireRoles(ROLES.SOLICITANTE),
    solicitudController.create
  );

  router.get(
    '/mis-solicitudes',
    requireRoles(ROLES.SOLICITANTE),
    solicitudController.getMisSolicitudes
  );

  router.get(
    '/',
    requireRoles(ROLES.COORDINADOR, ROLES.AUDITOR),
    solicitudController.getAllCoordinador
  );

  router.get(
    '/:id',
    solicitudController.getById
  );

  router.patch(
    '/:id/prioridad',
    requireRoles(ROLES.COORDINADOR),
    solicitudController.prioritize
  );

  router.patch(
    '/:id/asignar',
    requireRoles(ROLES.COORDINADOR),
    solicitudController.asignar
  );

  router.post(
    '/:id/comentarios',
    solicitudController.addComentario
  );

  router.patch(
    '/:id/estado',
    requireRoles(ROLES.AGENTE, ROLES.COORDINADOR),
    solicitudController.cambiarEstado
  );

  router.post(
    '/:id/confirmar-cierre',
    requireRoles(ROLES.SOLICITANTE),
    solicitudController.confirmarCierre
  );

  router.post(
    '/:id/reabrir',
    requireRoles(ROLES.SOLICITANTE),
    solicitudController.reabrir
  );

  return router;
};
