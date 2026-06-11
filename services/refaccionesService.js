const Refaccion = require('../models/Refaccion');
const { obtenerResumenContable, registrarMovimiento } = require('./contabilidad');
const { escaparRegex } = require('../utils/regex');

const categorias = Refaccion.categorias;

async function listar(query) {
  const filtros = prepararFiltros(query);
  const refacciones = await Refaccion.find(filtros.consulta).sort(filtros.ordenamiento);
  return { refacciones, filtros: filtros.valores };
}

function listarParaOrden() {
  return Promise.all([
    Refaccion.find().sort({ nombre: 1 }),
    obtenerResumenContable()
  ]);
}

async function comprar(body) {
  const compra = prepararCompra(body);
  const resumen = await obtenerResumenContable();

  validarCompra(compra);
  if (compra.total <= 0) throw new Error('Agrega al menos una refaccion a la orden');
  if (resumen.balance < compra.total) throw new Error('Balance insuficiente para realizar la compra');

  if (compra.existente.refaccion) {
    await Refaccion.findByIdAndUpdate(compra.existente.refaccion, {
      $inc: { stock: compra.existente.cantidad },
      $set: { precio: calcularPrecioVenta(compra.existente.costoUnitario) }
    });
  }

  if (compra.nueva.nombre) {
    await validarRefaccionUnica(compra.nueva);
    await Refaccion.create({
      nombre: compra.nueva.nombre,
      numeroPieza: compra.nueva.numeroPieza,
      categoria: Refaccion.normalizarCategoria(compra.nueva.categoria),
      precio: calcularPrecioVenta(compra.nueva.costoUnitario),
      stock: compra.nueva.cantidad
    });
  }

  return registrarMovimiento({
    tipo: 'Egreso',
    categoria: 'Compra refacciones',
    concepto: compra.concepto,
    monto: compra.total,
    fecha: body.fecha || new Date()
  });
}

async function crear(body) {
  const datos = prepararRefaccion(body);
  await validarRefaccionUnica(datos);
  return Refaccion.create(datos);
}

function buscarPorId(id) {
  return Refaccion.findById(id);
}

async function actualizar(id, body) {
  const datos = prepararRefaccion(body);
  await validarRefaccionUnica(datos, id);
  return Refaccion.findByIdAndUpdate(id, datos, { runValidators: true });
}

function eliminar(id) {
  return Refaccion.findByIdAndDelete(id);
}

async function validarRefaccionUnica(body, idActual) {
  const filtro = {
    $or: [
      { nombre: new RegExp(`^${escaparRegex(body.nombre.trim())}$`, 'i') },
      { numeroPieza: body.numeroPieza.trim().toUpperCase() }
    ]
  };

  if (idActual) filtro._id = { $ne: idActual };

  const existente = await Refaccion.findOne(filtro);
  if (existente) {
    throw new Error('Ya existe una refaccion con ese nombre o numero de pieza');
  }
}

function prepararFiltros(query) {
  const categoria = Refaccion.normalizarCategoria(query.categoria);
  const valores = {
    q: String(query.q || '').trim(),
    stock: query.stock === 'bajo' ? 'bajo' : '',
    orden: query.orden === 'precio_desc' ? 'precio_desc' : '',
    categoria: categorias.includes(categoria) ? categoria : ''
  };
  const consulta = {};

  if (valores.q) {
    const busqueda = new RegExp(escaparRegex(valores.q), 'i');
    const categoriaBuscada = Refaccion.normalizarCategoria(valores.q);
    consulta.$or = [{ nombre: busqueda }, { numeroPieza: busqueda }, { categoria: busqueda }];
    if (categorias.includes(categoriaBuscada)) consulta.$or.push({ categoria: categoriaBuscada });
  }

  if (valores.stock === 'bajo') consulta.stock = { $lte: 10 };
  if (valores.categoria) consulta.categoria = valores.categoria;

  return {
    valores,
    consulta,
    ordenamiento: valores.orden === 'precio_desc' ? { precio: -1, nombre: 1 } : { nombre: 1 }
  };
}

function prepararRefaccion(body) {
  return {
    ...body,
    categoria: Refaccion.normalizarCategoria(body.categoria)
  };
}

function prepararCompra(body) {
  const existenteCantidad = Number(body.existenteCantidad || 0);
  const existenteCosto = Number(body.existenteCosto || 0);
  const nuevaCantidad = Number(body.nuevaCantidad || 0);
  const nuevaCosto = Number(body.nuevaCosto || 0);
  const existenteTotal = body.refaccionExistente ? existenteCantidad * existenteCosto : 0;
  const nuevaTotal = body.nuevoNombre ? nuevaCantidad * nuevaCosto : 0;
  const partes = [];

  if (body.refaccionExistente) partes.push(`Stock refaccion existente x${existenteCantidad}`);
  if (body.nuevoNombre) partes.push(`Nueva refaccion ${body.nuevoNombre} x${nuevaCantidad}`);

  return {
    existente: {
      refaccion: body.refaccionExistente,
      cantidad: existenteCantidad,
      costoUnitario: existenteCosto
    },
    nueva: {
      nombre: body.nuevoNombre,
      numeroPieza: body.nuevoNumeroPieza,
      categoria: body.nuevoCategoria,
      cantidad: nuevaCantidad,
      costoUnitario: nuevaCosto
    },
    total: Number((existenteTotal + nuevaTotal).toFixed(2)),
    concepto: partes.length ? `Orden de refacciones: ${partes.join(' + ')}` : 'Orden de refacciones'
  };
}

function validarCompra(compra) {
  if (compra.existente.refaccion && (compra.existente.cantidad <= 0 || compra.existente.costoUnitario <= 0)) {
    throw new Error('La refaccion existente necesita cantidad y costo unitario mayores a 0');
  }

  if (compra.nueva.nombre) {
    if (!compra.nueva.numeroPieza || !compra.nueva.categoria || compra.nueva.cantidad <= 0 || compra.nueva.costoUnitario <= 0) {
      throw new Error('La nueva refaccion necesita numero de pieza, categoria, cantidad y costo de compra');
    }
  }
}

function calcularPrecioVenta(costoCompra) {
  return Number((Number(costoCompra || 0) * 1.2).toFixed(2));
}

module.exports = { categorias, listar, listarParaOrden, comprar, crear, buscarPorId, actualizar, eliminar };
