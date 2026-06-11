function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  console.error('Error no controlado:', error);

  let status = error.status || error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  let mensaje = status >= 500 ? 'Ocurrio un error inesperado.' : (error.message || 'No se pudo completar la operacion.');

  if (error.name === 'CastError') {
    status = 404;
    mensaje = 'El registro solicitado no existe o el enlace no es valido.';
  }

  if (error.code === 11000) {
    status = 400;
    mensaje = 'Ya existe un registro con esos datos.';
  }

  return res.status(status).render('error', {
    titulo: status === 404 ? 'Pagina no encontrada' : 'Error',
    mensaje
  });
}

module.exports = errorHandler;
