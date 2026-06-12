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
  const cloudinaryConfigurado = hasCloudinaryConfig();
  const storage = cloudinaryConfigurado
    ? new CloudinaryStorage({
      cloudinary,
      params: (req, file) => ({
        folder: cloudinaryFolder,
        public_id: crearPublicId(file),
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        resource_type: 'image'
      })
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
      if (isVercel && !cloudinaryConfigurado) {
        const error = new Error('Configura Cloudinary para subir imagenes en Vercel');
        error.status = 400;
        return cb(error);
      }

      if (!file.mimetype.startsWith('image/')) {
        const error = new Error('Solo se permiten imagenes');
        error.status = 400;
        return cb(error);
      }

      return cb(null, true);
    },
    limits: { fileSize: 4 * 1024 * 1024 }
  });
}

const uploadVehiculos = crearUploadImagen(uploadDir, 'tallerdb/vehiculos');
const uploadEmpleados = crearUploadImagen(empleadosUploadDir, 'tallerdb/empleados');

function rutasImagenes(files = []) {
  return files.map(file => urlArchivo(file, 'vehiculos')).filter(Boolean);
}

function publicIdsImagenes(files = []) {
  return files.map(publicIdArchivo).filter(Boolean);
}

function rutaFotoEmpleado(file) {
  if (!file) return undefined;
  return urlArchivo(file, 'empleados');
}

function publicIdFotoEmpleado(file) {
  return publicIdArchivo(file);
}

function urlArchivo(file, carpetaLocal) {
  if (!file) return undefined;

  const cloudinaryUrl = [file.secure_url, file.path, file.url]
    .find(value => typeof value === 'string' && /^https?:\/\//.test(value));

  if (cloudinaryUrl) return cloudinaryUrl;
  if (file.filename) return `/uploads/${carpetaLocal}/${file.filename}`;
  return undefined;
}

function publicIdArchivo(file) {
  if (!file) return undefined;
  if (typeof file.public_id === 'string') return file.public_id;
  if (typeof file.filename === 'string' && !path.extname(file.filename)) return file.filename;
  return undefined;
}

function crearPublicId(file) {
  const base = path.basename(file.originalname, path.extname(file.originalname))
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'imagen';

  return `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}`;
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
