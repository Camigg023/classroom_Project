import { NotFoundError, ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class GetSolicitudByIdUseCase {
  constructor(solicitudRepository, auditRepository) {
    this.solicitudRepository = solicitudRepository;
    this.auditRepository = auditRepository;
  }

  async execute(solicitudId, usuarioAuth) {
    const rawDoc = await this.solicitudRepository.findRawById(solicitudId);
    if (!rawDoc) {
      throw new NotFoundError('Solicitud no encontrada');
    }

    if (usuarioAuth.rol === ROLES.SOLICITANTE && rawDoc.propietarioId.toString() !== usuarioAuth.id) {
      throw new ForbiddenError('No tienes autorización para acceder a esta solicitud');
    }

    const solicitud = this.solicitudRepository.toDomain(rawDoc);
    const comentarios = rawDoc.comentarios || [];

    let auditoria = [];
    if ([ROLES.COORDINADOR, ROLES.AUDITOR].includes(usuarioAuth.rol)) {
      auditoria = await this.auditRepository.findBySolicitudId(solicitudId);
    }

    return {
      ...solicitud,
      comentarios,
      auditoria
    };
  }
}
