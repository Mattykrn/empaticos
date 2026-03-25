// main.js - Punto de entrada del sitio
// Matii: Acá importo todo y ejecuto según la página actual (Clase 20)

import { crearContadorVisitas } from './contadores.js';

// Matii: Detecto en qué página estoy
const pagina = window.location.pathname.split('/').pop() || 'index.html';

// Matii: Inicializo contador visitas en casi todas las páginas
if (document.getElementById('contador-visitas')) {
  try {
    const incrementar = crearContadorVisitas();
    incrementar();
  } catch(e) { console.log('Contador no soportado por faltas de utilería'); }
}

if (pagina.includes('admin.html')) {
  try {
    setupLoginAdmin();
    setupAdminDelegacion();
  } catch(e) {}
}