const express = require('express');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/login', authController.mostrarLogin);
router.post('/login', asyncHandler(authController.iniciarSesion));
router.get('/registro', authController.mostrarRegistro);
router.post('/registro', asyncHandler(authController.registrar));
router.get('/logout', authController.cerrarSesion);

module.exports = router;
