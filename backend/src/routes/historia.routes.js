// Definición de las rutas del recurso Historias y Testimonios
// Archivo de rutas conecto mis endpoints HTTP con sus controladores y middlewares de validación correspondientes.

import { Router } from 'express';
import {
  obtenerHistorias,
  obtenerHistoriaPorId,
  crearHistoria,
  actualizarHistoria,
  eliminarHistoria,
  reaccionarHistoria
} from '../controllers/historiaController.js';
import { validarHistoria } from '../validators/historiaValidator.js';
import { validarCampos } from '../middlewares/validarCampos.js';

// Instancio el enrutador propio de Express
const router = Router();

// GET /$1
router.get('/', obtenerHistorias);

// GET /$1/:id
router.get('/:id', obtenerHistoriaPorId);

// POST /$1
router.post('/', validarHistoria, validarCampos, crearHistoria);

// PUT /$1/:id
router.put('/:id', validarHistoria, validarCampos, actualizarHistoria);

// DELETE /$1/:id
router.delete('/:id', eliminarHistoria);

// POST /api/historias/:id/reacciones -> Registrar una reacción emotiva en una historia
router.post('/:id/reacciones', reaccionarHistoria);

// Exporto mi enrutador para ser montado en el servidor principal Express
export default router;
