import { ForbiddenError } from '../../../../domain/exceptions/DomainError.js';

export const requireRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
      return next(new ForbiddenError('No tienes permisos suficientes para realizar esta acción'));
    }
    next();
  };
};
