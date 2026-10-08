import { ROLES } from '../../../domain/entities/User.js';

export class BuscarSolicitudesUseCase {
  constructor(solicitudRepository) {
    this.solicitudRepository = solicitudRepository;
  }

  async execute(queryParams = {}, usuarioAuth) {
    const filtros = {};

    if (queryParams.estado) filtros.estado = queryParams.estado;
    if (queryParams.prioridad) filtros.prioridad = queryParams.prioridad;
    if (queryParams.categoria) filtros.categoria = queryParams.categoria;
    if (queryParams.busqueda) filtros.busqueda = queryParams.busqueda;

    // Validación estricta de alcance en el servidor según rol
    if (usuarioAuth.rol === ROLES.SOLICITANTE) {
      filtros.propietarioId = usuarioAuth.id;
    } else if (usuarioAuth.rol === ROLES.AGENTE) {
      if (queryParams.misAsignados === 'true') {
        filtros.agenteAsignadoId = usuarioAuth.id;
      }
    }

    const sortField = queryParams.sortBy || 'createdAt';
    const sortOrder = queryParams.order === 'asc' ? 1 : -1;
    const orden = { [sortField]: sortOrder };

    return this.solicitudRepository.findAll(filtros, orden);
  }
}
