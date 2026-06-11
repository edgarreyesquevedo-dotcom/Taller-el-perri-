const PDFDocument = require('pdfkit');
const { COSTO_SERVICIO, calcularSubtotalServicios } = require('../utils/servicePricing');

function exportarOrdenServicio(servicio, res) {
  const doc = new PDFDocument({ margin: 48 });
  const nombreArchivo = `orden-${servicio._id}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  doc.pipe(res);

  const cliente = servicio.vehiculo ? servicio.vehiculo.propietario : 'Cliente no disponible';
  const subtotalRefacciones = servicio.refacciones.reduce((total, item) => total + (item.refaccion ? item.refaccion.precio * item.cantidad : 0), 0);
  const subtotalServicios = calcularSubtotalServicios(servicio.tipos && servicio.tipos.length ? servicio.tipos.length : 1);

  doc.fontSize(22).text('TallerDB', { align: 'center' });
  doc.fontSize(10).text('RFC: TDB240101AB1 | Regimen fiscal: Personas Morales', { align: 'center' });
  doc.text('Direccion: Av. Principal 672, Col. Centro, Sinaloa, Mexico', { align: 'center' });
  doc.text('Telefono: 672-000-0000 | Email: facturacion@tallerdb.com', { align: 'center' });
  doc.moveDown();
  doc.fontSize(16).text('Orden de trabajo', { underline: true });
  doc.fontSize(11).text(`Folio: ${servicio._id}`);
  doc.text(`Cliente: ${cliente}`);
  doc.text(`Fecha registro: ${formatoFecha(servicio.fecha)}`);
  doc.text(`Fecha maxima entrega: ${formatoFecha(servicio.fechaEntrega)}`);
  if (servicio.prorrogaFecha) doc.text(`Prorroga autorizada: ${formatoFecha(servicio.prorrogaFecha)} - ${servicio.prorrogaMotivo || 'Sin motivo capturado'}`);
  doc.moveDown();

  doc.fontSize(13).text('Vehiculo', { underline: true });
  if (servicio.vehiculo) {
    doc.fontSize(11).text(`Placa: ${servicio.vehiculo.placa}`);
    doc.text(`Marca/modelo: ${servicio.vehiculo.marca} ${servicio.vehiculo.modelo} ${servicio.vehiculo.anio}`);
    doc.text(`Telefono cliente: ${servicio.vehiculo.telefono}`);
  }
  doc.moveDown();

  doc.fontSize(13).text('Servicios', { underline: true });
  (servicio.tipos && servicio.tipos.length ? servicio.tipos : [servicio.tipo]).forEach(tipo => {
    doc.fontSize(11).text(`- ${tipo}: $${formatoMoneda(COSTO_SERVICIO)}`);
  });
  doc.moveDown();

  doc.fontSize(13).text('Refacciones', { underline: true });
  if (!servicio.refacciones.length) {
    doc.fontSize(11).text('Sin refacciones registradas');
  } else {
    servicio.refacciones.forEach(item => {
      if (!item.refaccion) return;
      doc.fontSize(11).text(`- ${item.refaccion.nombre} (${item.refaccion.numeroPieza}) x${item.cantidad}: $${formatoMoneda(item.refaccion.precio * item.cantidad)}`);
    });
  }
  doc.moveDown();

  doc.fontSize(13).text('Totales', { underline: true });
  doc.fontSize(11).text(`Servicios: $${formatoMoneda(subtotalServicios)}`);
  doc.text(`Refacciones: $${formatoMoneda(subtotalRefacciones)}`);
  doc.fontSize(14).text(`Total: $${formatoMoneda(servicio.costo)}`);
  doc.moveDown();
  doc.fontSize(10).text('Este documento fue generado por TallerDB para control interno y entrega al cliente.');

  doc.end();
}

function exportarReporteContable({ titulo, nombreArchivo, movimientos, total }, res) {
  const doc = new PDFDocument({ margin: 48 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
  doc.pipe(res);

  doc.fontSize(22).text('TallerDB', { align: 'center' });
  doc.fontSize(16).text(titulo, { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Generado: ${formatoFecha(new Date())}`);
  doc.text(`Movimientos: ${movimientos.length}`);
  doc.fontSize(12).text(`Total: $${formatoMoneda(total)}`);
  doc.moveDown();

  if (!movimientos.length) {
    doc.fontSize(11).text('No hay movimientos para este reporte.');
    doc.end();
    return;
  }

  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Fecha', 48, doc.y, { width: 80, continued: true });
  doc.text('Tipo', { width: 70, continued: true });
  doc.text('Categoria', { width: 115, continued: true });
  doc.text('Monto', { width: 80, align: 'right', continued: true });
  doc.text('Concepto', { width: 170 });
  doc.font('Helvetica');
  doc.moveTo(48, doc.y + 4).lineTo(564, doc.y + 4).stroke();
  doc.moveDown();

  movimientos.forEach(movimiento => {
    if (doc.y > 720) {
      doc.addPage();
    }

    const y = doc.y;
    doc.text(formatoFecha(movimiento.fecha), 48, y, { width: 80 });
    doc.text(movimiento.tipo, 128, y, { width: 70 });
    doc.text(movimiento.categoria, 198, y, { width: 115 });
    doc.text(`$${formatoMoneda(movimiento.monto)}`, 313, y, { width: 80, align: 'right' });
    doc.text(movimiento.concepto, 403, y, { width: 160 });
    doc.moveDown(0.8);
  });

  doc.moveDown();
  doc.font('Helvetica-Bold').fontSize(12).text(`Total del reporte: $${formatoMoneda(total)}`, { align: 'right' });
  doc.end();
}

function formatoFecha(value) {
  if (!value) return 'No capturada';
  return new Date(value).toLocaleDateString('es-MX');
}

function formatoMoneda(value) {
  return Number(value || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

module.exports = { exportarOrdenServicio, exportarReporteContable };
