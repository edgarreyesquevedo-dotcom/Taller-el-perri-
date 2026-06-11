const tiposServiciosService = require('../services/tiposServiciosService');

async function listar(req, res) {
  const tiposServicios = await tiposServiciosService.listar();
  res.render('tiposServicios/index', { titulo: 'Catalogo de servicios', tiposServicios });
}

function mostrarNuevo(req, res) {
  res.render('tiposServicios/nuevo', { titulo: 'Nuevo servicio', tipoServicio: { activo: true } });
}

async function crear(req, res) {
  try {
    await tiposServiciosService.crear(req.body);
    res.redirect('/catalogo-servicios');
  } catch (error) {
    res.status(400).render('tiposServicios/nuevo', { titulo: 'Nuevo servicio', tipoServicio: req.body, error: error.message || 'No se pudo crear el servicio' });
  }
}

async function mostrarEditar(req, res) {
  const tipoServicio = await tiposServiciosService.buscarPorId(req.params.id);
  if (!tipoServicio) return res.redirect('/catalogo-servicios');
  return res.render('tiposServicios/editar', { titulo: 'Editar servicio', tipoServicio });
}

async function actualizar(req, res) {
  try {
    await tiposServiciosService.actualizar(req.params.id, req.body);
    res.redirect('/catalogo-servicios');
  } catch (error) {
    const tipoServicio = { ...req.body, _id: req.params.id, activo: req.body.activo === 'on' };
    res.status(400).render('tiposServicios/editar', { titulo: 'Editar servicio', tipoServicio, error: error.message || 'No se pudo actualizar el servicio' });
  }
}

async function desactivar(req, res) {
  await tiposServiciosService.desactivar(req.params.id);
  res.redirect('/catalogo-servicios');
}

async function reactivar(req, res) {
  await tiposServiciosService.reactivar(req.params.id);
  res.redirect('/catalogo-servicios');
}

module.exports = { listar, mostrarNuevo, crear, mostrarEditar, actualizar, desactivar, reactivar };
