// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import { validationResult } from 'express-validator';





// ==========================================
// MIDDLEWARE PARA ATRAPAR ERRORES DE VALIDACION
// ==========================================
// En este middleware reviso si express-validator encontró algún error en la petición.
// Si hay problemas, corto acá nomás y respondo con código 400 y el listado de fallos.
export const validarCampos = (req, res, next) => {
  const errores = validationResult(req);

  // Si el arreglo de errores no está vacío, armo la respuesta de error
  if (!errores.isEmpty()) {
    const detalleErrores = errores.array().map((err) => ({
      campo: err.path || err.param,
      mensaje: err.msg,
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      ok: false,
      success: false,
      mensaje: 'La petición contiene datos inválidos o incompletos',
      errores: detalleErrores,
      errors: detalleErrores
    });
  }

  // Si todo vino bien, sigo adelante con la ejecución
  next();
};





// ==========================================
// EXPORTACION DEL MIDDLEWARE
// ==========================================
export default validarCampos;
