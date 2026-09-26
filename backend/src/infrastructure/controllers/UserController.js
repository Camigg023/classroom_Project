class UserController {
    constructor(registerUser, loginUser) {
        this.registerUser = registerUser;
        this.loginUser = loginUser;
    }

    async register(req, res) {
        try {
            const user = await this.registerUser.execute(req.body);

            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({
                mensaje: error.message
            });
        }
    }

    async login(req, res) {
        try {
            const user = await this.loginUser.execute(req.body);

            res.status(200).json(user);
        } catch (error) {
            res.status(401).json({
                mensaje: error.message
            });
        }
    }
}

module.exports = UserController;