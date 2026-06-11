const express = require('express');
const tiposServiciosController = require('../controllers/tiposServiciosController');

const router = express.Router();

router.get('/', tiposServiciosController.listar);
router.get('/nuevo', tiposServiciosController.mostrarNuevo);
router.post('/', tiposServiciosController.crear);
router.get('/:id/editar', tiposServiciosController.mostrarEditar);
router.post('/:id', tiposServiciosController.actualizar);
router.post('/:id/desactivar', tiposServiciosController.desactivar);
router.post('/:id/reactivar', tiposServiciosController.reactivar);

module.exports = router;
