import { ValidationError } from '../exceptions/DomainError.js';

export const SOLICITUD_ESTADOS = Object.freeze({
  NUEVO: 'Nuevo',
  ASIGNADO: 'Asignado',
  EN_PROCESO: 'En Proceso',
  RESUELTA: 'Resuelta',
  CERRADA: 'Cerrada',
  REABIERTA: 'Reabierta'
});

export const TRANSICIONES_PERMITIDAS = Object.freeze({
  [SOLICITUD_ESTADOS.NUEVO]: [SOLICITUD_ESTADOS.ASIGNADO, SOLICITUD_ESTADOS.EN_PROCESO],
  [SOLICITUD_ESTADOS.ASIGNADO]: [SOLICITUD_ESTADOS.EN_PROCESO],
  [SOLICITUD_ESTADOS.EN_PROCESO]: [SOLICITUD_ESTADOS.RESUELTA],
  [SOLICITUD_ESTADOS.RESUELTA]: [SOLICITUD_ESTADOS.CERRADA, SOLICITUD_ESTADOS.REABIERTA],
  [SOLICITUD_ESTADOS.REABIERTA]: [SOLICITUD_ESTADOS.EN_PROCESO, SOLICITUD_ESTADOS.ASIGNADO],
  [SOLICITUD_ESTADOS.CERRADA]: []
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
    asignadoPorId = null,
    asignadoPorNombre = null,
    asignadoAt = null,
    motivoReapertura = null,
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
    this.asignadoPorId = asignadoPorId;
    this.asignadoPorNombre = asignadoPorNombre;
    this.asignadoAt = asignadoAt ? new Date(asignadoAt) : null;
    this.motivoReapertura = motivoReapertura;
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

  asignarAgente(agente, coordinador) {
    if (!agente?.id || !agente?.nombre) {
      throw new ValidationError('Datos de agente inválidos para asignación');
    }
    this.agenteAsignadoId = agente.id;
    this.agenteAsignadoNombre = agente.nombre;
    this.asignadoPorId = coordinador.id;
    this.asignadoPorNombre = coordinador.nombre;
    this.asignadoAt = new Date();

    if (this.estado === SOLICITUD_ESTADOS.NUEVO) {
      this.estado = SOLICITUD_ESTADOS.ASIGNADO;
    }
    this.updatedAt = new Date();
  }

  validarTransicionEstado(nuevoEstado) {
    if (!Object.values(SOLICITUD_ESTADOS).includes(nuevoEstado)) {
      throw new ValidationError(`Estado destino inválido: ${nuevoEstado}`);
    }

    const permitidos = TRANSICIONES_PERMITIDAS[this.estado] || [];
    if (!permitidos.includes(nuevoEstado)) {
      throw new ValidationError(`Transición de estado no permitida: de "${this.estado}" a "${nuevoEstado}"`);
    }
  }

  cambiarEstado(nuevoEstado) {
    this.validarTransicionEstado(nuevoEstado);
    this.estado = nuevoEstado;
    this.updatedAt = new Date();
  }

  confirmarCierre() {
    if (this.estado !== SOLICITUD_ESTADOS.RESUELTA) {
      throw new ValidationError('Solo es posible confirmar y cerrar solicitudes en estado Resuelta');
    }
    this.estado = SOLICITUD_ESTADOS.CERRADA;
    this.updatedAt = new Date();
  }

  reabrir(motivo) {
    if (this.estado !== SOLICITUD_ESTADOS.RESUELTA) {
      throw new ValidationError('Solo es posible reabrir solicitudes en estado Resuelta');
    }
    if (!motivo?.trim()) {
      throw new ValidationError('El motivo de reapertura es obligatorio');
    }
    this.estado = SOLICITUD_ESTADOS.REABIERTA;
    this.motivoReapertura = motivo.trim();
    this.updatedAt = new Date();
  }
}
