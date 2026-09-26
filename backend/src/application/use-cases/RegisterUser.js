const bcrypt = require("bcryptjs");

class RegisterUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ nombre, correo, password, rol }) {

    const existingUser = await this.userRepository.findByEmail(correo);

    if (existingUser) {
        throw new Error("El correo ya está registrado");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
        nombre,
        correo,
        password: passwordHash,
        rol
    };

    return await this.userRepository.create(user);
    }
}

module.exports = RegisterUser;