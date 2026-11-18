import { Router } from 'express';
import { obtenerHistorias, crearHistoria } from '../controllers/storyController.js';
import { validarHistoria } from '../validators/storyValidator.js';

const router = Router();

// GET /$1
router.get('/', obtenerHistorias);

// POST /$1
router.post('/', validarHistoria, crearHistoria);

export default router;
