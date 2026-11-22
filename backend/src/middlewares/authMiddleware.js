// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import { soloAdmin } from './soloAdminMiddleware.js';





// ==========================================
// RE-EXPORTACION DE AUTORIZACION ADMINISTRATIVA
// ==========================================
export { soloAdmin };

export const verificarAutenticacion = soloAdmin;





// ==========================================
// EXPORTACION POR DEFECTO
// ==========================================
export default {
  soloAdmin,
  verificarAutenticacion
};
