// Rutas para la integración con servicios y APIs públicas externas
// Archivo de rutas defino el endpoint para la consulta de frases diarias de contención emocional.

import { Router } from 'express';
import { obtenerFraseApoyo } from '../controllers/externaController.js';

// Inicializo el enrutador de Express
const router = Router();

// GET /api/externa/frase-apoyo -> Consumir API externa pública y entregar la frase procesada
router.get('/frase-apoyo', obtenerFraseApoyo);

// Exporto mi ruta lista para su inclusión en la aplicación principal
export default router;
