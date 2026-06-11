const express = require('express');
const empleadosController = require('../controllers/empleadosController');
const { uploadEmpleados } = require('../utils/uploads');

const router = express.Router();
router.get('/', empleadosController.listar);
router.get('/nuevo', empleadosController.mostrarNuevo);
router.post('/', uploadEmpleados.single('foto'), empleadosController.crear);
router.get('/:id/editar', empleadosController.mostrarEditar);
router.post('/:id', uploadEmpleados.single('foto'), empleadosController.actualizar);
router.post('/:id/baja', empleadosController.darDeBaja);
router.post('/:id/reactivar', empleadosController.reactivar);

module.exports = router;
