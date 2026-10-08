import { UnauthorizedError } from '../../../domain/exceptions/DomainError.js';
import { PasswordHasher } from '../../../infrastructure/security/passwordHasher.js';
import { TokenService } from '../../../infrastructure/security/tokenService.js';
import { LoginResponseDTO } from '../../dtos/AuthDTOs.js';

export class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    if (!email || !password) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    if (!user.isActivo()) {
      throw new UnauthorizedError('Usuario inactivo en el sistema');
    }

    const isValid = await PasswordHasher.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const token = TokenService.generateToken({
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    });

    return new LoginResponseDTO({ token, user });
  }
}
