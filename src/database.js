// Importa el módulo MySQL
const mysql = require('mysql2/promise');
require("dotenv").config()

// Configura los detalles de la conexión
const connection = mysql.createPool(
    `mysql://${process.env.MYSQL_USER}:${process.env.MYSQL_CONTRASENIA}@dba-ferremas-duocuc-262b.c.aivencloud.com:18148/ferremas?ssl-mode=REQUIRED`
)

class ErrorDBA extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = "ErrorDBA";
    }
}


// Conexion a la base de datos
async function abrirConexion () {
    console.log(process.env.MYSQL_CONTRASENIA, process.env.MYSQL_USER)
    return await connection.getConnection()
}




module.exports = {abrirConexion, ErrorDBA}
