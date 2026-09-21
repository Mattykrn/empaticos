// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import { Router } from 'express';
import { obtenerFraseExterna } from '../controllers/externo.controller.js';

const router = Router();





// ==========================================
// RUTAS DEDICADAS PARA CONSUMO DE API EXTERNA
// ==========================================
// Endpoint requerido para consultar frases procesadas de una API pública
router.get('/', obtenerFraseExterna);
router.get('/frase', obtenerFraseExterna);
router.get('/inspiracion', obtenerFraseExterna);
router.get('/quote', obtenerFraseExterna);
router.get('/frase-apoyo', obtenerFraseExterna);





// ==========================================
// EXPORTACION DEL ENRUTADOR
// ==========================================
export default router;
