const fs = require('fs');
const os = require('os');
const path = require('path');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, hasCloudinaryConfig } = require('./cloudinary');

const isVercel = process.env.VERCEL === '1';
const uploadBaseDir = isVercel ? os.tmpdir() : path.join(__dirname, '..', 'public', 'uploads');
const uploadDir = path.join(uploadBaseDir, 'vehiculos');
const empleadosUploadDir = path.join(uploadBaseDir, 'empleados');

fs.mkdirSync(uploadDir, { recursive: true });
fs.mkdirSync(empleadosUploadDir, { recursive: true });

function crearUploadImagen(destination, cloudinaryFolder) {
  const storage = hasCloudinaryConfig()
    ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: cloudinaryFolder,
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif']
      }
    })
    : multer.diskStorage({
      destination,
      filename: (req, file, cb) => {
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
      }
    });

  return multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) return cb(new Error('Solo se permiten imagenes'));
      return cb(null, true);
    },
    limits: { fileSize: 4 * 1024 * 1024 }
  });
}

const uploadVehiculos = crearUploadImagen(uploadDir, 'tallerdb/vehiculos');
const uploadEmpleados = crearUploadImagen(empleadosUploadDir, 'tallerdb/empleados');

function rutasImagenes(files = []) {
  return files.map(file => (esArchivoCloudinary(file) ? file.path : `/uploads/vehiculos/${file.filename}`));
}

function publicIdsImagenes(files = []) {
  return files.map(file => (esArchivoCloudinary(file) ? file.filename : undefined)).filter(Boolean);
}

function rutaFotoEmpleado(file) {
  if (!file) return undefined;
  return esArchivoCloudinary(file) ? file.path : `/uploads/empleados/${file.filename}`;
}

function publicIdFotoEmpleado(file) {
  return esArchivoCloudinary(file) && file.filename ? file.filename : undefined;
}

function esArchivoCloudinary(file) {
  return Boolean(file && typeof file.path === 'string' && /^https?:\/\//.test(file.path));
}

module.exports = {
  uploadVehiculos,
  uploadEmpleados,
  rutasImagenes,
  publicIdsImagenes,
  rutaFotoEmpleado,
  publicIdFotoEmpleado,
  hasCloudinaryConfig
};
