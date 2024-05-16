const { abrirConexion, ErrorDBA } = require("../database.js")
const Producto = require("../models/Producto.js")
const Pedido = require("../models/Producto.js")

Pedido.crearPedido = async (req, res) => {
    //const { cliente_id, producto_id, cantidad, precio_total } = req.body;
    let connection;

    try {

        const { usuario, fecha, estado, detalles } = req.body;

        if (!detalles || !Array.isArray(detalles)) {
            return res.status(400).json({ mensaje: 'Detalles del pedido son requeridos y deben ser un array' });
        }

        // Calcular el total del pedido
        let totalPedido = 0;
        for (const detalle of detalles) {
            totalPedido += detalle.cantidad * detalle.precio;
        }

        connection = await abrirConexion();

        // Inserta el pedido
        const sqlPedido = 'INSERT INTO PEDIDO (fecha, total_pedido, estado, run) VALUES (?, ?, ?, ?)';
        const [pedidoResult] = await connection.execute(sqlPedido, [fecha, totalPedido, estado, usuario]);

        // Extrae el codigo del pedido recien creado para si poder crear los detalles del pedido
        const cod_pedido = pedidoResult.insertId;

        
        // Insertar los detalles del pedido
        const sqlDetalle = `INSERT INTO DETALLE_PEDIDO (cod_pedido, cod_producto, cantidad, precio, total_detalle)
                        VALUES (?, ?, ?, ?, ?)
                        ON DUPLICATE KEY UPDATE
                            cantidad = cantidad + VALUES(cantidad),
                            total_detalle = cantidad * precio`;
        for (const detalle of detalles) {
            await connection.execute(sqlDetalle, [cod_pedido, detalle.cod_producto, detalle.cantidad, detalle.precio, detalle.cantidad * detalle.precio]);
        }

        await connection.commit();

         // Obtén los detalles del pedido recién creado
        const detallesPedido = await connection.execute('SELECT * FROM DETALLE_PEDIDO WHERE cod_pedido = ?', [cod_pedido]);

        const pedidoCreado = {
            cod_pedido: cod_pedido,
            usuario,
            fecha,
            estado,
            detalles: detallesPedido[0]
        };
    
        res.status(201).json(pedidoCreado);

    } catch (error) {
        console.log(error)
        if (error instanceof ErrorDBA) {
            return response.status(500).json(error)
        } else {
            return response.status(500).json(error)
        }
    }finally {
        if (connection) {
            await connection.end();  // Cierra la conexión
        }
    }
}


module.exports = Pedido;