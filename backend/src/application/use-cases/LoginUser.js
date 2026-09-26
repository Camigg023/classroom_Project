const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class LoginUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ correo, password }) {

        const user = await this.userRepository.findByEmail(correo);

        if (!user) {
            throw new Error("Correo o contraseña incorrectos");
        }

        const passwordValid = await bcrypt.compare(password, user.password);

        if (!passwordValid) {
            throw new Error("Correo o contraseña incorrectos");
        }

        const token = jwt.sign(
            {
                id: user._id,
                rol: user.rol
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return {
            id: user._id,
            nombre: user.nombre,
            correo: user.correo,
            rol: user.rol,
            token
        };
    }
}

module.exports = LoginUser;