import axios from 'axios';

// Usa VITE_API_URL en producción separada (Vercel + Render), o '/api' para proxy Vite / servidor integrado
const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
