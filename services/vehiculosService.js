const Vehiculo = require('../models/Vehiculo');
const Servicio = require('../models/Servicio');
const { rutasImagenes } = require('../utils/uploads');

async function listarVisibles() {
  const [vehiculos, servicios] = await Promise.all([
    Vehiculo.find().sort({ creadoEn: -1 }),
    Servicio.find().select('vehiculo estado')
  ]);

  return vehiculos.filter(vehiculo => {
    const ordenes = servicios.filter(servicio => String(servicio.vehiculo) === String(vehiculo._id));
    if (ordenes.length === 0) return true;
    return ordenes.some(orden => orden.estado !== 'Terminado');
  });
}

function crear(datos, files) {
  return Vehiculo.create({ ...datos, imagenes: rutasImagenes(files) });
}

function buscarPorId(id) {
  return Vehiculo.findById(id);
}

async function actualizar(id, datos, files) {
  const vehiculo = await Vehiculo.findById(id);
  const imagenes = [...(vehiculo ? vehiculo.imagenes : []), ...rutasImagenes(files)];
  return Vehiculo.findByIdAndUpdate(id, { ...datos, imagenes }, { runValidators: true });
}

async function eliminar(id) {
  const ordenesAsociadas = await Servicio.countDocuments({ vehiculo: id });
  if (ordenesAsociadas > 0) {
    throw new Error('No se puede eliminar un vehiculo con ordenes de servicio asociadas');
  }

  return Vehiculo.findByIdAndDelete(id);
}

module.exports = { listarVisibles, crear, buscarPorId, actualizar, eliminar };
