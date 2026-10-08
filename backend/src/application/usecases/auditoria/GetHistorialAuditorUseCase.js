import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class GetHistorialAuditorUseCase {
  constructor(auditRepository) {
    this.auditRepository = auditRepository;
  }

  async execute(queryParams = {}, usuarioAuth) {
    if (!usuarioAuth || usuarioAuth.rol !== ROLES.AUDITOR) {
      throw new ForbiddenError('Acceso restringido: únicamente el rol Auditor puede consultar el historial');
    }

    const filtros = {};
    if (queryParams.solicitudId) filtros.solicitudId = queryParams.solicitudId;
    if (queryParams.accion) filtros.accion = queryParams.accion;
    if (queryParams.actorRol) filtros.actorRol = queryParams.actorRol;
    if (queryParams.campo) filtros.campo = queryParams.campo;
    if (queryParams.fechaDesde) filtros.fechaDesde = queryParams.fechaDesde;
    if (queryParams.fechaHasta) filtros.fechaHasta = queryParams.fechaHasta;

    return this.auditRepository.findAllAuditor(filtros);
  }
}
