// ==========================================
// IMPORTACIONES Y DEPENDENCIAS
// ==========================================
import axios from 'axios';
import { auth } from '../config/firebase';





// ==========================================
// CONFIGURACION DEL CLIENTE HTTP AXIOS
// ==========================================
// Usa VITE_API_URL en producción separada o '/api' para proxy Vite / servidor integrado
const URL_BASE_API = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: URL_BASE_API,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});





// ==========================================
// INTERCEPTOR DE AUTENTICACION (BEARER TOKEN)
// ==========================================
api.interceptors.request.use(
  async (config) => {
    try {
      const yaTieneAuthorization = Boolean(config.headers?.Authorization || config.headers?.authorization);

      if (!yaTieneAuthorization && auth?.currentUser) {
        const token = await auth.currentUser.getIdToken();
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      console.warn('[API Auth] No se pudo adjuntar el token de sesión:', error.message);
    }

    return config;
  },
  (error) => Promise.reject(error)
);





// ==========================================
// EXPORTACION DEL CLIENTE API
// ==========================================
export default api;
