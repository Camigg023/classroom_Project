import { ValidationError } from '../exceptions/DomainError.js';

export const ROLES = Object.freeze({
  SOLICITANTE: 'Solicitante',
  AGENTE: 'Agente',
  COORDINADOR: 'Coordinador',
  AUDITOR: 'Auditor'
});

export const USER_STATUS = Object.freeze({
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo'
});

export class User {
  constructor({ id, nombre, email, passwordHash, rol, estado = USER_STATUS.ACTIVO, createdAt, updatedAt }) {
    if (!nombre?.trim()) throw new ValidationError('El nombre es obligatorio');
    if (!email?.trim()) throw new ValidationError('El email es obligatorio');
    if (!Object.values(ROLES).includes(rol)) throw new ValidationError(`Rol inválido: ${rol}`);

    this.id = id;
    this.nombre = nombre.trim();
    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.rol = rol;
    this.estado = estado;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  isActivo() {
    return this.estado === USER_STATUS.ACTIVO;
  }
}
