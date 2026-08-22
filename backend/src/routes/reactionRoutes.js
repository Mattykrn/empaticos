import { Router } from 'express';
import { toggleReaccion, obtenerReacciones } from '../controllers/reactionController.js';
import { validarReaccion } from '../validators/reactionValidator.js';

const router = Router();

// POST /api/reactions -> Registrar o alternar (toggle) de reacción
router.post('/', validarReaccion, toggleReaccion);

// GET /api/reactions/:targetId -> Consultar reacciones de un elemento
router.get('/:targetId', obtenerReacciones);

export default router;
