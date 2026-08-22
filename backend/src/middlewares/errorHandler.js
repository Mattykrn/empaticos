// Middleware centralizado para interceptar errores no controlados y enviar una respuesta prolija
export const manejadorDeErrores = (err, req, res, next) => {
  console.error('[Error no controlado]:', err);

  // Manejo error de duplicados en MongoDB (código 11000)
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un registro con ese valor único en mi base de datos (por ejemplo, email duplicado).'
    });
  }

  // Manejo error de casteo de ObjectId inválido de MongoDB
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `El ID provisto '${err.value}' no tiene un formato válido de MongoDB.`
    });
  }

  // Error general del servidor
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Ocurrió un error inesperado en mi servidor.'
  });
};
