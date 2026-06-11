const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'vehiculos');

fs.mkdirSync(uploadDir, { recursive: true });

const uploadVehiculos = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo se permiten imagenes'));
    return cb(null, true);
  },
  limits: { fileSize: 4 * 1024 * 1024 }
});

function rutasImagenes(files = []) {
  return files.map(file => `/uploads/vehiculos/${file.filename}`);
}

module.exports = { uploadVehiculos, rutasImagenes };
