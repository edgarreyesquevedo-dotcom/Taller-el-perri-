const MovimientoContable = require('../models/MovimientoContable');
const Empleado = require('../models/Empleado');

const MODO_NOMINA_MANUAL = 'Manual';
const MODO_NOMINA_AUTOMATICA = 'Automatica';

async function obtenerResumenContable() {
  const movimientos = await MovimientoContable.find().sort({ fecha: -1, creadoEn: -1 });
  const ingresos = movimientos
    .filter(movimiento => movimiento.tipo === 'Ingreso')
    .reduce((total, movimiento) => total + movimiento.monto, 0);
  const egresos = movimientos
    .filter(movimiento => movimiento.tipo === 'Egreso')
    .reduce((total, movimiento) => total + movimiento.monto, 0);

  return {
    movimientos,
    ingresos,
    egresos,
    balance: ingresos - egresos
  };
}

async function registrarMovimiento(datos) {
  return MovimientoContable.create(datos);
}

async function obtenerDashboard() {
  await ejecutarNominaAutomaticaSabatina();

  const [resumen, empleados] = await Promise.all([
    obtenerResumenContable(),
    Empleado.find({ activo: true }).sort({ apellidoPaterno: 1 })
  ]);
  const nominaSemanal = calcularNomina(empleados);
  const periodoNominaActual = obtenerPeriodoNomina(new Date());
  const nominaPagada = await obtenerNominaPagada(periodoNominaActual.clave);

  return { ...resumen, empleados, nominaSemanal, periodoNominaActual, nominaPagada };
}

async function pagarNomina(fecha) {
  return registrarPagoNomina({ fecha, modo: MODO_NOMINA_MANUAL, lanzarErrores: true });
}

async function ejecutarNominaAutomaticaSabatina(fecha = new Date()) {
  const fechaPago = normalizarFecha(fecha);
  if (fechaPago.getDay() !== 6) return null;

  try {
    return await registrarPagoNomina({ fecha: fechaPago, modo: MODO_NOMINA_AUTOMATICA, lanzarErrores: false });
  } catch (error) {
    console.error('No se pudo ejecutar la nomina automatica:', error.message);
    return null;
  }
}

async function registrarPagoNomina({ fecha, modo, lanzarErrores }) {
  const fechaPago = normalizarFecha(fecha);
  const periodoPago = obtenerPeriodoNomina(fechaPago);
  const periodoActual = obtenerPeriodoNomina(new Date());

  if (periodoPago.clave !== periodoActual.clave) {
    throw new Error('La nomina solo puede pagarse para la semana actual');
  }

  const nominaExistente = await obtenerNominaPagada(periodoPago.clave);
  if (nominaExistente) {
    if (!lanzarErrores) return null;
    throw new Error(`La nomina de esta semana ya fue pagada de forma ${String(nominaExistente.modoNomina || 'registrada').toLowerCase()}`);
  }

  const [resumen, empleados] = await Promise.all([
    obtenerResumenContable(),
    Empleado.find({ activo: true })
  ]);
  const totalNomina = calcularNomina(empleados);

  if (totalNomina <= 0) {
    const mensaje = 'No hay nomina activa por pagar';
    if (!lanzarErrores) {
      console.warn(mensaje);
      return null;
    }
    throw new Error(mensaje);
  }
  if (resumen.balance < totalNomina) {
    const mensaje = 'Balance insuficiente para pagar la nomina semanal';
    if (!lanzarErrores) {
      console.warn(mensaje);
      return null;
    }
    throw new Error(mensaje);
  }

  try {
    return await registrarMovimiento({
      tipo: 'Egreso',
      categoria: 'Nomina',
      concepto: `Pago semanal de nomina (${empleados.length} empleados)`,
      monto: totalNomina,
      fecha: fechaPago,
      periodoNominaInicio: periodoPago.clave,
      modoNomina: modo
    });
  } catch (error) {
    if (error && error.code === 11000) {
      throw new Error('La nomina de esta semana ya fue pagada');
    }

    throw error;
  }
}

async function obtenerNominaPagada(periodoNominaInicio) {
  return MovimientoContable.findOne({ categoria: 'Nomina', periodoNominaInicio });
}

async function obtenerReporteContable(filtro) {
  const movimientos = await MovimientoContable.find(filtro).sort({ fecha: -1, creadoEn: -1 });
  const total = movimientos.reduce((suma, movimiento) => suma + movimiento.monto, 0);

  return { movimientos, total };
}

function calcularNomina(empleados) {
  return empleados.reduce((total, empleado) => total + empleado.nominaBase, 0);
}

function obtenerPeriodoNomina(fecha) {
  const inicio = obtenerInicioSemana(fecha);

  return {
    clave: formatearFechaClave(inicio),
    inicio,
    fin: sumarDias(inicio, 6)
  };
}

function obtenerInicioSemana(fecha) {
  const base = normalizarFecha(fecha);
  const diaSemana = base.getDay();
  const diferenciaLunes = diaSemana === 0 ? -6 : 1 - diaSemana;

  return sumarDias(base, diferenciaLunes);
}

function sumarDias(fecha, dias) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

function normalizarFecha(value) {
  if (!value) return new Date();
  if (value instanceof Date) return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [anio, mes, dia] = value.split('-').map(Number);
    return new Date(anio, mes - 1, dia);
  }

  const fecha = new Date(value);
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

function formatearFechaClave(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

module.exports = {
  obtenerResumenContable,
  registrarMovimiento,
  obtenerDashboard,
  pagarNomina,
  ejecutarNominaAutomaticaSabatina,
  obtenerReporteContable,
  obtenerPeriodoNomina,
  calcularNomina
};
