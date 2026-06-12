const mongoose = require('mongoose');
const { formatearTelefono, validarTelefono } = require('../utils/phone');

const prefijosPuesto = {
  mecanico: 'MEC',
  administrador: 'ADM',
  recepcionista: 'REC',
  ayudante: 'AYU',
  pintor: 'PIN',
  electricista: 'ELE',
  'servicio al cliente': 'SAC'
};

const puestos = ['Mecanico', 'Servicio al cliente', 'Administrador', 'Recepcionista', 'Ayudante', 'Pintor', 'Electricista'];
const puestosNormalizados = puestos.reduce((catalogo, puesto) => ({ ...catalogo, [normalizarTexto(puesto)]: puesto }), {});

const empleadoSchema = new mongoose.Schema({
  empleadoId: {
    type: String,
    required: [true, 'El ID del empleado es obligatorio'],
    unique: true,
    uppercase: true,
    trim: true
  },
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },
  apellidoPaterno: {
    type: String,
    required: [true, 'El apellido paterno es obligatorio'],
    trim: true
  },
  apellidoMaterno: {
    type: String,
    required: [true, 'El apellido materno es obligatorio'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El telefono es obligatorio'],
    validate: [validarTelefono, 'El telefono debe tener 10 numeros'],
    set: formatearTelefono,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'El email es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true
  },
  direccion: {
    type: String,
    trim: true
  },
  foto: {
    type: String,
    trim: true
  },
  fotoPublicId: {
    type: String,
    trim: true
  },
  puesto: {
    type: String,
    enum: puestos,
    required: [true, 'El puesto es obligatorio']
  },
  nominaBase: {
    type: Number,
    required: [true, 'La nomina base es obligatoria'],
    min: [0, 'La nomina base no puede ser negativa']
  },
  antiguedad: {
    type: Number,
    required: [true, 'La antiguedad es obligatoria'],
    min: [0, 'La antiguedad no puede ser negativa']
  },
  rfc: {
    type: String,
    required: [true, 'El RFC es obligatorio'],
    uppercase: true,
    trim: true
  },
  curp: {
    type: String,
    required: [true, 'La CURP es obligatoria'],
    uppercase: true,
    trim: true
  },
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },
  activo: {
    type: Boolean,
    default: true
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

empleadoSchema.virtual('nombreCompleto').get(function nombreCompleto() {
  return `${this.nombre} ${this.apellidoPaterno} ${this.apellidoMaterno}`;
});

empleadoSchema.set('toJSON', { virtuals: true });
empleadoSchema.set('toObject', { virtuals: true });

empleadoSchema.statics.obtenerPrefijoPuesto = function obtenerPrefijoPuesto(puesto) {
  const normalizado = normalizarTexto(puesto);
  return prefijosPuesto[normalizado] || normalizado.slice(0, 3).toUpperCase();
};

empleadoSchema.statics.normalizarPuesto = function normalizarPuesto(puesto) {
  return puestosNormalizados[normalizarTexto(puesto)] || puesto;
};

empleadoSchema.statics.generarEmpleadoId = async function generarEmpleadoId(puesto) {
  const prefijo = this.obtenerPrefijoPuesto(puesto);
  const empleados = await this.find({ empleadoId: new RegExp(`^${prefijo}-\\d{3}$`) }).select('empleadoId');
  const siguiente = empleados.reduce((maximo, empleado) => {
    const numero = Number(String(empleado.empleadoId).split('-')[1] || 0);
    return Math.max(maximo, numero);
  }, 0) + 1;

  return `${prefijo}-${String(siguiente).padStart(3, '0')}`;
};

empleadoSchema.pre('validate', async function asignarEmpleadoId() {
  if (this.puesto) {
    this.puesto = this.constructor.normalizarPuesto(this.puesto);
  }

  if (this.empleadoId) return;

  if (!this.puesto) return;

  this.empleadoId = await this.constructor.generarEmpleadoId(this.puesto);
});

empleadoSchema.statics.puestos = puestos;

function normalizarTexto(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

module.exports = mongoose.model('Empleado', empleadoSchema);
