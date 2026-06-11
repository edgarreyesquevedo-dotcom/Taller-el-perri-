const express = require('express');
const refaccionesController = require('../controllers/refaccionesController');

const router = express.Router();
router.get('/', refaccionesController.listar);
router.get('/nuevo', refaccionesController.mostrarNuevo);
router.get('/orden', refaccionesController.mostrarOrden);
router.post('/orden', refaccionesController.comprar);
router.post('/', refaccionesController.crear);
router.get('/:id/editar', refaccionesController.mostrarEditar);
router.post('/:id', refaccionesController.actualizar);
router.post('/:id/eliminar', refaccionesController.eliminar);

module.exports = router;
