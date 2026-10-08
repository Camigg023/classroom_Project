import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class GetIndicadoresAgregadosUseCase {
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  async execute(queryParams = {}, usuarioAuth) {
    if (usuarioAuth.rol !== ROLES.COORDINADOR) {
      throw new ForbiddenError('Acceso restringido: Solo el Coordinador puede consultar los indicadores agregados');
    }

    const filtros = {};
    if (queryParams.categoria) filtros.categoria = queryParams.categoria;
    if (queryParams.prioridad) filtros.prioridad = queryParams.prioridad;

    return this.solicitudRepository.getIndicadoresAgregados(filtros);
  }
}
