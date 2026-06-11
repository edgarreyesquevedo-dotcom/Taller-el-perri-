const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  vehiculo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo',
    required: [true, 'El vehiculo es obligatorio']
  },
  mecanico: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Empleado',
    required: [true, 'El mecanico es obligatorio']
  },
  refacciones: [{
    refaccion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Refaccion',
      required: true
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  tipo: {
    type: String,
    required: [true, 'El tipo de servicio es obligatorio'],
    trim: true
  },
  tipos: [{
    type: String,
    trim: true
  }],
  descripcion: {
    type: String,
    required: [true, 'La descripcion es obligatoria'],
    trim: true
  },
  costo: {
    type: Number,
    required: [true, 'El costo es obligatorio'],
    min: [0, 'El costo no puede ser negativo']
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'En proceso', 'Terminado'],
    default: 'Pendiente'
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },
  fechaEntrega: {
    type: Date,
    required: [true, 'La fecha de entrega es obligatoria']
  },
  prorrogaFecha: {
    type: Date
  },
  prorrogaMotivo: {
    type: String,
    trim: true
  },
  ingresoRegistrado: {
    type: Boolean,
    default: false
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Servicio', servicioSchema);
