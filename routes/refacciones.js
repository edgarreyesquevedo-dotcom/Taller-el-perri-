const express = require('express');
const refaccionesController = require('../controllers/refaccionesController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(refaccionesController.listar));
router.get('/nuevo', refaccionesController.mostrarNuevo);
router.get('/orden', asyncHandler(refaccionesController.mostrarOrden));
router.post('/orden', asyncHandler(refaccionesController.comprar));
router.post('/', asyncHandler(refaccionesController.crear));
router.get('/:id/editar', asyncHandler(refaccionesController.mostrarEditar));
router.post('/:id', asyncHandler(refaccionesController.actualizar));
router.post('/:id/eliminar', asyncHandler(refaccionesController.eliminar));

module.exports = router;
