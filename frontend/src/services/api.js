/**
 * ARCHIVO: frontend/src/services/api.js
 * RESPONSABILIDAD EN LA ARQUITECTURA:
 * En este servicio configuro la cliente de Axios centralizado para todas las peticiones HTTP del frontend hacia la API REST del backend.
 * Configuro la URL base mediante `VITE_API_URL` con fallback automático a `http://localhost:5000/api`.
 */

import axios from 'axios';





// En esta constante defino la URL base de mi servidor backend Express
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';





// Acá creo y configuro la instancia principal de Axios con las cabeceras predeterminadas JSON
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});





export default api;