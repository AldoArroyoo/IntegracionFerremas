const { Router } = require("express");
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');
const express = require('express');

const Consulta = require('../controller/consutlaControlle.js');

const router = Router()


router.post('/', Consulta.crearConsulta);
router.get('/sin-respuesta', Consulta.obtenerConsultasSinRespuesta);
router.put('/responder', Consulta.responderConsulta);
router.get('/con-respuesta', Consulta.obtenerConsultasConRespuesta);

module.exports = router;