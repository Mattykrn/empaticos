import axios from 'axios';

// URL Base
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Config Axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;