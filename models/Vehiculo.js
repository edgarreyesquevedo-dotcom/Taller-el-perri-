const mongoose = require('mongoose');

const vehiculoSchema = new mongoose.Schema({
  placa: {
    type: String,
    required: [true, 'La placa es obligatoria'],
    unique: true,
    uppercase: true,
    trim: true
  },
  marca: {
    type: String,
    required: [true, 'La marca es obligatoria'],
    trim: true
  },
  modelo: {
    type: String,
    required: [true, 'El modelo es obligatorio'],
    trim: true
  },
  anio: {
    type: Number,
    required: [true, 'El anio es obligatorio'],
    min: [1900, 'El anio debe ser mayor o igual a 1900'],
    max: [new Date().getFullYear(), 'El anio no puede ser mayor al actual']
  },
  propietario: {
    type: String,
    required: [true, 'El propietario es obligatorio'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El telefono es obligatorio'],
    match: [/^672-\d{3}-\d{4}$/, 'El telefono debe tener el formato 672-xxx-xxxx'],
    trim: true
  },
  imagenes: [{
    type: String,
    trim: true
  }],
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Vehiculo', vehiculoSchema);
