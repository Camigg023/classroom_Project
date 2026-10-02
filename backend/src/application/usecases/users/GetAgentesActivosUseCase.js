import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class GetAgentesActivosUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(usuarioAuth) {
    if (![ROLES.COORDINADOR, ROLES.AUDITOR].includes(usuarioAuth.rol)) {
      throw new ForbiddenError('Solo el Coordinador o Auditor pueden consultar la lista de agentes');
    }

    const agentes = await this.userRepository.findAgentesActivos();
    return agentes.map(a => ({
      id: a.id,
      nombre: a.nombre,
      email: a.email,
      rol: a.rol,
      estado: a.estado
    }));
  }
}
