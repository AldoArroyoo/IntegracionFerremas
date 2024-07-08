const { Router } = require("express");
const authenticateToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/checkRoleMiddleware.js');
const express = require('express');

const Consulta = require('../controller/consutlaControlle.js');

const router = Router()


router.post('/', authenticateToken,  checkRole(['cliente']), Consulta.crearConsulta);
router.get('/sin-respuesta', authenticateToken, checkRole(['empleado']), Consulta.obtenerConsultasSinRespuesta);
router.put('/responder',authenticateToken, checkRole(['empleado']), Consulta.responderConsulta);
router.get('/con-respuesta', authenticateToken, checkRole(['empleado']), Consulta.obtenerConsultasConRespuesta);

module.exports = router;