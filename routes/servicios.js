const express = require('express');
const serviciosController = require('../controllers/serviciosController');

const router = express.Router();
router.get('/', serviciosController.listar);
router.get('/nuevo', serviciosController.mostrarNuevo);
router.post('/', serviciosController.crear);
router.get('/:id/pdf', serviciosController.exportarPdf);
router.get('/:id/detalle', serviciosController.mostrarDetalle);
router.get('/:id/editar', serviciosController.mostrarEditar);
router.post('/:id', serviciosController.actualizar);

module.exports = router;
