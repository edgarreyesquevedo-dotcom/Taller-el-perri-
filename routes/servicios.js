const express = require('express');
const serviciosController = require('../controllers/serviciosController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(serviciosController.listar));
router.get('/nuevo', asyncHandler(serviciosController.mostrarNuevo));
router.post('/', asyncHandler(serviciosController.crear));
router.get('/:id/pdf', asyncHandler(serviciosController.exportarPdf));
router.get('/:id/detalle', asyncHandler(serviciosController.mostrarDetalle));
router.get('/:id/editar', asyncHandler(serviciosController.mostrarEditar));
router.post('/:id', asyncHandler(serviciosController.actualizar));

module.exports = router;
