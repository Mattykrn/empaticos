// main.js - Punto de entrada simplificado
import { crearContadorVisitas, contarHistorias } from "./contadores.js";

document.addEventListener("DOMContentLoaded", () => {
  // Inicializo contador visitas
  if (document.getElementById("contador-visitas")) {
    try {
      const incrementar = crearContadorVisitas();
      incrementar();
    } catch (e) {
      console.log("Contador no soportado por faltas de utilería");
    }
  }

  // Inicializo contador historias
  if (document.getElementById("contador-historias")) {
    try {
      contarHistorias().then((count) => {
        document.getElementById("contador-historias").textContent = count;
      });
    } catch (e) {
      console.log("Contador historias no soportado");
    }
  }
});
