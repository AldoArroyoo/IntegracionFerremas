const { abrirConexion, ErrorDBA } = require("../database.js");
const Pedido = require("../models/Pedido.js");
const DetallePedido = require("../models/DetallePedido.js");

Pedido.crearPedido = async (req, res) => {
    let connection;

    try {
        const { usuario, fecha, estado, detalles } = req.body;

        // Verifica que venga detalles
        if (!detalles || !Array.isArray(detalles)) {
            return res.status(400).json({ mensaje: 'Detalles del pedido son requeridos y deben ser un array' });
        }

        connection = await abrirConexion();

        // Crea el objeto Pedido
        const pedido = new Pedido(0, usuario, fecha, 0, estado);

        //Inserta el pedidio en la base de datos
        const sqlPedido = 'INSERT INTO PEDIDO (fecha, total_pedido, estado, run) VALUES (?, ?, ?, ?)';
        const [pedidoResult] = await connection.execute(sqlPedido, [fecha, 0, estado, usuario]);

        pedido.cod_pedido = pedidoResult.insertId;
        
        // Procesa los detalles del pedido y retorna el total del pedido
        pedido.total_pedido = await procesarDetalles(connection, detalles, pedido);

        // Actualiza el pedido para que tenga el total calculado al crear los detalles
        const sqlUpdatePedido = 'UPDATE PEDIDO SET total_pedido = ? WHERE cod_pedido = ?;';
        await connection.execute(sqlUpdatePedido, [pedido.total_pedido, pedido.cod_pedido]);

        await connection.commit();

        //Extrae los detalles del pedido creado para poder retornarlo
        const [detallesPedido] = await connection.execute('SELECT * FROM DETALLE_PEDIDO WHERE cod_pedido = ?', [pedido.cod_pedido]);

        pedido.detalles = detallesPedido;
        
        res.status(201).json(pedido);

    } catch (error) {
        console.error(error);
        if (connection) await connection.rollback();
        const mensajeError = error instanceof ErrorDBA ? error : { mensaje: 'Error interno del servidor' };
        res.status(500).json(mensajeError);
    } finally {
        if (connection) {
            await connection.end();
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


module.exports = Pedido;
