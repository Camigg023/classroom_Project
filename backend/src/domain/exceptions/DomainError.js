export class DomainError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

export class ValidationError extends DomainError {
  constructor(message) {
    super(message, 400);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Credenciales inválidas') {
    super(message, 401);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Acceso no autorizado para este rol') {
    super(message, 403);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}
