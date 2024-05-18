const Producto = require ("../controller/productoController.js")
const {Router} = require ("express")

const router = Router()

router.route("/traerPorCategoria/:cod")
    .post(Producto.traerPorCategoria)

router.route("/traerPorEstado/:cod")
    .post(Producto.traerPorEstado)

router.route("/traerPorMarca/:cod")
    .post(Producto.traerPorMarca)

router.route("/traerEspecifico/:cod")
    .post(Producto.traerEspecifico)

module.exports = router