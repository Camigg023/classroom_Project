import { DomainError } from '../../../../domain/exceptions/DomainError.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({
      error: err.name,
      message: err.message
    });
  }

  // Handle Mongoose cast errors or validation errors
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'BadRequest',
      message: 'Identificador de recurso inválido'
    });
  }

  console.error('[Unhandled Server Error]', err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Ha ocurrido un error interno en el servidor'
  });
};
