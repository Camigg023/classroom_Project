import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class GetMisSolicitudesUseCase {
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  async execute(usuarioAuth) {
    if (usuarioAuth.rol !== ROLES.SOLICITANTE) {
      throw new ForbiddenError('Solo los solicitantes pueden consultar sus solicitudes directas');
    }

    return this.solicitudRepository.findByPropietario(usuarioAuth.id);
  }
}
