const { abrirConexion } = require("../database.js");
const Pedido = require("../models/Pedido.js");

const { obtenerCambio } = require("./productoController.js");
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

        const usd = await obtenerCambio();

        pedido.precio_usd = usd;

        const total_usd = (pedido.total_pedido / usd).toFixed(2);

        const total_usd_number = parseFloat(total_usd);

        // Enviar respuesta con el objeto pedido y el valor total en USD como un número
        res.status(201).json({ pedido, total_usd: total_usd_number });

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
            await connection.release();
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

        // Actualiza el pedido para que tenga el total calculado al crear los detalles
        const sqlUpdatePedido = 'UPDATE DETALLE_SUCURSAL SET cantidad = cantidad - ? WHERE cod_producto = ? AND cod_sucursal = ?';
        await connection.execute(sqlUpdatePedido, [detallePedido.cantidad, detallePedido.producto, sucursal]);


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

Pedido.eliminarPedido = async (req, res) => {
    let connection; // Declara la conexión aquí

    try {
        const { cod_pedido } = req.params; // Obtener el cod_pedido de los parámetros de la URL

        connection = await abrirConexion(); // Inicializa la conexión

        // Verificar si el pedido existe antes de continuar
        const [pedidoExists] = await connection.execute('SELECT 1 FROM PEDIDO WHERE cod_pedido = ?', [cod_pedido]);
        if (pedidoExists.length === 0) {
            throw new Error('El pedido no existe');
        }

        // Llamar a la función descartarDetalles para revertir el stock de productos
        await descartarDetalles(connection, cod_pedido); // Pasa la conexión como primer parámetro y el código del pedido como segundo parámetro

        // Eliminar el pedido
        const sqlDeletePedido = 'DELETE FROM PEDIDO WHERE cod_pedido = ?';
        await connection.execute(sqlDeletePedido, [cod_pedido]);

        console.log("Pedido eliminado con éxito");
        res.status(200).json({ message: 'Pedido eliminado con éxito' });
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ error: error.message }); // Enviar el mensaje de error en la respuesta
    } finally {
        if (connection) {
            await connection.release(); // Libera la conexión en caso de error o éxito
        }
    }
};


//Esta funcion revierte el estock de todos los detalle de un pedidio y los elimina
async function descartarDetalles(connection, cod_pedido) {
    try {

        if (!cod_pedido) {
            throw new Error('cod_pedido is undefined');
        }
        
        // Obtener la sucursal del pedido
        const sucursal = await connection.execute('SELECT cod_sucursal FROM PEDIDO WHERE cod_pedido = ?', [cod_pedido]);

        // Obtener los detalles del pedido
        const [detallesPedido] = await connection.execute('SELECT * FROM DETALLE_PEDIDO WHERE cod_pedido = ?', [cod_pedido]);

        // Iterar sobre cada detalle del pedido para actualizar el stock en DETALLE_SUCURSAL
        for (const detalle of detallesPedido) {
            const { cod_producto, cantidad } = detalle;
            // Actualizar el stock en DETALLE_SUCURSAL para el producto y la sucursal correspondiente
            const sqlUpdateStock = 'UPDATE DETALLE_SUCURSAL SET cantidad = cantidad + ? WHERE cod_producto = ? AND cod_sucursal = ?';
            await connection.execute(sqlUpdateStock, [cantidad, cod_producto, sucursal[0][0].cod_sucursal]);
        }

        // Eliminar los detalles del pedido
        const sqlDeleteDetalle = 'DELETE FROM DETALLE_PEDIDO WHERE cod_pedido = ?';
        await connection.execute(sqlDeleteDetalle, [cod_pedido]);

        console.log("Stock restaurado");
    } catch (error) {
        throw new Error('Error incrementing product stock: ' + error.message);
    }
}


Pedido.obtenerHistorialPrecios = async (req, res) => {
    let connection;
    try {
        const { cod_producto } = req.params;

        if (!cod_producto) {
            return res.status(400).json({ mensaje: 'El código del producto es requerido' });
        }

        connection = await abrirConexion();

        // Consulta para obtener los detalles de los pedidos con la fecha del pedido para un producto específico
        const sqlHistorialPrecios = `
            SELECT DP.cod_producto, P.fecha, DP.precio
            FROM DETALLE_PEDIDO DP
            JOIN PEDIDO P ON DP.cod_pedido = P.cod_pedido
            WHERE DP.cod_producto = ?
            ORDER BY P.fecha;
        `;
        const [result] = await connection.execute(sqlHistorialPrecios, [cod_producto]);

        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron registros en el historial de precios para el producto especificado' });
        }

        // Procesar los resultados para obtener solo los cambios de precio
        const historialPrecios = [];
        let ultimoPrecio = null;

        for (const row of result) {
            const { fecha, precio } = row;

            if (ultimoPrecio !== precio) {
                historialPrecios.push({ fecha, precio });
                ultimoPrecio = precio;
            }
        }

        res.status(200).json(historialPrecios);
    } catch (error) {
        console.error('Error al obtener el historial de precios:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    } finally {
        if (connection) {
            await connection.release();
        }
    }
};
module.exports = Pedido;
