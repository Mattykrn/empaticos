// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
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
import { soloAdmin } from '../middlewares/soloAdminMiddleware.js';





// ==========================================
// INICIALIZACION DEL ENRUTADOR
// ==========================================
const router = Router();





// ==========================================
// RUTAS CRUD DE HISTORIAS Y REACCIONES
// ==========================================
router.get('/', obtenerHistorias);
router.get('/:id', obtenerHistoriaPorId);
router.post('/', validarHistoria, validarCampos, crearHistoria);
router.put('/:id', validarHistoria, validarCampos, actualizarHistoria);
router.delete('/:id', soloAdmin, eliminarHistoria);
router.post('/:id/reacciones', reaccionarHistoria);





// ==========================================
// EXPORTACION DEL ENRUTADOR
// ==========================================
export default router;
