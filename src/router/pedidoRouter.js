const { Router } = require("express");
const Pedido = require("../controller/pedidoController.js");
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');


const router = Router()



router.post("/", authenticateToken, checkRole(['cliente']), Pedido.crearPedido);




module.exports = router;