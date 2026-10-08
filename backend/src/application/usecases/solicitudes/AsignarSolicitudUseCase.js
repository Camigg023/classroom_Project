import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';
import { Notificacion, NOTIFICACION_TIPOS } from '../../../domain/entities/Notificacion.js';

export class AsignarSolicitudUseCase {
  constructor(solicitudRepository, userRepository, auditRepository, notificacionRepository) {
    this.solicitudRepository = solicitudRepository;
    this.userRepository = userRepository;
    this.auditRepository = auditRepository;
    this.notificacionRepository = notificacionRepository;
  }

  async execute(solicitudId, dto, usuarioAuth) {
    if (usuarioAuth.rol !== ROLES.COORDINADOR) {
      throw new ForbiddenError('Solo el Coordinador puede asignar solicitudes');
    }

    if (!dto.agenteId) {
      throw new ValidationError('El ID del agente a asignar es obligatorio');
    }

    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    const agente = await this.userRepository.findById(dto.agenteId);
    if (!agente) {
      throw new ValidationError('El agente especificado no existe');
    }

    if (agente.rol !== ROLES.AGENTE) {
      throw new ValidationError('El usuario seleccionado no tiene rol de Agente');
    }

    if (!agente.isActivo()) {
      throw new ValidationError('El agente seleccionado no se encuentra activo en el sistema');
    }

    const agentePrevioNombre = solicitud.agenteAsignadoNombre;
    const estadoPrevio = solicitud.estado;

    solicitud.asignarAgente(
      { id: agente.id, nombre: agente.nombre },
      { id: usuarioAuth.id, nombre: usuarioAuth.nombre }
    );

    const updated = await this.solicitudRepository.update(solicitud);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: updated.id,
        accion: 'ASIGNACION_AGENTE',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'agenteAsignado',
        valorAnterior: agentePrevioNombre || 'Sin asignar',
        valorNuevo: `${agente.nombre} (${agente.id})`
      })
    );

    if (estadoPrevio !== updated.estado) {
      await this.auditRepository.record(
        new AuditLog({
          solicitudId: updated.id,
          accion: 'CAMBIO_ESTADO',
          actorId: usuarioAuth.id,
          actorRol: usuarioAuth.rol,
          campo: 'estado',
          valorAnterior: estadoPrevio,
          valorNuevo: updated.estado,
          motivo: 'Asignación de responsable'
        })
      );
    }

    if (this.notificacionRepository) {
      await this.notificacionRepository.save(
        new Notificacion({
          destinatarioId: agente.id,
          tipo: NOTIFICACION_TIPOS.ASIGNACION_SOLICITUD,
          titulo: `Nueva solicitud asignada: ${updated.codigo}`,
          mensaje: `El coordinador ${usuarioAuth.nombre} te ha asignado la solicitud: "${updated.titulo}"`,
          solicitudId: updated.id,
          codigoSolicitud: updated.codigo
        })
      );
    }

    return updated;
  }
}
