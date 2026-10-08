import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';
import { AuditLog } from '../../../domain/entities/AuditLog.js';

export class ConfirmarCierreUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(solicitudId, usuarioAuth) {
    const solicitud = await this.solicitudRepository.findById(solicitudId);
    if (!solicitud) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    if (usuarioAuth.rol !== ROLES.SOLICITANTE || solicitud.propietarioId !== usuarioAuth.id) {
      throw new ForbiddenError('Solo el solicitante propietario puede confirmar y cerrar la solución');
    }

    const estadoAnterior = solicitud.estado;
    solicitud.confirmarCierre();

    const updated = await this.solicitudRepository.update(solicitud);

    await this.auditRepository.record(
      new AuditLog({
        solicitudId: updated.id,
        accion: 'CIERRE_SOLICITUD',
        actorId: usuarioAuth.id,
        actorRol: usuarioAuth.rol,
        campo: 'estado',
        valorAnterior: estadoAnterior,
        valorNuevo: updated.estado,
        motivo: 'Solución aceptada y confirmada por el usuario solicitante'
      })
    );

    return updated;
  }
}
