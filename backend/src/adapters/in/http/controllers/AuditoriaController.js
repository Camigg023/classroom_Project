export class AuditoriaController {
  constructor({ getHistorialAuditorUseCase }) {
    this.getHistorialAuditorUseCase = getHistorialAuditorUseCase;
  }

  getHistorial = async (req, res, next) => {
    try {
      const historial = await this.getHistorialAuditorUseCase.execute(req.query, req.user);
      return res.status(200).json(historial);
    } catch (error) {
      next(error);
    }
  };
}
