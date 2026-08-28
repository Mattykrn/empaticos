import { body, validationResult } from 'express-validator';

// Checker de validación
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

// Validar creación
export const validarHistoria = [
  body('author')
    .optional()
    .trim(),
  body('content')
    .optional()
    .trim(),
  validarCampos
];
