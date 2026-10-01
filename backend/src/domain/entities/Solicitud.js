import { ValidationError } from '../exceptions/DomainError.js';

export const SOLICITUD_ESTADOS = Object.freeze({
  NUEVO: 'Nuevo',
  ASIGNADO: 'Asignado',
  EN_PROCESO: 'En Proceso',
  RESUELTA: 'Resuelta',
  CERRADA: 'Cerrada',
  REABIERTA: 'Reabierta'
});

export const PRIORIDADES = Object.freeze({
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta'
});

export const CATEGORIAS = Object.freeze([
  'Hardware',
  'Software',
  'Redes y Conectividad',
  'Accesos y Cuentas',
  'Sistemas de Bodega y Logística'
]);

export class Solicitud {
  constructor({
    id,
    codigo,
    titulo,
    descripcion,
    categoria,
    estado = SOLICITUD_ESTADOS.NUEVO,
    prioridad = PRIORIDADES.MEDIA,
    justificacionPrioridad = null,
    fechaObjetivo = null,
    propietarioId,
    propietarioNombre,
    agenteAsignadoId = null,
    agenteAsignadoNombre = null,
    createdAt,
    updatedAt
  }) {
    if (!titulo?.trim()) throw new ValidationError('El título es obligatorio');
    if (!descripcion?.trim()) throw new ValidationError('La descripción es obligatoria');
    if (!categoria?.trim()) throw new ValidationError('La categoría es obligatoria');
    if (!propietarioId) throw new ValidationError('El propietario es obligatorio');

    this.id = id;
    this.codigo = codigo;
    this.titulo = titulo.trim();
    this.descripcion = descripcion.trim();
    this.categoria = categoria.trim();
    this.estado = estado;
    this.prioridad = prioridad;
    this.justificacionPrioridad = justificacionPrioridad;
    this.fechaObjetivo = fechaObjetivo ? new Date(fechaObjetivo) : null;
    this.propietarioId = propietarioId;
    this.propietarioNombre = propietarioNombre;
    this.agenteAsignadoId = agenteAsignadoId;
    this.agenteAsignadoNombre = agenteAsignadoNombre;
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  setPrioridad(nuevaPrioridad, justificacion = null, fechaObjetivo = null) {
    if (!Object.values(PRIORIDADES).includes(nuevaPrioridad)) {
      throw new ValidationError(`Prioridad inválida: ${nuevaPrioridad}`);
    }

    if (nuevaPrioridad === PRIORIDADES.ALTA) {
      if (!justificacion?.trim()) {
        throw new ValidationError('La prioridad Alta requiere una justificación obligatoria');
      }
      if (!fechaObjetivo) {
        throw new ValidationError('La prioridad Alta requiere una fecha objetivo de atención');
      }
    }

    this.prioridad = nuevaPrioridad;
    this.justificacionPrioridad = justificacion ? justificacion.trim() : null;
    this.fechaObjetivo = fechaObjetivo ? new Date(fechaObjetivo) : null;
    this.updatedAt = new Date();
  }
}
