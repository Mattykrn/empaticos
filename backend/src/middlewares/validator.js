import { validationResult } from 'express-validator';

/**
 * Middleware centralizado de validación.
 * Evalúa las reglas de express-validator ejecutadas en la ruta.
 * Si encuentra errores, corta la petición respondiendo con status 400 y formato { ok: false, errors: [...] }.
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export default validateRequest;
