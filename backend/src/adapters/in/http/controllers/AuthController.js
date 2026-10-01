import { LoginRequestDTO } from '../../../../application/dtos/AuthDTOs.js';

export class AuthController {
  constructor(loginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  login = async (req, res, next) => {
    try {
      const dto = new LoginRequestDTO(req.body);
      const result = await this.loginUseCase.execute(dto);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  me = async (req, res) => {
    return res.status(200).json({
      user: req.user
    });
  };
}
