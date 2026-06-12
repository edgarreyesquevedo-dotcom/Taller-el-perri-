const Servicio = require('../models/Servicio');
const Vehiculo = require('../models/Vehiculo');
const Empleado = require('../models/Empleado');
const Refaccion = require('../models/Refaccion');
const TipoServicio = require('../models/TipoServicio');
const { registrarMovimiento } = require('./contabilidad');
const { COSTO_SERVICIO, calcularSubtotalServicios } = require('../utils/servicePricing');

const estados = ['Pendiente', 'En proceso', 'Terminado'];

function cargarCatalogos() {
  return Promise.all([
    Vehiculo.find().sort({ placa: 1 }),
    Empleado.find({ puesto: 'Mecanico', activo: true }).sort({ apellidoPaterno: 1 }),
    Refaccion.find().sort({ nombre: 1 }),
    TipoServicio.find({ activo: true }).sort({ nombre: 1 })
  ]);
}

async function listar(query) {
  const filtro = construirFiltro(query);
  const orden = construirOrden(query);
  const [, , , tiposServicios] = await cargarCatalogos();
  const servicios = await Servicio.find(filtro)
    .populate('vehiculo')
    .populate('mecanico')
    .populate('refacciones.refaccion')
    .sort(orden);

  return { servicios, tiposServicios };
}

function buscarDetalle(id) {
  return Servicio.findById(id)
    .populate('vehiculo')
    .populate('mecanico')
    .populate('refacciones.refaccion');
}

function buscarPorId(id) {
  return Servicio.findById(id);
}

async function crear(body) {
  const servicio = await prepararServicio(body, false, 'Pendiente');
  await Servicio.validate(servicio);
  await validarStockDisponible(servicio.refacciones);
  await descontarStock(servicio.refacciones);
  return Servicio.create(servicio);
}

async function actualizar(id, body) {
  const anterior = await Servicio.findById(id);
  if (!anterior) return null;

  const servicio = await prepararServicio(body, true);
  await Servicio.validate(servicio);
  const ajuste = calcularAjusteStock(anterior.refacciones, servicio.refacciones);
  await validarStockDisponible(ajuste.consumir);
  await restaurarStock(ajuste.restaurar);
  await descontarStock(ajuste.consumir);
  const actualizada = await Servicio.findByIdAndUpdate(id, servicio, { runValidators: true, new: true });

  if (anterior.estado !== 'Terminado' && actualizada.estado === 'Terminado' && !anterior.ingresoRegistrado) {
    await registrarIngresoOrden(actualizada);
  }

  return actualizada;
}

async function prepararServicio(body, permiteProrroga, estadoForzado) {
  const ids = Array.isArray(body.refacciones) ? body.refacciones : body.refacciones ? [body.refacciones] : [];
  const tipos = Array.isArray(body.tipos) ? body.tipos : body.tipos ? [body.tipos] : body.tipo ? [body.tipo] : [];
  const tiposLimpios = tipos.map(tipo => tipo.trim()).filter(Boolean);
  if (tiposLimpios.length === 0) throw new Error('Selecciona al menos un servicio');

  const refacciones = ids
    .map(id => ({ refaccion: id, cantidad: Number(body[`cantidad_${id}`] || 1) }))
    .filter(item => item.refaccion && item.cantidad > 0);

  const fecha = body.fecha ? new Date(body.fecha) : new Date();
  const fechaEntrega = new Date(fecha);
  fechaEntrega.setDate(fechaEntrega.getDate() + 1);
  const prorrogaFecha = permiteProrroga && body.prorrogaFecha ? new Date(body.prorrogaFecha) : undefined;

  if (prorrogaFecha && prorrogaFecha <= fechaEntrega) {
    throw new Error('La prorroga debe ser posterior a la fecha maxima de entrega');
  }

  const costo = await calcularCostoOrden(refacciones, tiposLimpios.length);

  return {
    vehiculo: body.vehiculo,
    mecanico: body.mecanico,
    tipo: tiposLimpios.length > 1 ? 'Servicios varios' : tiposLimpios[0],
    tipos: tiposLimpios,
    descripcion: body.descripcion,
    costo,
    estado: estadoForzado || body.estado,
    fecha,
    fechaEntrega,
    prorrogaFecha,
    prorrogaMotivo: prorrogaFecha ? body.prorrogaMotivo : undefined,
    refacciones
  };
}

async function calcularCostoOrden(refacciones, cantidadServicios) {
  const piezas = await Refaccion.find({ _id: { $in: refacciones.map(item => item.refaccion) } });
  const subtotal = refacciones.reduce((total, item) => {
    const pieza = piezas.find(refaccion => String(refaccion._id) === String(item.refaccion));
    return total + ((pieza ? pieza.precio : 0) * item.cantidad);
  }, 0);

  return Number((subtotal + calcularSubtotalServicios(cantidadServicios)).toFixed(2));
}

async function validarStockDisponible(refacciones) {
  if (refacciones.length === 0) return;

  const piezas = await Refaccion.find({ _id: { $in: refacciones.map(item => item.refaccion) } });

  refacciones.forEach(item => {
    const pieza = piezas.find(refaccion => String(refaccion._id) === String(item.refaccion));
    const stock = pieza ? pieza.stock : 0;
    const nombre = pieza ? pieza.nombre : 'refaccion seleccionada';

    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) {
      throw new Error(`La cantidad de ${nombre} debe ser un numero entero mayor a 0`);
    }

    if (item.cantidad > stock) {
      throw new Error(`La cantidad de ${nombre} no puede ser mayor al stock disponible (${stock})`);
    }
  });
}

function construirFiltro(query) {
  const filtro = {};

  if (query.tipo) filtro.tipos = query.tipo;
  if (query.estado) {
    filtro.estado = query.estado;
  } else {
    filtro.estado = { $ne: 'Terminado' };
  }

  return filtro;
}

function construirOrden(query) {
  const direccionFecha = query.fecha === 'antiguos' ? 1 : -1;
  if (query.precio === 'menor') return { costo: 1, fecha: direccionFecha };
  return { costo: -1, fecha: direccionFecha };
}

async function registrarIngresoOrden(orden) {
  await registrarMovimiento({
    tipo: 'Ingreso',
    categoria: 'Orden de servicio',
    concepto: `Orden terminada ${orden.tipo}`,
    monto: orden.costo,
    fecha: new Date(),
    referencia: orden._id
  });
  await Servicio.findByIdAndUpdate(orden._id, { ingresoRegistrado: true });
}

async function descontarStock(refacciones) {
  const descontadas = [];

  try {
    for (const item of refacciones) {
      const resultado = await Refaccion.updateOne(
        { _id: item.refaccion, stock: { $gte: item.cantidad } },
        { $inc: { stock: -item.cantidad } }
      );

      if (resultado.modifiedCount === 0) {
        const refaccion = await Refaccion.findById(item.refaccion);
        const nombre = refaccion ? refaccion.nombre : 'refaccion seleccionada';
        const stock = refaccion ? refaccion.stock : 0;
        throw new Error(`Stock insuficiente para ${nombre}. Disponible: ${stock}`);
      }

      descontadas.push(item);
    }
  } catch (error) {
    await restaurarStock(descontadas);
    throw error;
  }
}

function restaurarStock(refacciones) {
  return Promise.all(refacciones.map(item => (
    Refaccion.findByIdAndUpdate(item.refaccion, { $inc: { stock: item.cantidad } })
  )));
}

function calcularAjusteStock(anteriores, nuevas) {
  const anteriorMap = agruparCantidades(anteriores);
  const nuevaMap = agruparCantidades(nuevas);
  const ids = new Set([...Object.keys(anteriorMap), ...Object.keys(nuevaMap)]);
  const restaurar = [];
  const consumir = [];

  ids.forEach(id => {
    const diferencia = (nuevaMap[id] || 0) - (anteriorMap[id] || 0);
    if (diferencia > 0) consumir.push({ refaccion: id, cantidad: diferencia });
    if (diferencia < 0) restaurar.push({ refaccion: id, cantidad: Math.abs(diferencia) });
  });

  return { restaurar, consumir };
}

function agruparCantidades(refacciones) {
  return refacciones.reduce((mapa, item) => {
    const id = String(item.refaccion && item.refaccion._id ? item.refaccion._id : item.refaccion);
    mapa[id] = (mapa[id] || 0) + item.cantidad;
    return mapa;
  }, {});
}

module.exports = {
  COSTO_SERVICIO,
  estados,
  listar,
  cargarCatalogos,
  buscarDetalle,
  buscarPorId,
  crear,
  actualizar
};
