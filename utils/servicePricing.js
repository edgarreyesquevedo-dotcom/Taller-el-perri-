const COSTO_SERVICIO = 150;

function calcularSubtotalServicios(cantidadServicios) {
  return cantidadServicios * COSTO_SERVICIO;
}

module.exports = { COSTO_SERVICIO, calcularSubtotalServicios };
