const express = require('express');
const tiposServiciosController = require('../controllers/tiposServiciosController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(tiposServiciosController.listar));
router.get('/nuevo', tiposServiciosController.mostrarNuevo);
router.post('/', asyncHandler(tiposServiciosController.crear));
router.get('/:id/editar', asyncHandler(tiposServiciosController.mostrarEditar));
router.post('/:id', asyncHandler(tiposServiciosController.actualizar));
router.post('/:id/desactivar', asyncHandler(tiposServiciosController.desactivar));
router.post('/:id/reactivar', asyncHandler(tiposServiciosController.reactivar));

module.exports = router;
