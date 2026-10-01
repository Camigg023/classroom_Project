import { TokenService } from '../../../../infrastructure/security/tokenService.js';
import { UnauthorizedError } from '../../../../domain/exceptions/DomainError.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token de autenticación no proporcionado'));
  }

  const token = authHeader.split(' ')[1];
  const payload = TokenService.verifyToken(token);

  if (!payload) {
    return next(new UnauthorizedError('Token inválido o expirado'));
  }

  req.user = payload;
  next();
};
