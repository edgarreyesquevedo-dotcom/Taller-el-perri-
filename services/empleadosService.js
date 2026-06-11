const Empleado = require('../models/Empleado');

const puestos = Empleado.puestos;

function listar() {
  return Empleado.find().sort({ activo: -1, puesto: 1, apellidoPaterno: 1 });
}

function crear(body) {
  return Empleado.create({ ...body, antiguedad: 0, activo: body.activo === 'on' });
}

function buscarPorId(id) {
  return Empleado.findById(id);
}

function actualizar(id, body) {
  return Empleado.findByIdAndUpdate(
    id,
    { ...body, puesto: Empleado.normalizarPuesto(body.puesto), activo: body.activo === 'on' },
    { runValidators: true }
  );
}

function darDeBaja(id) {
  return Empleado.findByIdAndUpdate(id, { activo: false });
}

function reactivar(id) {
  return Empleado.findByIdAndUpdate(id, { activo: true });
}

module.exports = { puestos, listar, crear, buscarPorId, actualizar, darDeBaja, reactivar };
