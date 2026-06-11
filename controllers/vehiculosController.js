const vehiculosService = require('../services/vehiculosService');

async function listar(req, res) {
  const vehiculos = await vehiculosService.listarVisibles();
  res.render('vehiculos/index', { titulo: 'Vehiculos', vehiculos, error: req.query.error });
}

function mostrarNuevo(req, res) {
  res.render('vehiculos/nuevo', { titulo: 'Nuevo vehiculo', vehiculo: {} });
}

async function crear(req, res) {
  try {
    await vehiculosService.crear(req.body, req.files);
    res.redirect('/vehiculos');
  } catch (error) {
    const mensaje = error.code === 11000 ? 'La placa ya existe' : 'Revisa los datos del vehiculo';
    res.status(400).render('vehiculos/nuevo', { titulo: 'Nuevo vehiculo', vehiculo: req.body, error: mensaje });
  }
}

async function mostrarEditar(req, res) {
  const vehiculo = await vehiculosService.buscarPorId(req.params.id);
  if (!vehiculo) return res.redirect('/vehiculos');
  return res.render('vehiculos/editar', { titulo: 'Editar vehiculo', vehiculo });
}

async function actualizar(req, res) {
  try {
    await vehiculosService.actualizar(req.params.id, req.body, req.files);
    res.redirect('/vehiculos');
  } catch (error) {
    const vehiculo = { ...req.body, _id: req.params.id };
    res.status(400).render('vehiculos/editar', { titulo: 'Editar vehiculo', vehiculo, error: 'No se pudo actualizar el vehiculo' });
  }
}

async function eliminar(req, res) {
  try {
    await vehiculosService.eliminar(req.params.id);
    res.redirect('/vehiculos');
  } catch (error) {
    res.redirect(`/vehiculos?error=${encodeURIComponent(error.message)}`);
  }
}

module.exports = { listar, mostrarNuevo, crear, mostrarEditar, actualizar, eliminar };
