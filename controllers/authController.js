const authService = require('../services/authService');

function mostrarLogin(req, res) {
  if (req.session.userId) return res.redirect('/vehiculos');
  return res.render('auth/login', { titulo: 'Iniciar sesion' });
}

async function iniciarSesion(req, res) {
  try {
    const { email, password } = req.body;
    const usuario = await authService.autenticarUsuario(email, password);

    if (!usuario) {
      return res.status(401).render('auth/login', {
        titulo: 'Iniciar sesion',
        error: 'Email o contrasena incorrectos'
      });
    }

    authService.crearSesion(req, usuario);
    return res.redirect('/vehiculos');
  } catch (error) {
    return res.status(500).render('auth/login', {
      titulo: 'Iniciar sesion',
      error: 'No se pudo iniciar sesion'
    });
  }
}

function mostrarRegistro(req, res) {
  if (req.session.userId) return res.redirect('/vehiculos');
  return res.render('auth/registro', { titulo: 'Crear cuenta' });
}

async function registrar(req, res) {
  try {
    await authService.registrarUsuario(req.body);
    return res.redirect('/login');
  } catch (error) {
    const mensaje = error.code === 11000 ? 'El email ya esta registrado' : 'No se pudo crear la cuenta';
    return res.status(400).render('auth/registro', { titulo: 'Crear cuenta', error: mensaje });
  }
}

function cerrarSesion(req, res) {
  req.session.destroy(() => {
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
}

module.exports = { mostrarLogin, iniciarSesion, mostrarRegistro, registrar, cerrarSesion };
