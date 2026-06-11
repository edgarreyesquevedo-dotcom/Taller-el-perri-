const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/login', authController.mostrarLogin);
router.post('/login', authController.iniciarSesion);
router.get('/registro', authController.mostrarRegistro);
router.post('/registro', authController.registrar);
router.get('/logout', authController.cerrarSesion);

module.exports = router;
