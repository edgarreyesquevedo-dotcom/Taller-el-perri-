const express = require('express');
const empleadosController = require('../controllers/empleadosController');
const { uploadEmpleados } = require('../utils/uploads');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
router.get('/', asyncHandler(empleadosController.listar));
router.get('/nuevo', empleadosController.mostrarNuevo);
router.post('/', uploadEmpleados.single('foto'), asyncHandler(empleadosController.crear));
router.get('/:id/editar', asyncHandler(empleadosController.mostrarEditar));
router.post('/:id', uploadEmpleados.single('foto'), asyncHandler(empleadosController.actualizar));
router.post('/:id/baja', asyncHandler(empleadosController.darDeBaja));
router.post('/:id/reactivar', asyncHandler(empleadosController.reactivar));

module.exports = router;
