import axios from 'axios';

// Creo una instancia personalizada de Axios configurando la URL base dinámica para desarrollo y producción
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor de Peticiones: inyecto automáticamente el token JWT guardado en localStorage en cada solicitud saliente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('empaticos_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error al preparar la solicitud HTTP:', error);
    return Promise.reject(error);
  },
);

// Interceptor de Respuestas: capturo errores HTTP globales (401, 403, 500) y normalizo el mensaje devuelto por el servidor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Si el servidor devuelve 401 (No autorizado / Token Expirado), limpio el token para forzar re-login
      if (status === 401) {
        console.warn('Sesión expirada o token no válido. Limpiando almacenamiento local...');
        localStorage.removeItem('empaticos_token');
        localStorage.removeItem('empaticos_usuario');
      }

      // Extraigo el mensaje formateado por mi middleware errorHandler de Express
      const mensajeError = data?.message || data?.mensaje || 'Error al procesar la solicitud en el servidor';
      return Promise.reject(new Error(mensajeError));
    } else if (error.request) {
      return Promise.reject(new Error('No se pudo establecer conexión con el servidor. Verifica tu conexión a internet.'));
    }
    
    return Promise.reject(error);
  }
);

export default api;
