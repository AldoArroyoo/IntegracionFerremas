const { Router } = require("express");
const Pedido = require("../controller/pedidoController.js");

const router = Router()



router.post("/pedido", Pedido.crearPedido);


module.exports = router;