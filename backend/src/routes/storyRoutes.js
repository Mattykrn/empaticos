import { Router } from 'express';
import { obtenerHistorias, crearHistoria } from '../controllers/storyController.js';
import { validarHistoria } from '../validators/storyValidator.js';

const router = Router();

// GET /api/stories -> Listar historias en MongoDB Atlas
router.get('/', obtenerHistorias);

// POST /api/stories -> Guardar una historia con validaciones
router.post('/', validarHistoria, crearHistoria);

export default router;
