const { Router } = require("express");

const { createOrder, captureOrder, cancelOrder }  = require("../controller/paymentController.js");


const router = Router();


router.get('/create-order', createOrder);

router.get('/capture-order', captureOrder);

router.get('/cancel-order', cancelOrder);

module.exports = router;