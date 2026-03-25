// ==========================================
// HISTORIAS - Datos Locales (Para llenar a mano)
// ==========================================

const historias = [
  {
    nombre: "María F.",
    tipoEM: "Remitente-recurrente (EMRR)",
    testimonio: "Cuando me diagnosticaron hace 6 años, sentí que mi mundo se venía abajo. Gracias a mi familia y al tratamiento, hoy escalo montañas literales y metafóricas. ¡No te rindas nunca!",
    fecha: "2026-01-14"
  },
  {
    nombre: "Anónimo",
    tipoEM: "Primaria progresiva (EMPP)",
    testimonio: "Aceptar los bastones fue un proceso difícil para el ego, pero me devolvieron la independencia. Cada día encuentro nuevas formas de seguir disfrutando la vida a mi propio ritmo.",
    fecha: "2025-10-02"
  },
  {
    nombre: "Julián C.",
    tipoEM: "Síndrome clínico aislado (SCA)",
    testimonio: "Estar en el limbo del diagnóstico fue terrible. Leer estas historias me dio paz mental. Hoy estoy medicado y súper estable, sin haber sumado nuevas lesiones en 3 años.",
    fecha: "2025-08-20"
  }
];

function cargarHistoriasPublicas() {
  const container = document.getElementById("historias-container");
  const loading = document.getElementById("loading-historias");

  if (!container) return;

  container.innerHTML = "";
  if (loading) loading.style.display = "none";

  if (historias.length === 0) {
    container.innerHTML = `<p class="col-12 text-center text-muted fw-bold mt-5 fs-5">Aún no hay historias publicadas.</p>`;
    return;
  }

  // Renderizar historias
  historias.forEach((historia, index) => {
    // Formato de fecha
    const dateParts = historia.fecha.split('-');
    const formatedDate = dateParts.length === 3 
      ? new Date(dateParts[0], dateParts[1]-1, dateParts[2]).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
      : historia.fecha;

    const col = document.createElement("div");
    col.className = "col";

    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0 rounded-4 text-start" style="background-color: #FDFDFD; animation-delay: ${index * 0.1}s">
        <div class="card-body d-flex flex-column p-4">
          <div class="d-flex align-items-center mb-3">
            <h5 class="card-title fw-bold text-dark m-0" style="font-size: 1.25rem;">${historia.nombre}</h5>
            <span class="badge bg-warning ms-3 px-2 py-1">${historia.tipoEM}</span>
          </div>
          <p class="card-text text-muted flex-grow-1" style="font-style: italic;">"${historia.testimonio}"</p>
          <span class="text-muted fw-bold mt-3" style="font-size:0.85rem;">🗓️ ${formatedDate}</span>
        </div>
      </div>
    `;

    container.appendChild(col);
  });
}

// Ejecutar al cargar el documento (aislado de main.js)
document.addEventListener("DOMContentLoaded", cargarHistoriasPublicas);
