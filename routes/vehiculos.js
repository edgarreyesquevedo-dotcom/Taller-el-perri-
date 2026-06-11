const express = require('express');
const vehiculosController = require('../controllers/vehiculosController');
const { uploadVehiculos } = require('../utils/uploads');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(vehiculosController.listar));
router.get('/nuevo', vehiculosController.mostrarNuevo);
router.post('/', uploadVehiculos.array('imagenes', 8), asyncHandler(vehiculosController.crear));
router.get('/:id/editar', asyncHandler(vehiculosController.mostrarEditar));
router.post('/:id', uploadVehiculos.array('imagenes', 8), asyncHandler(vehiculosController.actualizar));
router.post('/:id/eliminar', asyncHandler(vehiculosController.eliminar));

module.exports = router;
