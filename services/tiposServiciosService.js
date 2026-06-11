const TipoServicio = require('../models/TipoServicio');
const { escaparRegex } = require('../utils/regex');

function listar() {
  return TipoServicio.find().sort({ activo: -1, nombre: 1 });
}

async function crear(body) {
  await validarNombreUnico(body.nombre);
  return TipoServicio.create({ ...body, activo: body.activo === 'on' });
}

function buscarPorId(id) {
  return TipoServicio.findById(id);
}

async function actualizar(id, body) {
  await validarNombreUnico(body.nombre, id);
  return TipoServicio.findByIdAndUpdate(
    id,
    { ...body, activo: body.activo === 'on' },
    { runValidators: true }
  );
}

function desactivar(id) {
  return TipoServicio.findByIdAndUpdate(id, { activo: false });
}

function reactivar(id) {
  return TipoServicio.findByIdAndUpdate(id, { activo: true });
}

async function validarNombreUnico(nombre, idActual) {
  const filtro = { nombre: new RegExp(`^${escaparRegex(nombre.trim())}$`, 'i') };
  if (idActual) filtro._id = { $ne: idActual };

  const existente = await TipoServicio.findOne(filtro);
  if (existente) throw new Error('Ya existe un servicio con ese nombre');
}

module.exports = { listar, crear, buscarPorId, actualizar, desactivar, reactivar };
