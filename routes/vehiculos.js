const express = require('express');
const vehiculosController = require('../controllers/vehiculosController');
const { uploadVehiculos } = require('../utils/uploads');

const router = express.Router();

router.get('/', vehiculosController.listar);
router.get('/nuevo', vehiculosController.mostrarNuevo);
router.post('/', uploadVehiculos.array('imagenes', 8), vehiculosController.crear);
router.get('/:id/editar', vehiculosController.mostrarEditar);
router.post('/:id', uploadVehiculos.array('imagenes', 8), vehiculosController.actualizar);
router.post('/:id/eliminar', vehiculosController.eliminar);

module.exports = router;
