require('dotenv').config();

const dns = require('dns');
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');
const Vehiculo = require('./models/Vehiculo');
const Servicio = require('./models/Servicio');
const Empleado = require('./models/Empleado');
const Refaccion = require('./models/Refaccion');
const TipoServicio = require('./models/TipoServicio');
const MovimientoContable = require('./models/MovimientoContable');

// Evita fallos de resolucion SRV de Atlas cuando el DNS local no responde bien.
dns.setServers(['8.8.8.8', '1.1.1.1']);

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('Falta MONGODB_URI en el archivo .env');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  await Promise.all([
    Usuario.deleteMany({}),
    Vehiculo.deleteMany({}),
    Servicio.deleteMany({}),
    Empleado.deleteMany({}),
    Refaccion.deleteMany({}),
    TipoServicio.deleteMany({}),
    MovimientoContable.deleteMany({})
  ]);

  await MovimientoContable.create({
    tipo: 'Ingreso',
    categoria: 'Capital inicial',
    concepto: 'Capital inicial de la cuenta del taller',
    monto: 10000,
    fecha: new Date()
  });

  await Usuario.create({
    nombre: 'Usuario Demo',
    email: 'demo@demo.com',
    password: 'Demo1234'
  });

  const vehiculos = await Vehiculo.insertMany([
    { placa: 'ABC-123', marca: 'Toyota', modelo: 'Corolla', anio: 2018, propietario: 'Laura Gomez', telefono: '672-111-2233' },
    { placa: 'DEF-456', marca: 'Chevrolet', modelo: 'Onix', anio: 2021, propietario: 'Carlos Ruiz', telefono: '672-222-3344' },
    { placa: 'GHI-789', marca: 'Mazda', modelo: 'CX-5', anio: 2020, propietario: 'Paula Rios', telefono: '672-333-4455' },
    { placa: 'JKL-012', marca: 'Renault', modelo: 'Duster', anio: 2017, propietario: 'Andres Mora', telefono: '672-444-5566' }
  ]);

  const empleados = await Empleado.insertMany([
    {
      empleadoId: 'MEC-001',
      nombre: 'Roberto',
      apellidoPaterno: 'Santos',
      apellidoMaterno: 'Lopez',
      telefono: '672-555-1100',
      email: 'roberto.santos@tallerdb.com',
      puesto: 'Mecanico',
      nominaBase: 2500,
      antiguedad: 6,
      rfc: 'SALR850412AA1',
      curp: 'SALR850412HDFNPS09',
      fechaNacimiento: new Date('1985-04-12'),
      activo: true
    },
    {
      empleadoId: 'MEC-002',
      nombre: 'Mariana',
      apellidoPaterno: 'Torres',
      apellidoMaterno: 'Diaz',
      telefono: '672-555-2200',
      email: 'mariana.torres@tallerdb.com',
      puesto: 'Mecanico',
      nominaBase: 2800,
      antiguedad: 4,
      rfc: 'TODM900818BB2',
      curp: 'TODM900818MDFRZR08',
      fechaNacimiento: new Date('1990-08-18'),
      activo: true
    },
    {
      empleadoId: 'SAC-001',
      nombre: 'Elena',
      apellidoPaterno: 'Vargas',
      apellidoMaterno: 'Mora',
      telefono: '672-555-3300',
      email: 'elena.vargas@tallerdb.com',
      puesto: 'Servicio al cliente',
      nominaBase: 2200,
      antiguedad: 3,
      rfc: 'VAME920221CC3',
      curp: 'VAME920221MDFRRL07',
      fechaNacimiento: new Date('1992-02-21'),
      activo: true
    },
    {
      empleadoId: 'SAC-002',
      nombre: 'Diego',
      apellidoPaterno: 'Ramos',
      apellidoMaterno: 'Nunez',
      telefono: '672-555-4400',
      email: 'diego.ramos@tallerdb.com',
      puesto: 'Servicio al cliente',
      nominaBase: 2100,
      antiguedad: 1,
      rfc: 'RAND960705DD4',
      curp: 'RAND960705HDFMZG05',
      fechaNacimiento: new Date('1996-07-05'),
      activo: true
    }
  ]);

  const refacciones = await Refaccion.insertMany([
    { nombre: 'Filtro de aceite', numeroPieza: 'FLT-001', categoria: 'Filtros', precio: 45.00, stock: 18 },
    { nombre: 'Pastillas de freno delanteras', numeroPieza: 'FRN-210', categoria: 'Balatas', precio: 160.00, stock: 8 },
    { nombre: 'Bateria 12V', numeroPieza: 'BAT-700', categoria: 'Baterias', precio: 340.00, stock: 5 },
    { nombre: 'Amortiguador delantero', numeroPieza: 'SUS-332', categoria: 'Suspension', precio: 220.00, stock: 6 },
    { nombre: 'Bujia iridium', numeroPieza: 'ENC-044', categoria: 'Bujias', precio: 38.00, stock: 24 },
    { nombre: 'Aceite sintetico 5W-30', numeroPieza: 'ACE-530', categoria: 'Aceites', precio: 72.00, stock: 20 }
  ]);

  await TipoServicio.insertMany([
    { nombre: 'Alineacion', descripcion: 'Ajuste de geometria de ruedas para corregir direccion y desgaste.', activo: true },
    { nombre: 'Chequeo mecanico', descripcion: 'Chequeo general de sistemas mecanicos con trabajo de mecanico.', activo: true },
    { nombre: 'Desponche', descripcion: 'Reparacion de llanta ponchada y montaje seguro.', activo: true },
    { nombre: 'Balanceo de ruedas', descripcion: 'Balanceo para reducir vibraciones y mejorar estabilidad.', activo: true },
    { nombre: 'Cambio de aceite', descripcion: 'Cambio de aceite, filtro y verificacion de niveles.', activo: true },
    { nombre: 'Frenos', descripcion: 'Trabajo en balatas, discos, tambores o sistema de frenado.', activo: true },
    { nombre: 'Suspension', descripcion: 'Trabajo en amortiguadores, bujes y componentes de suspension.', activo: true },
    { nombre: 'Cambio de bateria', descripcion: 'Sustitucion, prueba y ajuste de bateria.', activo: true },
    { nombre: 'Afinacion', descripcion: 'Servicio de afinacion con cambio de piezas de desgaste.', activo: true },
    { nombre: 'Cambio de bujias', descripcion: 'Sustitucion de bujias y validacion de encendido.', activo: true }
  ]);

  const ordenes = [
    { vehiculo: vehiculos[0]._id, mecanico: empleados[0]._id, refacciones: [{ refaccion: refacciones[0]._id, cantidad: 1 }, { refaccion: refacciones[5]._id, cantidad: 4 }], tipo: 'Servicios varios', tipos: ['Cambio de aceite', 'Afinacion'], descripcion: 'Aceite sintetico, filtro nuevo y afinacion.', estado: 'Terminado', fecha: new Date('2026-01-10') },
    { vehiculo: vehiculos[0]._id, mecanico: empleados[1]._id, refacciones: [{ refaccion: refacciones[1]._id, cantidad: 1 }], tipo: 'Frenos', tipos: ['Frenos'], descripcion: 'Cambio de pastillas delanteras.', estado: 'En proceso', fecha: new Date('2026-01-18') },
    { vehiculo: vehiculos[1]._id, mecanico: empleados[0]._id, refacciones: [], tipo: 'Chequeo mecanico', tipos: ['Chequeo mecanico'], descripcion: 'Chequeo general por testigo de motor.', estado: 'Pendiente', fecha: new Date('2026-01-20') },
    { vehiculo: vehiculos[2]._id, mecanico: empleados[1]._id, refacciones: [], tipo: 'Servicios varios', tipos: ['Alineacion', 'Balanceo de ruedas'], descripcion: 'Alineacion y balanceo de cuatro ruedas.', estado: 'Terminado', fecha: new Date('2026-01-12') },
    { vehiculo: vehiculos[3]._id, mecanico: empleados[0]._id, refacciones: [{ refaccion: refacciones[2]._id, cantidad: 1 }], tipo: 'Cambio de bateria', tipos: ['Cambio de bateria'], descripcion: 'Prueba de carga y reemplazo de bateria.', estado: 'Terminado', fecha: new Date('2026-01-16') },
    { vehiculo: vehiculos[2]._id, mecanico: empleados[1]._id, refacciones: [{ refaccion: refacciones[3]._id, cantidad: 2 }], tipo: 'Suspension', tipos: ['Suspension'], descripcion: 'Cambio de amortiguadores y bujes.', estado: 'Pendiente', fecha: new Date('2026-01-22') }
  ].map(orden => {
    const fechaEntrega = new Date(orden.fecha);
    fechaEntrega.setDate(fechaEntrega.getDate() + 1);
    return {
      ...orden,
      fechaEntrega,
      costo: calcularCostoOrden(orden.refacciones, refacciones, orden.tipos.length)
    };
  });

  await Servicio.insertMany(ordenes);
  await Promise.all(ordenes.flatMap(orden => orden.refacciones.map(item => (
    Refaccion.findByIdAndUpdate(item.refaccion, { $inc: { stock: -item.cantidad } })
  ))));

  await mongoose.disconnect();
  console.log('✅ Seed completado');
}

seed().catch(async error => {
  console.error('Error al ejecutar seed:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});

function calcularCostoOrden(refaccionesOrden, catalogo, cantidadServicios) {
  const subtotal = refaccionesOrden.reduce((total, item) => {
    const refaccion = catalogo.find(pieza => String(pieza._id) === String(item.refaccion));
    return total + ((refaccion ? refaccion.precio : 0) * item.cantidad);
  }, 0);

  return Number((subtotal + (cantidadServicios * 150)).toFixed(2));
}
