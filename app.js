require('dotenv').config();

const dns = require('dns');
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');

const authRoutes = require('./routes/auth');
const vehiculosRoutes = require('./routes/vehiculos');
const serviciosRoutes = require('./routes/servicios');
const refaccionesRoutes = require('./routes/refacciones');
const empleadosRoutes = require('./routes/empleados');
const tiposServiciosRoutes = require('./routes/tiposServicios');
const contabilidadRoutes = require('./routes/contabilidad');
const requireAuth = require('./middleware/auth');
const { ejecutarNominaAutomaticaSabatina } = require('./services/contabilidad');

const app = express();
const PORT = process.env.PORT || 3000;
const isVercel = process.env.VERCEL === '1';

// Evita fallos de resolucion SRV de Atlas cuando el DNS local no responde bien.
dns.setServers(['8.8.8.8', '1.1.1.1']);

if (!process.env.MONGODB_URI) {
  throw new Error('Falta configurar MONGODB_URI en el entorno');
}

const globalState = global;

function conectarMongo() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();

  if (!globalState.tallerDbMongoPromise) {
    globalState.tallerDbMongoPromise = mongoose
      .connect(process.env.MONGODB_URI)
      .then(async () => {
        console.log('MongoDB conectado');
        if (!globalState.tallerDbNominaEjecutada) {
          globalState.tallerDbNominaEjecutada = true;
          await ejecutarNominaAutomaticaSabatina();
        }
      })
      .catch(error => {
        globalState.tallerDbMongoPromise = null;
        console.error('Error al conectar con MongoDB:', error.message);
        throw error;
      });
  }

  return globalState.tallerDbMongoPromise;
}

conectarMongo().catch(() => {
  if (!isVercel && require.main === module) process.exit(1);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.use(expressLayouts);
app.set('layout', 'layout/base');

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'cambia_esta_clave_en_produccion',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24
    }
  })
);

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.error = null;
  res.locals.formatoMoneda = value => Number(value || 0).toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  res.locals.fechaInput = value => {
    const fecha = value ? new Date(value) : new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${fecha.getFullYear()}-${mes}-${dia}`;
  };
  next();
});

app.get('/', (req, res) => {
  if (req.session.userId) return res.redirect('/vehiculos');
  return res.redirect('/login');
});

app.use('/', authRoutes);
app.use('/vehiculos', requireAuth, vehiculosRoutes);
app.use('/servicios', requireAuth, serviciosRoutes);
app.use('/catalogo-servicios', requireAuth, tiposServiciosRoutes);
app.use('/refacciones', requireAuth, refaccionesRoutes);
app.use('/empleados', requireAuth, empleadosRoutes);
app.use('/contabilidad', requireAuth, contabilidadRoutes);

app.use((req, res) => {
  res.status(404).render('error', { titulo: 'Pagina no encontrada', mensaje: 'La ruta solicitada no existe.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`TallerDB corriendo en http://localhost:${PORT}`);
  });
}

module.exports = app;
