const { abrirConexion } = require("../database.js");

const Consulta = {};

Consulta.crearConsulta = async (req, res) => {
    let connection;
    try {
        const { pregunta, cliente_run } = req.body;

        if (!pregunta || !cliente_run) {
            return res.status(400).json({ mensaje: 'La pregunta y el cliente_run son requeridos' });
        }

        connection = await abrirConexion();

        const fecha_hora = new Date();
        const sqlCrearConsulta = 'INSERT INTO CONSULTA (fecha_hora, pregunta, cliente_run) VALUES (?, ?, ?)';
        await connection.execute(sqlCrearConsulta, [fecha_hora, pregunta, cliente_run]);

        res.status(201).json({ mensaje: 'Consulta creada exitosamente', fecha_hora });
    } catch (error) {
        console.error('Error al crear la consulta:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

Consulta.obtenerConsultasSinRespuesta = async (req, res) => {
    let connection;
    try {
        connection = await abrirConexion();

        const sqlConsultasSinRespuesta = 'SELECT * FROM CONSULTA WHERE respuesta IS NULL';
        const [result] = await connection.execute(sqlConsultasSinRespuesta);

        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'No hay consultas sin respuesta' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener las consultas sin respuesta:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};


Consulta.responderConsulta = async (req, res) => {
    let connection;
    try {
        const { cod_consulta, respuesta, empleado_run } = req.body;

        if (!cod_consulta || !respuesta || !empleado_run) {
            return res.status(400).json({ mensaje: 'El cod_consulta, respuesta y empleado_run son requeridos' });
        }

        connection = await abrirConexion();

        const fecha_respuesta = new Date();
        const sqlResponderConsulta = 'UPDATE CONSULTA SET respuesta = ?, empleado_run = ?, fecha_respuesta = ? WHERE cod_consulta = ?';
        const [result] = await connection.execute(sqlResponderConsulta, [respuesta, empleado_run, fecha_respuesta, cod_consulta]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Consulta no encontrada' });
        }

        res.status(200).json({ mensaje: 'Consulta respondida exitosamente', fecha_respuesta });
    } catch (error) {
        console.error('Error al responder la consulta:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};


Consulta.obtenerConsultasConRespuesta = async (req, res) => {
    let connection;
    try {
        connection = await abrirConexion();

        const sqlConsultasConRespuesta = 'SELECT * FROM CONSULTA WHERE respuesta IS NOT NULL';
        const [result] = await connection.execute(sqlConsultasConRespuesta);

        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'No hay consultas con respuesta' });
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('Error al obtener las consultas con respuesta:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};


module.exports = Consulta;