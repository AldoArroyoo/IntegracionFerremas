const { Producto } = require ("../controller/productoController.js")
const {Router} = require ("express")


const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');


const router = Router()


router.post("/traerPorCategoria/:cod", authenticateToken, Producto.traerPorCategoria);

router.post("/traerPorEstado/:cod", authenticateToken, Producto.traerPorEstado);

router.post("/traerPorMarca/:cod", authenticateToken, Producto.traerPorMarca);

router.post("/traerEspecifico/:cod", authenticateToken, Producto.traerEspecifico);

router.get("/:cod_producto/sucursal/:cod_sucursal", authenticateToken, Producto.obtenerPrecioYStock);

// Ruta para obtener el historial de precios de un producto específico
router.get('/historial-precios/:cod_producto', authenticateToken, checkRole(['empleado']), Producto.obtenerHistorialPrecios);

router.post('/modificarEstado', authenticateToken, checkRole(['empleado']), Producto.modificarEstado);


module.exports = router
