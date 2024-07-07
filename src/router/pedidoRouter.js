const { Router } = require("express");
const Pedido = require("../controller/pedidoController.js");
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');


const router = Router()


// Ruta para crear un nuevo pedido
router.post("/", authenticateToken, Pedido.crearPedido);


// Ruta para obtener un pedido específico
router.get("/:cod_pedido", authenticateToken, Pedido.buscarPedido);



module.exports = router;