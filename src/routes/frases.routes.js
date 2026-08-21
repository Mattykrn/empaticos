import { Router } from 'express';
import frasesController from '../controllers/frases.controller.js';

// En este archivo configuro las rutas asociadas a mi módulo de frases inspiradoras y API externa.
const router = Router();

// Acá defino mi endpoint GET /api/frases/inspiracion y lo asocio con la función de mi controlador
router.get('/inspiracion', frasesController.getFraseInspiradora);

// Exporto mi enrutador modular para montarlo en mi archivo principal de Express (app.js)
export default router;





