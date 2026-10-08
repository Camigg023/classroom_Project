export class NotificacionController {
  constructor({ getNotificacionesUseCase, marcarNotificacionLeidaUseCase }) {
    this.getNotificacionesUseCase = getNotificacionesUseCase;
    this.marcarNotificacionLeidaUseCase = marcarNotificacionLeidaUseCase;
  }

  getMisNotificaciones = async (req, res, next) => {
    try {
      const soloNoLeidas = req.query.noLeidas === 'true';
      const notificaciones = await this.getNotificacionesUseCase.execute(req.user, soloNoLeidas);
      return res.status(200).json(notificaciones);
    } catch (error) {
      next(error);
    }
  };

  marcarLeida = async (req, res, next) => {
    try {
      const notificacion = await this.marcarNotificacionLeidaUseCase.execute(req.params.id, req.user);
      return res.status(200).json(notificacion);
    } catch (error) {
      next(error);
    }
  };
}
