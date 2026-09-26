const UserModel = require("../models/UserModel");

class UserRepository {

    async create(user) {
        const newUser = await UserModel.create({
            nombre: user.nombre,
            correo: user.correo,
            password: user.password,
            rol: user.rol
        });

        return newUser;
    }

    async findByEmail(correo) {
        return await UserModel.findOne({ correo });
    }
}

module.exports = UserRepository;