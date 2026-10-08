import { ForbiddenError } from '../../../domain/exceptions/DomainError.js';
import { ROLES } from '../../../domain/entities/User.js';

export class GetSolicitudesForCoordinadorUseCase {
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  async execute(params = {}, usuarioAuth) {
    if (![ROLES.COORDINADOR, ROLES.AUDITOR].includes(usuarioAuth.rol)) {
      throw new ForbiddenError('Acceso restringido para coordinadores o auditores');
    }

    const { estado, prioridad, categoria, sortBy = 'createdAt', order = 'desc', busqueda } = params;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (prioridad) filtros.prioridad = prioridad;
    if (categoria) filtros.categoria = categoria;
    if (busqueda) filtros.busqueda = busqueda;

    const sortOrder = order === 'asc' ? 1 : -1;
    const orden = { [sortBy]: sortOrder };

    return this.solicitudRepository.findAll(filtros, orden);
  }
}
