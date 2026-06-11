const contabilidadService = require('../services/contabilidad');
const { exportarReporteContable } = require('../services/pdfService');

async function mostrarDashboard(req, res) {
  const dashboard = await contabilidadService.obtenerDashboard();
  res.render('contabilidad/index', {
    titulo: 'Contabilidad',
    ...dashboard,
    hoy: new Date()
  });
}

async function pagarNomina(req, res) {
  try {
    await contabilidadService.pagarNomina(req.body.fecha);
    res.redirect('/contabilidad');
  } catch (error) {
    const dashboard = await contabilidadService.obtenerDashboard();
    res.status(400).render('contabilidad/index', {
      titulo: 'Contabilidad',
      ...dashboard,
      hoy: new Date(),
      error: error.message
    });
  }
}

async function exportarNominaPdf(req, res) {
  const reporte = await contabilidadService.obtenerReporteContable({ categoria: 'Nomina' });
  return exportarReporteContable({
    titulo: 'Reporte de nomina',
    nombreArchivo: 'reporte-nomina.pdf',
    ...reporte
  }, res);
}

async function exportarEgresosPdf(req, res) {
  const reporte = await contabilidadService.obtenerReporteContable({ tipo: 'Egreso' });
  return exportarReporteContable({
    titulo: 'Reporte de egresos',
    nombreArchivo: 'reporte-egresos.pdf',
    ...reporte
  }, res);
}

async function exportarIngresosPdf(req, res) {
  const reporte = await contabilidadService.obtenerReporteContable({ tipo: 'Ingreso' });
  return exportarReporteContable({
    titulo: 'Reporte de ingresos',
    nombreArchivo: 'reporte-ingresos.pdf',
    ...reporte
  }, res);
}

module.exports = { mostrarDashboard, pagarNomina, exportarNominaPdf, exportarEgresosPdf, exportarIngresosPdf };
