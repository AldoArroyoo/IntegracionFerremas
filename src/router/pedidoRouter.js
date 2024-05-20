const { Router } = require("express");
const Pedido = require("../controller/pedidoController.js");
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');


const router = Router()


// Ruta para crear un nuevo pedido
router.post("/", authenticateToken, checkRole(['cliente']), Pedido.crearPedido);

// Ruta para eliminar un pedido
router.delete("/:cod_pedido", authenticateToken, checkRole(['cliente']), Pedido.eliminarPedido);

// Ruta para obtener el historial de precios de un producto específico
router.get('/historial-precios/:cod_producto', Pedido.obtenerHistorialPrecios);

module.exports = router;