const mongoose = require('mongoose');

const categoriasRefaccion = ['Suspension', 'Aceites', 'Bujias', 'Balatas', 'Llantas', 'Rines', 'Filtros', 'Baterias', 'Frenos', 'Electrico', 'Otros'];
const categoriasNormalizadas = categoriasRefaccion.reduce((catalogo, categoria) => ({ ...catalogo, [normalizarTexto(categoria)]: categoria }), {});

const refaccionSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    unique: true,
    trim: true
  },
  numeroPieza: {
    type: String,
    required: [true, 'El numero de pieza es obligatorio'],
    unique: true,
    uppercase: true,
    trim: true
  },
  categoria: {
    type: String,
    enum: categoriasRefaccion,
    required: [true, 'La categoria es obligatoria'],
    default: 'Otros'
  },
  precio: {
    type: Number,
    required: [true, 'El precio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es obligatorio'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  creadoEn: {
    type: Date,
    default: Date.now
  }
});

refaccionSchema.statics.categorias = categoriasRefaccion;
refaccionSchema.statics.normalizarCategoria = function normalizarCategoria(categoria) {
  return categoriasNormalizadas[normalizarTexto(categoria)] || categoria;
};

function normalizarTexto(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

module.exports = mongoose.model('Refaccion', refaccionSchema);
