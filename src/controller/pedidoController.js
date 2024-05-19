const { abrirConexion } = require("../database.js");
const Pedido = require("../models/Pedido.js");
const DetallePedido = require("../models/DetallePedido.js");
const axios = require('axios');

Pedido.crearPedido = async (req, res) => {
    let connection;

    try {
        const { usuario, detalles, sucursal } = req.body;

        // Verifica que vengan detalles
        if (!detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ mensaje: 'Detalles del pedido son requeridos' });
        }

        connection = await abrirConexion();
        await connection.beginTransaction(); // Inicia la transacción

        const fecha = new Date(); // Declarar fecha antes de usarla

        // Crea el objeto Pedido
        const pedido = new Pedido(0, usuario, fecha, 0, false, sucursal);

        // Inserta el pedido en la base de datos
        const sqlPedido = 'INSERT INTO PEDIDO (fecha, total_pedido, estado, run, cod_sucursal) VALUES (?, ?, ?, ?, ?)';
        const [pedidoResult] = await connection.execute(sqlPedido, [fecha, 0, false, usuario, sucursal]);

        pedido.cod_pedido = pedidoResult.insertId;

        // Procesa los detalles del pedido y retorna el total del pedido
        pedido.total_pedido = await procesarDetalles(connection, detalles, pedido, sucursal);

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

        // Identifica el tipo de error y envía el mensaje correspondiente
        if (error.message.includes('Producto con código')) {
            res.status(400).json({ mensaje: error.message });
        } else if (error.message.includes('Stock insuficiente')) {
            res.status(400).json({ mensaje: error.message });
        } else if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ mensaje: 'Entrada duplicada, verifique los datos del pedido' });
        } else if (error.code === 'ER_NO_REFERENCED_ROW' || error.code === 'ER_NO_REFERENCED_ROW_2') {
            res.status(400).json({ mensaje: 'Referencia a una fila inexistente en la base de datos' });
        } else if (error.code === 'ER_BAD_FIELD_ERROR') {
            res.status(400).json({ mensaje: 'Campo inválido en la consulta a la base de datos' });
        } else if (error.message.includes('timeout')) {
            res.status(503).json({ mensaje: 'Timeout de conexión a la base de datos' });
        } else {
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    } finally {
        if (connection) {
            await connection.release(); // Usar release() en lugar de end()
        }
    }
};

const obtenerPrecioYStock = async (cod_producto, cod_sucursal) => {
    try {

        const response = await axios.get(`http://localhost:3002/1.0/productos/${cod_producto}/sucursal/${cod_sucursal}`);

        if (response.data && response.data.precio !== undefined && response.data.cantidad !== undefined) {

            return { precio: response.data.precio, stock: response.data.cantidad };
        }
    } catch (error) {
        console.error(`Error al obtener el precio y stock del producto ${cod_producto} en la sucursal ${cod_sucursal}:`, error);
        return null;
    }
};

const procesarDetalles = async (connection, detalles, pedido, sucursal) => {
    let total_pedido = 0;
    const sqlDetalle = `INSERT INTO DETALLE_PEDIDO (cod_pedido, cod_producto, cantidad, precio, total_detalle)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            cantidad = cantidad + VALUES(cantidad),
                            total_detalle = cantidad * precio`;

    for (const detalle of detalles) {
        const productoInfo = await obtenerPrecioYStock(detalle.producto, sucursal);

        if (productoInfo === null || productoInfo.precio === null) {
            throw new Error(`Producto con código ${detalle.producto} no encontrado o no tiene precio`);
        }

        if (detalle.cantidad > productoInfo.stock) {
            throw new Error(`Stock insuficiente para el producto con código ${detalle.producto} en la sucursal ${sucursal}`);
        }

        const { precio } = productoInfo;

        const detallePedido = new DetallePedido(detalle.cantidad, precio, pedido.cod_pedido, detalle.producto);
        pedido.agregarDetalle(detallePedido);

        await connection.execute(sqlDetalle, [detallePedido.pedido, detallePedido.producto, detallePedido.cantidad, detallePedido.precio, detallePedido.total_detalle]);

        total_pedido += detallePedido.total_detalle;
    }
    return total_pedido;
};

Pedido.updateEstado = async (req, res) => {
    let connection;
    try {
        const { cod_pedido, estado } = req.body;

        if (!cod_pedido || typeof estado !== 'boolean') {
            return res.status(400).json({ mensaje: 'Código de pedido y estado son requeridos' });
        }

        connection = await abrirConexion();
        const sqlUpdateEstado = 'UPDATE PEDIDO SET estado = ? WHERE cod_pedido = ?';
        const [result] = await connection.execute(sqlUpdateEstado, [estado, cod_pedido]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ mensaje: 'Pedido no encontrado' });
        }

        res.status(200).json({ mensaje: 'Estado del pedido actualizado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error actualizando el estado del pedido' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

Pedido.getPedido = async (cod_pedido) => {
    let connection;
    try {
        connection = await abrirConexion();
        const [result] = await connection.execute('SELECT * FROM PEDIDO WHERE cod_pedido = ?', [cod_pedido]);
        if (result.length === 0) {
            return null;
        }
        return result[0];
    } catch (error) {
        console.error(error);
        throw new Error('Error al obtener el pedido');
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};

//Pedido.getPedido = getPedido;

module.exports = Pedido;
