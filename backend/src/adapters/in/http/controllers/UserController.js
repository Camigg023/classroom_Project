export class UserController {
  constructor({ getAgentesActivosUseCase }) {
    this.getAgentesActivosUseCase = getAgentesActivosUseCase;
  }

  getAgentesActivos = async (req, res, next) => {
    try {
      const agentes = await this.getAgentesActivosUseCase.execute(req.user);
      return res.status(200).json(agentes);
    } catch (error) {
      next(error);
    }
  };
}
