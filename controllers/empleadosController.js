const empleadosService = require('../services/empleadosService');

async function listar(req, res) {
  const empleados = await empleadosService.listar();
  res.render('empleados/index', { titulo: 'Empleados', empleados });
}

function mostrarNuevo(req, res) {
  res.render('empleados/nuevo', { titulo: 'Nuevo empleado', empleado: { activo: true, creadoEn: new Date() }, puestos: empleadosService.puestos });
}

async function crear(req, res) {
  try {
    await empleadosService.crear(req.body, req.file);
    res.redirect('/empleados');
  } catch (error) {
    const mensaje = error.code === 11000 ? 'El email del empleado ya existe' : 'Revisa los datos del empleado';
    res.status(400).render('empleados/nuevo', { titulo: 'Nuevo empleado', empleado: req.body, puestos: empleadosService.puestos, error: mensaje });
  }
}

async function mostrarEditar(req, res) {
  const empleado = await empleadosService.buscarPorId(req.params.id);
  if (!empleado) return res.redirect('/empleados');
  return res.render('empleados/editar', { titulo: 'Editar empleado', empleado, puestos: empleadosService.puestos });
}

async function actualizar(req, res) {
  try {
    await empleadosService.actualizar(req.params.id, req.body, req.file);
    res.redirect('/empleados');
  } catch (error) {
    const empleado = { ...req.body, _id: req.params.id, activo: req.body.activo === 'on', creadoEn: new Date() };
    res.status(400).render('empleados/editar', { titulo: 'Editar empleado', empleado, puestos: empleadosService.puestos, error: 'No se pudo actualizar el empleado' });
  }
}

async function darDeBaja(req, res) {
  await empleadosService.darDeBaja(req.params.id);
  res.redirect('/empleados');
}

async function reactivar(req, res) {
  await empleadosService.reactivar(req.params.id);
  res.redirect('/empleados');
}

module.exports = { listar, mostrarNuevo, crear, mostrarEditar, actualizar, darDeBaja, reactivar };
