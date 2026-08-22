// Middleware de validación centralizado para express-validator
// En este middleware propio valido la estructura de la petición evaluando los errores recolectados por las reglas de express-validator.

import { validationResult } from 'express-validator';

export const validarCampos = (req, res, next) => {
  // En esta línea capturo los resultados de las validaciones previas realizadas en las rutas
  const errores = validationResult(req);

  // Aquí verifico si existen fallos de validación acumulados
  if (!errores.isEmpty()) {
    // Si encuentro errores, retorno una respuesta estructurada con código HTTP 400 Bad Request
    return res.status(400).json({
      ok: false,
      mensaje: 'La petición contiene datos inválidos o incompletos',
      errores: errores.array().map(err => ({
        campo: err.path || err.param,
        mensaje: err.msg
      }))
    });
  }

  // Si todas las validaciones fueron superadas exitosamente, continúo hacia el controlador
  next();
};

export default validarCampos;
