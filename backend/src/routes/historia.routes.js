// Definición de las rutas del recurso Historias y Testimonios
// En este archivo de rutas conecto mis endpoints HTTP con sus controladores y middlewares de validación correspondientes.

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

// GET /api/historias -> Obtener la lista completa de historias de vida
router.get('/', obtenerHistorias);

// GET /api/historias/:id -> Obtener una historia particular por ID
router.get('/:id', obtenerHistoriaPorId);

// POST /api/historias -> Crear una nueva historia con express-validator y middleware propio de captura
router.post('/', validarHistoria, validarCampos, crearHistoria);

// PUT /api/historias/:id -> Actualizar una historia existente por ID
router.put('/:id', validarHistoria, validarCampos, actualizarHistoria);

// DELETE /api/historias/:id -> Eliminar una historia por ID
router.delete('/:id', eliminarHistoria);

// POST /api/historias/:id/reacciones -> Registrar una reacción emotiva en una historia
router.post('/:id/reacciones', reaccionarHistoria);

// Exporto mi enrutador para ser montado en el servidor principal Express
export default router;
