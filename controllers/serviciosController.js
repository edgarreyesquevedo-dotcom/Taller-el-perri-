const serviciosService = require('../services/serviciosService');
const { exportarOrdenServicio } = require('../services/pdfService');

async function listar(req, res) {
  const { servicios, tiposServicios } = await serviciosService.listar(req.query);
  res.render('servicios/index', { titulo: 'Servicios', servicios, tiposServicios, estados: serviciosService.estados, filtros: req.query });
}

async function mostrarNuevo(req, res) {
  const [vehiculos, mecanicos, refacciones, tiposServicios] = await serviciosService.cargarCatalogos();
  res.render('servicios/nuevo', { titulo: 'Nueva orden de trabajo', servicio: { fecha: new Date() }, vehiculos, mecanicos, refacciones, tiposServicios, estados: serviciosService.estados, esEdicion: false, costoServicio: serviciosService.COSTO_SERVICIO });
}

async function crear(req, res) {
  try {
    await serviciosService.crear(req.body);
    res.redirect('/servicios');
  } catch (error) {
    const [vehiculos, mecanicos, refacciones, tiposServicios] = await serviciosService.cargarCatalogos();
    res.status(400).render('servicios/nuevo', { titulo: 'Nueva orden de trabajo', servicio: req.body, vehiculos, mecanicos, refacciones, tiposServicios, estados: serviciosService.estados, esEdicion: false, costoServicio: serviciosService.COSTO_SERVICIO, error: error.message || 'Revisa los datos del servicio' });
  }
}

async function exportarPdf(req, res) {
  const servicio = await serviciosService.buscarDetalle(req.params.id);
  if (!servicio) return res.redirect('/servicios');
  return exportarOrdenServicio(servicio, res);
}

async function mostrarDetalle(req, res) {
  const servicio = await serviciosService.buscarDetalle(req.params.id);
  if (!servicio) return res.redirect('/servicios');
  return res.render('servicios/detalle', { titulo: 'Detalle de orden', servicio });
}

async function mostrarEditar(req, res) {
  const [servicio, catalogos] = await Promise.all([
    serviciosService.buscarPorId(req.params.id),
    serviciosService.cargarCatalogos()
  ]);
  const [vehiculos, mecanicos, refacciones, tiposServicios] = catalogos;

  if (!servicio) return res.redirect('/servicios');
  return res.render('servicios/editar', { titulo: 'Editar orden de trabajo', servicio, vehiculos, mecanicos, refacciones, tiposServicios, estados: serviciosService.estados, esEdicion: true, costoServicio: serviciosService.COSTO_SERVICIO });
}

async function actualizar(req, res) {
  try {
    const actualizada = await serviciosService.actualizar(req.params.id, req.body);
    if (!actualizada) return res.redirect('/servicios');
    return res.redirect('/servicios');
  } catch (error) {
    const [vehiculos, mecanicos, refacciones, tiposServicios] = await serviciosService.cargarCatalogos();
    const servicio = { ...req.body, _id: req.params.id };
    return res.status(400).render('servicios/editar', { titulo: 'Editar orden de trabajo', servicio, vehiculos, mecanicos, refacciones, tiposServicios, estados: serviciosService.estados, esEdicion: true, costoServicio: serviciosService.COSTO_SERVICIO, error: error.message || 'No se pudo actualizar el servicio' });
  }
}

module.exports = { listar, mostrarNuevo, crear, exportarPdf, mostrarDetalle, mostrarEditar, actualizar };
