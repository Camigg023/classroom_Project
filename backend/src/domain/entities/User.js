class User {
    constructor({id, nombre, correo, password, rol}){
        this.id = id;
        this.nombre = nombre;
        this.correo = correo;
        this.password = password;
        this.rol = rol;
    }
}

module.exports = User;