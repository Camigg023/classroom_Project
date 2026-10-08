import { Router } from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';

export const createAuthRouter = (authController) => {
  const router = Router();

  router.post('/login', authController.login);
  router.get('/me', authenticate, authController.me);

  return router;
};
