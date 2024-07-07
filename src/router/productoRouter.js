const { Producto } = require ("../controller/productoController.js")
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

router.get('/:cod_producto/sucursal/:cod_sucursal', Producto.obtenerPrecioYStock);


// Ruta para obtener el historial de precios de un producto específico
router.get('/historial-precios/:cod_producto', Producto.obtenerHistorialPrecios);

router.route("/modificarEstado")
    .post(Producto.modificarEstado)

module.exports = router
