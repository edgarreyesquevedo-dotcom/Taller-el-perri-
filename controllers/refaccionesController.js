const refaccionesService = require('../services/refaccionesService');

async function listar(req, res) {
  const { refacciones, filtros } = await refaccionesService.listar(req.query);
  res.render('refacciones/index', { titulo: 'Catalogo de refacciones', refacciones, filtros, categorias: refaccionesService.categorias });
}

function mostrarNuevo(req, res) {
  res.render('refacciones/nuevo', { titulo: 'Nueva refaccion', refaccion: {}, categorias: refaccionesService.categorias });
}

async function mostrarOrden(req, res) {
  const [refacciones, resumen] = await refaccionesService.listarParaOrden();
  res.render('refacciones/orden', { titulo: 'Orden de refacciones', refacciones, balance: resumen.balance, orden: {}, categorias: refaccionesService.categorias });
}

async function comprar(req, res) {
  try {
    await refaccionesService.comprar(req.body);
    res.redirect('/contabilidad');
  } catch (error) {
    const [refacciones, resumen] = await refaccionesService.listarParaOrden();
    res.status(400).render('refacciones/orden', {
      titulo: 'Orden de refacciones',
      refacciones,
      balance: resumen.balance,
      orden: req.body,
      categorias: refaccionesService.categorias,
      error: error.message
    });
  }
}

async function crear(req, res) {
  try {
    await refaccionesService.crear(req.body);
    res.redirect('/refacciones');
  } catch (error) {
    const mensaje = error.code === 11000 ? 'Ya existe una refaccion con ese nombre o numero de pieza' : error.message || 'Revisa los datos de la refaccion';
    res.status(400).render('refacciones/nuevo', { titulo: 'Nueva refaccion', refaccion: req.body, categorias: refaccionesService.categorias, error: mensaje });
  }
}

async function mostrarEditar(req, res) {
  const refaccion = await refaccionesService.buscarPorId(req.params.id);
  if (!refaccion) return res.redirect('/refacciones');
  return res.render('refacciones/editar', { titulo: 'Editar refaccion', refaccion, categorias: refaccionesService.categorias });
}

async function actualizar(req, res) {
  try {
    await refaccionesService.actualizar(req.params.id, req.body);
    res.redirect('/refacciones');
  } catch (error) {
    const refaccion = { ...req.body, _id: req.params.id };
    const mensaje = error.code === 11000 ? 'Ya existe una refaccion con ese nombre o numero de pieza' : 'No se pudo actualizar la refaccion';
    res.status(400).render('refacciones/editar', { titulo: 'Editar refaccion', refaccion, categorias: refaccionesService.categorias, error: mensaje });
  }
}

async function eliminar(req, res) {
  try {
    await refaccionesService.eliminar(req.params.id);
    res.redirect('/refacciones');
  } catch (error) {
    const { refacciones, filtros } = await refaccionesService.listar(req.query);
    res.status(400).render('refacciones/index', {
      titulo: 'Catalogo de refacciones',
      refacciones,
      filtros,
      categorias: refaccionesService.categorias,
      error: error.message
    });
  }
}

module.exports = { listar, mostrarNuevo, mostrarOrden, comprar, crear, mostrarEditar, actualizar, eliminar };
