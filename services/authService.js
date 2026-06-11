const Usuario = require('../models/Usuario');

async function autenticarUsuario(email, password) {
  const usuario = await Usuario.findOne({ email }).select('+password');

  if (!usuario || !(await usuario.compararPassword(password))) {
    return null;
  }

  return usuario;
}

function crearSesion(req, usuario) {
  req.session.userId = usuario._id;
  req.session.usuario = { nombre: usuario.nombre, email: usuario.email };
}

function registrarUsuario(datos) {
  const { nombre, email, password } = datos;
  return Usuario.create({ nombre, email, password });
}

module.exports = { autenticarUsuario, crearSesion, registrarUsuario };
