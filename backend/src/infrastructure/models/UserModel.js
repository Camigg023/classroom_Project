const mongoose = require ("mongoose");

const userSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true
    },

    correo: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    rol: {
        type: String,
        required: true,
        enum: ["solicitante", "agente", "consultor", "auditor"]
    }
});

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;