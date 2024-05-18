const { Router } = require("express");
const Pedido = require("../controller/pedidoController.js");
const authenticateToken = require('../middleware/authMiddleware'); 

const router = Router()



router.post("/", authenticateToken, Pedido.crearPedido);




module.exports = router;