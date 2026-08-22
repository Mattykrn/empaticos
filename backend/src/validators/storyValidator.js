import { body, validationResult } from 'express-validator';

// Middleware auxiliar para verificar los resultados de express-validator
export const validarCampos = (req, res, next) => {
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Errores de validación en los datos enviados',
      errores: errores.array().map(e => ({ campo: e.path, mensaje: e.msg }))
    });
  }
  next();
};

// Reglas de validación para la creación de Historias
export const validarHistoria = [
  body('author')
    .optional()
    .trim(),
  body('content')
    .optional()
    .trim(),
  validarCampos
];
