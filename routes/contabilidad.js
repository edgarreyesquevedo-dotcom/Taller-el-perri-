const express = require('express');
const contabilidadController = require('../controllers/contabilidadController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(contabilidadController.mostrarDashboard));
router.get('/reportes/nomina.pdf', asyncHandler(contabilidadController.exportarNominaPdf));
router.get('/reportes/egresos.pdf', asyncHandler(contabilidadController.exportarEgresosPdf));
router.get('/reportes/ingresos.pdf', asyncHandler(contabilidadController.exportarIngresosPdf));
router.post('/pagar-nomina', asyncHandler(contabilidadController.pagarNomina));

module.exports = router;
