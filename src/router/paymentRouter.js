const { Router } = require("express");

const { createOrder, captureOrder, cancelOrder }  = require("../controller/paymentController.js");



const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');


const router = Router();

//authenticateToken, checkRole(['cliente'])
router.post('/create-order',authenticateToken, createOrder);

router.get('/capture-order', captureOrder);

router.get('/cancel-order', cancelOrder);

module.exports = router;