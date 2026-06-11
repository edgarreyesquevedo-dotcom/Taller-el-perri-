const Empleado = require('../models/Empleado');
const { rutaFotoEmpleado, publicIdFotoEmpleado } = require('../utils/uploads');

const puestos = Empleado.puestos;

function listar() {
  return Empleado.find().sort({ activo: -1, puesto: 1, apellidoPaterno: 1 });
}

function crear(body, file) {
  return Empleado.create({
    ...body,
    foto: rutaFotoEmpleado(file),
    fotoPublicId: publicIdFotoEmpleado(file),
    antiguedad: 0,
    activo: body.activo === 'on'
  });
}

function buscarPorId(id) {
  return Empleado.findById(id);
}

async function actualizar(id, body, file) {
  const empleado = await Empleado.findById(id).select('foto fotoPublicId');
  const foto = rutaFotoEmpleado(file) || (empleado ? empleado.foto : undefined);
  const fotoPublicId = publicIdFotoEmpleado(file) || (empleado ? empleado.fotoPublicId : undefined);

  return Empleado.findByIdAndUpdate(
    id,
    { ...body, foto, fotoPublicId, puesto: Empleado.normalizarPuesto(body.puesto), activo: body.activo === 'on' },
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
