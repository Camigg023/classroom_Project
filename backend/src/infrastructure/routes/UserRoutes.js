const express = require("express");

const UserRepository = require("../repositories/UserRepository");
const RegisterUser = require("../../application/use-cases/RegisterUser");
const LoginUser = require("../../application/use-cases/LoginUser");
const UserController = require("../controllers/UserController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Creamos las dependencias
const userRepository = new UserRepository();

const registerUser = new RegisterUser(userRepository);
const loginUser = new LoginUser(userRepository);

const userController = new UserController(registerUser, loginUser);

router.post("/register", (req, res) => {
    userController.register(req, res);
});

router.post("/login", (req, res) => {
    userController.login(req, res);
});

router.get("/perfil", authMiddleware, (req, res) => {
    res.json({
        mensaje: "Acceso autorizado",
        usuario: req.user
    });
});

module.exports = router;