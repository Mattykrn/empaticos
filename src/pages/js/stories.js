import { db } from './firebase-config.js';
import { collection, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

async function cargarHistoriasPublicas() {
  const container = document.getElementById("historias-container");
  const loading = document.getElementById("loading-historias");

  if (!container) return;

  if (!db) {
    if (loading) loading.style.display = "none";
    container.innerHTML = `<p class="col-12 text-center text-danger fw-bold mt-5 fs-5">Firebase no está configurado (revisá firebase-config.js)</p>`;
    return;
  }

  try {
    // Consultar solo las aprobadas
    const q = query(
      collection(db, "historias"),
      where("aprobado", "==", true)
    );

    const querySnapshot = await getDocs(q);

    container.innerHTML = "";
    if (loading) loading.style.display = "none";

    if (querySnapshot.empty) {
      container.innerHTML = `<p class="col-12 text-center text-muted fw-bold mt-5 fs-5">Aún no hay historias publicadas. ¡Animate a ser el primero!</p>`;
      return;
    }

    let index = 0;
    querySnapshot.forEach((documento) => {
      const historia = documento.data();
      
      // Formato de fecha si existe
      let formatedDate = "Pronto";
      if (historia.fecha) {
        formatedDate = historia.fecha.toDate().toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' });
      }

      const col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0 rounded-4 text-start" style="background-color: #FDFDFD; animation-delay: ${index * 0.1}s">
          <div class="card-body d-flex flex-column p-4">
            <div class="d-flex align-items-center mb-3">
              <h5 class="card-title fw-bold text-dark m-0" style="font-size: 1.25rem;">${historia.nombre || 'Anónimo'}</h5>
              <span class="badge bg-warning ms-3 px-2 py-1">${historia.tipoEM || 'N/A'}</span>
            </div>
            <p class="card-text text-muted flex-grow-1" style="font-style: italic;">"${historia.testimonio}"</p>
            <span class="text-muted fw-bold mt-3" style="font-size:0.85rem;">🗓️ ${formatedDate}</span>
          </div>
        </div>
      `;

      container.appendChild(col);
      index++;
    });

  } catch (error) {
    console.error("Error cargando historias desde Firestore:", error);
    if (loading) loading.style.display = "none";
    container.innerHTML = `<p class="col-12 text-center text-danger fw-bold mt-5 fs-5">Ocurrió un error cargando las historias.</p>`;
  }
}

// Ejecutar al cargar el documento
document.addEventListener("DOMContentLoaded", cargarHistoriasPublicas);
