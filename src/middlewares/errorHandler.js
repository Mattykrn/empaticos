// En este middleware me encargo de centralizar la captura y formateo de todos los errores no controlados de mi API Express
export const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler API] ${err.name} - ${err.message}`);

  // En este bloque capturo errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const errores = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Los datos enviados no cumplen con el formato o campos obligatorios',
      errors: errores
    });
  }

  // Capturo errores de claves duplicadas de MongoDB (ej. email o googleId ya registrados)
  if (err.code === 11000) {
    const campoDuplicado = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(400).json({
      success: false,
      message: `El ${campoDuplicado} ingresado ya se encuentra registrado en nuestra plataforma`,
      errors: [`El valor para '${campoDuplicado}' ya está en uso`]
    });
  }

  // Capturo errores de ObjectID con formato inválido en MongoDB
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return res.status(404).json({
      success: false,
      message: 'El identificador del recurso proporcionado no es un ID válido de MongoDB',
      errors: ['Identificador de recurso no encontrado']
    });
  }

  // Capturo errores de firma de token JWT inválido o expirado
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Su sesión es inválida o ha expirado. Por favor inicie sesión nuevamente.',
      errors: [err.message]
    });
  }

  // Respuesta fallback para errores no contemplados de servidor (500 Internal Server Error)
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Ocurrió un error inesperado en nuestro servidor',
    errors: process.env.NODE_ENV === 'development' ? [err.stack] : ['Error interno del servidor']
  });
};
