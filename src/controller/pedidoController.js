const { abrirConexion, ErrorDBA, ErrorConsultaDBA, ErrorConexionDBA } = require("../database.js");
const Pedido = require("../models/Pedido.js");
const DetallePedido = require("../models/DetallePedido.js");

Pedido.crearPedido = async (req, res) => {
    let connection;

    try {
        const { usuario, estado, detalles } = req.body;

        // Verifica que vengan detalles
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ mensaje: 'Detalles del pedido son requeridos' });
        }

        connection = await abrirConexion();
        await connection.beginTransaction(); // Inicia la transacción

        const fecha = new Date(); // Declarar fecha antes de usarla

        // Crea el objeto Pedido
        const pedido = new Pedido(0, usuario, fecha, 0, estado);

        // Inserta el pedido en la base de datos
        const sqlPedido = 'INSERT INTO PEDIDO (fecha, total_pedido, estado, run) VALUES (?, ?, ?, ?)';
        const [pedidoResult] = await connection.execute(sqlPedido, [fecha, 0, estado, usuario]);

        pedido.cod_pedido = pedidoResult.insertId;

        // Procesa los detalles del pedido y retorna el total del pedido
        pedido.total_pedido = await procesarDetalles(connection, detalles, pedido);

        // Actualiza el pedido para que tenga el total calculado al crear los detalles
        const sqlUpdatePedido = 'UPDATE PEDIDO SET total_pedido = ? WHERE cod_pedido = ?';
        await connection.execute(sqlUpdatePedido, [pedido.total_pedido, pedido.cod_pedido]);

        await connection.commit(); // Confirma la transacción

        // Extrae los detalles del pedido creado para poder retornarlo
        const [detallesPedido] = await connection.execute('SELECT * FROM DETALLE_PEDIDO WHERE cod_pedido = ?', [pedido.cod_pedido]);

        pedido.detalles = detallesPedido;

        res.status(201).json(pedido);

    } catch (error) {
        console.error(error);
        if (connection) await connection.rollback(); // Revierte la transacción
        const mensajeError = error instanceof ErrorDBA ? error.message : 'Error interno del servidor';
        res.status(500).json({ mensaje: mensajeError });
    } finally {
        if (connection) {
            await connection.release(); // Usar release() en lugar de end()
        }
    }
};

const procesarDetalles = async (connection, detalles, pedido) => {
    let total_pedido = 0;
    const sqlDetalle = `INSERT INTO DETALLE_PEDIDO (cod_pedido, cod_producto, cantidad, precio, total_detalle)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            cantidad = cantidad + VALUES(cantidad),
                            total_detalle = cantidad * precio`;

    for (const detalle of detalles) {
        const [productoResult] = await connection.execute('SELECT precio FROM PRODUCTO WHERE cod_producto = ?', [detalle.producto]);
        const precioProducto = productoResult[0].precio;

        const detallePedido = new DetallePedido(detalle.cantidad, precioProducto, pedido.cod_pedido, detalle.producto);
        pedido.agregarDetalle(detallePedido);

        await connection.execute(sqlDetalle, [detallePedido.pedido, detallePedido.producto, detallePedido.cantidad, detallePedido.precio, detallePedido.total_detalle]);

        total_pedido += detallePedido.total_detalle;
    }
    return total_pedido;
};

Pedido.actualizarEstado = async (req, res) => {
    let connection;
    try {
        const { estado } = req.body;
        const { id } = req.params;

        connection = await abrirConexion();
        await connection.beginTransaction(); // Inicia la transacción

        const sqlUpdatePedido = 'UPDATE PEDIDO SET estado = ? WHERE cod_pedido = ?';
        const [result] = await connection.execute(sqlUpdatePedido, [estado, id]);

        await connection.commit(); // Confirma la transacción

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        res.status(200).json({ mensaje: 'Estado del pedido actualizado' });

    } catch (error) {
        console.error(error);
        if (connection) await connection.rollback(); // Revierte la transacción
        res.status(500).json({ mensaje: 'Error interno del servidor D' });
    } finally {
        if (connection) {
            await connection.release(); // Usar release() en lugar de end()
        }
    }
};

module.exports = Pedido;
