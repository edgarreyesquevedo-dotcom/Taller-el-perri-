const express = require('express');
const contabilidadController = require('../controllers/contabilidadController');

const router = express.Router();

router.get('/', contabilidadController.mostrarDashboard);
router.get('/reportes/nomina.pdf', contabilidadController.exportarNominaPdf);
router.get('/reportes/egresos.pdf', contabilidadController.exportarEgresosPdf);
router.get('/reportes/ingresos.pdf', contabilidadController.exportarIngresosPdf);
router.post('/pagar-nomina', contabilidadController.pagarNomina);

module.exports = router;
