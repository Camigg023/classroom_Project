import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';
import { SOLICITUD_ESTADOS } from '../../../domain/entities/Solicitud.js';

export class CambiarEstadoUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(solicitudId, dto, usuarioAuth) {
    if (![ROLES.AGENTE, ROLES.COORDINADOR].includes(usuarioAuth.rol)) {
      throw new ForbiddenError('Solo los agentes de soporte y coordinadores pueden cambiar el estado de atención');
    }

    if (!dto.estado) {
      throw new ValidationError('El nuevo estado es obligatorio');
    }

    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    if ([SOLICITUD_ESTADOS.CERRADA, SOLICITUD_ESTADOS.REABIERTA].includes(dto.estado)) {
      throw new ForbiddenError('El cierre y la reapertura están reservados exclusivamente para el solicitante propietario');
    }

    if (usuarioAuth.rol === ROLES.AGENTE) {
      if (solicitud.agenteAsignadoId && solicitud.agenteAsignadoId !== usuarioAuth.id) {
        throw new ForbiddenError('Solo el agente asignado a esta solicitud puede cambiar su estado');
      }
    }

    const estadoAnterior = solicitud.estado;

    solicitud.cambiarEstado(dto.estado);

    const updated = await this.solicitudRepository.update(solicitud);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: updated.id,
        accion: 'CAMBIO_ESTADO',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: updated.estado,
        motivo: dto.motivo || null
      })
    );

    return updated;
  }
}
