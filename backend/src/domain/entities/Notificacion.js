import { ValidationError } from '../exceptions/DomainError.js';

export const NOTIFICACION_TIPOS = Object.freeze({
  ASIGNACION_SOLICITUD: 'ASIGNACION_SOLICITUD',
  CAMBIO_ESTADO: 'CAMBIO_ESTADO',
  NUEVO_COMENTARIO: 'NUEVO_COMENTARIO'
});

export class Notificacion {
  constructor({
    id,
    destinatarioId,
    tipo = NOTIFICACION_TIPOS.ASIGNACION_SOLICITUD,
    titulo,
    mensaje,
    solicitudId,
    codigoSolicitud,
    leida = false,
    createdAt
  }) {
    if (!destinatarioId) throw new ValidationError('El destinatario de la notificación es obligatorio');
    if (!titulo?.trim()) throw new ValidationError('El título de la notificación es obligatorio');
    if (!mensaje?.trim()) throw new ValidationError('El mensaje de la notificación es obligatorio');

    this.id = id;
    this.destinatarioId = destinatarioId;
    this.tipo = tipo;
    this.titulo = titulo.trim();
    this.mensaje = mensaje.trim();
    this.solicitudId = solicitudId;
    this.codigoSolicitud = codigoSolicitud;
    this.leida = Boolean(leida);
    this.createdAt = createdAt || new Date();
  }

  marcarComoLeida() {
    this.leida = true;
  }
}
