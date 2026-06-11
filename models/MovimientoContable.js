const mongoose = require('mongoose');

const movimientoContableSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['Ingreso', 'Egreso'],
    required: [true, 'El tipo de movimiento es obligatorio']
  },
  categoria: {
    type: String,
    enum: ['Capital inicial', 'Orden de servicio', 'Compra refacciones', 'Nomina', 'Ajuste'],
    required: [true, 'La categoria es obligatoria']
  },
  concepto: {
    type: String,
    required: [true, 'El concepto es obligatorio'],
    trim: true
  },
  monto: {
    type: Number,
    required: [true, 'El monto es obligatorio'],
    min: [0, 'El monto no puede ser negativo']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    default: Date.now
  },
  referencia: {
    type: mongoose.Schema.Types.ObjectId
  },
  periodoNominaInicio: {
    type: String,
    trim: true
  },
  modoNomina: {
    type: String,
    enum: ['Manual', 'Automatica']
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

movimientoContableSchema.index(
  { categoria: 1, periodoNominaInicio: 1 },
  {
    unique: true,
    partialFilterExpression: {
      categoria: 'Nomina',
      periodoNominaInicio: { $exists: true, $type: 'string' }
    }
  }
);

module.exports = mongoose.model('MovimientoContable', movimientoContableSchema);
