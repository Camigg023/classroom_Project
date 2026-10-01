import { ForbiddenError, NotFoundError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';

export class PrioritizeSolicitudUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(solicitudId, dto, usuarioAuth) {
    if (usuarioAuth.rol !== ROLES.COORDINADOR) {
      throw new ForbiddenError('Solo el Coordinador tiene autorización para priorizar solicitudes');
    }

    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    const prioridadAnterior = solicitud.prioridad;

    solicitud.setPrioridad(dto.prioridad, dto.justificacion, dto.fechaObjetivo);

    const updated = await this.solicitudRepository.update(solicitud);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: updated.id,
        accion: 'CAMBIO_PRIORIDAD',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'prioridad',
        valorAnterior: prioridadAnterior,
        valorNuevo: updated.prioridad,
        motivo: dto.justificacion || null
      })
    );

    return updated;
  }
}
