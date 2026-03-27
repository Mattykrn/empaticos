// main.js - Punto de entrada simplificado
import { crearContadorVisitas } from './contadores.js';

// Inicializo contador visitas
if (document.getElementById('contador-visitas')) {
  try {
    const incrementar = crearContadorVisitas();
    incrementar();
  } catch(e) { console.log('Contador no soportado por faltas de utilería'); }
}