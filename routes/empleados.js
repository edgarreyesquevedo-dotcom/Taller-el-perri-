const express = require('express');
const empleadosController = require('../controllers/empleadosController');

const router = express.Router();
router.get('/', empleadosController.listar);
router.get('/nuevo', empleadosController.mostrarNuevo);
router.post('/', empleadosController.crear);
router.get('/:id/editar', empleadosController.mostrarEditar);
router.post('/:id', empleadosController.actualizar);
router.post('/:id/baja', empleadosController.darDeBaja);
router.post('/:id/reactivar', empleadosController.reactivar);

module.exports = router;
