const { abrirConexion, ErrorDBA } = require("../database.js")
const encriptar = require("bcryptjs")
const JWT = require("jsonwebtoken")
const Especialidad = require("../models/Especialidad.js")
const Usuario = require("../models/Usuario.js")
const User = require("../models/Usuario.js")

//hola aldo

class ErrorLogin extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorLogin";
    }
}

class ErrorRegistro extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorRegistro";
    }
}

User.login = async (request, response) => {
    console.log("pase por aqui")
    const { correo, contrasenia } = request.body
    console.log(correo, contrasenia)
    var connection = null
    try {
        connection = await abrirConexion()
        console.log("conexion abierta")
        var Query = `SELECT correo, contrasenia, es_empleado
                    FROM USUARIO
                    WHERE correo = ?`
        const values = [correo]
        const [filas, otro] = await connection.query(Query, values)
        console.log("pase el query", filas)
        if (filas.length === 0) {
            console.log("pase por aqui")

            throw new ErrorLogin("Usuario y/o contraseña invalida")
        }
        const usuario = filas[0]
        const validarContrasenia = await encriptar.compare(contrasenia, usuario.contrasenia)
        console.log("pase el validar contraseña")
        if (!validarContrasenia)
            throw new ErrorLogin("Usuario y/o contraseña invalida")

        const tokenPayLoad = {
            usuario: { nombre: usuario.correo },
            rol: usuario.es_empleado ? "empleado" : "cliente",
            exp: Math.floor(Date.now() / 1000) + Number(process.env.JWT_EXPIRACION)
        }
        console.log(tokenPayLoad)
        const token = JWT.sign(tokenPayLoad, process.env.SECRET_KEY, { algorithm: "HS256" })
        console.log(token)
        return response.status(202).json(token)
    }
    catch (error) {
        console.log(error)
        if (error instanceof ErrorDBA) {
            return response.status(500).json(error)
        }
        else if (error instanceof ErrorLogin) {
            return response.status(401).json(error.message)
        }
        else {
            return response.status(500).json(error)
        }
    }
    finally {
        if (connection)
            connection.release()
    }
};


//----------------------------------------------------------------------------------------------------


User.register = async (request, response) => {
    const { run, nombre, correo, contrasenia, es_empleado, especialidad } = request.body
    var connection = null

    try {
        console.log("aqui comienza el try")
        const nuevoUsuario = new Usuario(run, nombre, correo, contrasenia, es_empleado, null)
        console.log(especialidad)
        if (especialidad !== null) {
            const nuevaEspecialidad = new Especialidad(especialidad)
            nuevoUsuario.especialidad = nuevaEspecialidad
        }
        // Encriptar la contraseña antes de guardarla en la base de datos
        const contraseniaEncriptada = await encriptar.hash(contrasenia, 10);

        // Insertar el nuevo usuario en la base de datos
        connection = await abrirConexion();
        var query = `INSERT INTO USUARIO (run, nombre, correo, contrasenia, es_empleado, cod_especialidad) VALUES (?, ?, ?, ?, ?, ?)`;
        const values = [nuevoUsuario.run, nuevoUsuario.nombre, nuevoUsuario.correo, contraseniaEncriptada, nuevoUsuario.es_empleado, nuevoUsuario.especialidad.cod_especialidad]

        await connection.query(query, values)

        return response.status(201).json({ mensaje: "Usuario registrado correctamente" })
    }
    catch (error) {
        console.log(error)
        if (error instanceof ErrorRegistro) {
            return response.status(400).json(message.error)
        } else if (error instanceof ErrorDBA) {
            return response.status(500).json({ error: "Error en la base de datos" })
        } else {
            return response.status(500).json(error.message)
        }
    }

    finally {
        if (connection)
            connection.release()
    }
};


module.exports = User

