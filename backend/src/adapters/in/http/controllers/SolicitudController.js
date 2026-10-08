import {
  CreateSolicitudDTO,
  PrioritizeSolicitudDTO,
  AsignarSolicitudDTO,
  AddComentarioDTO,
  CambiarEstadoDTO,
  ReabrirSolicitudDTO
} from '../../../../application/dtos/SolicitudDTOs.js';

export class SolicitudController {
  constructor({
    createSolicitudUseCase,
    getMisSolicitudesUseCase,
    getSolicitudByIdUseCase,
    getSolicitudesForCoordinadorUseCase,
    prioritizeSolicitudUseCase,
    asignarSolicitudUseCase,
    addComentarioUseCase,
    cambiarEstadoUseCase,
    confirmarCierreUseCase,
    reabrirSolicitudUseCase,
    buscarSolicitudesUseCase,
    getIndicadoresAgregadosUseCase,
    exportarReporteCsvUseCase
  }) {
    this.createSolicitudUseCase = createSolicitudUseCase;
    this.getMisSolicitudesUseCase = getMisSolicitudesUseCase;
    this.getSolicitudByIdUseCase = getSolicitudByIdUseCase;
    this.getSolicitudesForCoordinadorUseCase = getSolicitudesForCoordinadorUseCase;
    this.prioritizeSolicitudUseCase = prioritizeSolicitudUseCase;
    this.asignarSolicitudUseCase = asignarSolicitudUseCase;
    this.addComentarioUseCase = addComentarioUseCase;
    this.cambiarEstadoUseCase = cambiarEstadoUseCase;
    this.confirmarCierreUseCase = confirmarCierreUseCase;
    this.reabrirSolicitudUseCase = reabrirSolicitudUseCase;
    this.buscarSolicitudesUseCase = buscarSolicitudesUseCase || getSolicitudesForCoordinadorUseCase;
    this.getIndicadoresAgregadosUseCase = getIndicadoresAgregadosUseCase;
    this.exportarReporteCsvUseCase = exportarReporteCsvUseCase;
  }

  create = async (req, res, next) => {
    try {
      const dto = new CreateSolicitudDTO(req.body);
      const nueva = await this.createSolicitudUseCase.execute(dto, req.user);
      return res.status(201).json(nueva);
    } catch (error) {
      next(error);
    }
  };

  getMisSolicitudes = async (req, res, next) => {
    try {
      const solicitudes = await this.getMisSolicitudesUseCase.execute(req.user);
      return res.status(200).json(solicitudes);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req, res, next) => {
    try {
      const solicitud = await this.getSolicitudByIdUseCase.execute(req.params.id, req.user);
      return res.status(200).json(solicitud);
    } catch (error) {
      next(error);
    }
  };

  getAllCoordinador = async (req, res, next) => {
    try {
      const solicitudes = await this.buscarSolicitudesUseCase.execute(req.query, req.user);
      return res.status(200).json(solicitudes);
    } catch (error) {
      next(error);
    }
  };

  getIndicadores = async (req, res, next) => {
    try {
      const indicadores = await this.getIndicadoresAgregadosUseCase.execute(req.query, req.user);
      return res.status(200).json(indicadores);
    } catch (error) {
      next(error);
    }
  };

  exportarCsv = async (req, res, next) => {
    try {
      const { filename, csvContent } = await this.exportarReporteCsvUseCase.execute(req.query, req.user);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  };

  prioritize = async (req, res, next) => {
    try {
      const dto = new PrioritizeSolicitudDTO(req.body);
      const updated = await this.prioritizeSolicitudUseCase.execute(req.params.id, dto, req.user);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  asignar = async (req, res, next) => {
    try {
      const dto = new AsignarSolicitudDTO(req.body);
      const updated = await this.asignarSolicitudUseCase.execute(req.params.id, dto, req.user);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  addComentario = async (req, res, next) => {
    try {
      const dto = new AddComentarioDTO(req.body);
      const comentario = await this.addComentarioUseCase.execute(req.params.id, dto, req.user);
      return res.status(201).json(comentario);
    } catch (error) {
      next(error);
    }
  };

  cambiarEstado = async (req, res, next) => {
    try {
      const dto = new CambiarEstadoDTO(req.body);
      const updated = await this.cambiarEstadoUseCase.execute(req.params.id, dto, req.user);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  confirmarCierre = async (req, res, next) => {
    try {
      const updated = await this.confirmarCierreUseCase.execute(req.params.id, req.user);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  reabrir = async (req, res, next) => {
    try {
      const dto = new ReabrirSolicitudDTO(req.body);
      const updated = await this.reabrirSolicitudUseCase.execute(req.params.id, dto, req.user);
      return res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };
}
