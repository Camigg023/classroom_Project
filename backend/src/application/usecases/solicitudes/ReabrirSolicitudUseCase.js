import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';

export class ReabrirSolicitudUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(solicitudId, dto, usuarioAuth) {
    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    if (usuarioAuth.rol !== ROLES.SOLICITANTE || solicitud.propietarioId !== usuarioAuth.id) {
      throw new ForbiddenError('Solo el solicitante propietario puede reabrir la solicitud');
    }

    if (!dto.motivo || !dto.motivo.trim()) {
      throw new ValidationError('El motivo de reapertura es obligatorio');
    }

    const estadoAnterior = solicitud.estado;
    solicitud.reabrir(dto.motivo);

    const updated = await this.solicitudRepository.update(solicitud);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: updated.id,
        accion: 'REAPERTURA_SOLICITUD',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: updated.estado,
        motivo: dto.motivo.trim()
      })
    );

    return updated;
  }
}
