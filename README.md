# TallerDB - Taller Mecanico

**Nombre:** [tu nombre]  
**Tema:** Taller Mecanico  
**Descripcion:** Aplicacion web para gestionar vehiculos y sus servicios en un taller mecanico. Permite registrar clientes/vehiculos, agendar servicios, y seguir el estado de cada trabajo.

## Entidades y relacion
- **Vehiculo**: placa, marca, modelo, año, propietario, telefono
- **Servicio**: tipo, descripcion, costo, estado, fecha
- **Relacion**: Referencia (ObjectId). `Servicio.vehiculo` apunta al `_id` de `Vehiculo`.  
  Se eligio referencia porque un vehiculo acumula multiples servicios con el tiempo; embeberlos haria crecer el documento sin limite y dificultaria consultas independientes.

## Version de MongoDB
MongoDB 7.0.x (verificado en Atlas - captura en `/docs/atlas-version.png`)

## Correr el seed
npm run seed

## Stack
Node.js + Express + Mongoose + EJS

## Image uploads
Vehicle images and employee photos are uploaded to Cloudinary when these environment variables are configured:

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

If any Cloudinary variable is missing, uploads fall back to local disk storage under `public/uploads`.

## Usuario de prueba
demo@demo.com / Demo1234

## Docker
docker compose up --build

Abrir: http://localhost:3000

Si el puerto 3000 esta ocupado:
HOST_PORT=3001 docker compose up --build
