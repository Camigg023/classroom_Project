export class LoginRequestDTO {
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}

export class LoginResponseDTO {
  constructor({ token, user }) {
    this.token = token;
    this.user = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    };
  }
}
