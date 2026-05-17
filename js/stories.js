async function cargarHistoriasPublicas() {
  const container = document.getElementById("historias-container");
  const loading = document.getElementById("loading-historias");

  if (!container) return;

  if (loading) {
    loading.style.display = "block";
  }

  try {
    const response = await fetch(`${window.location.origin}/api/testimonios`);
    if (!response.ok) {
      throw new Error('No se pudo cargar las historias');
    }

    const historias = await response.json();
    container.innerHTML = "";
    if (loading) loading.style.display = "none";

    if (!Array.isArray(historias) || historias.length === 0) {
      container.innerHTML = `<p class="col-12 text-center text-muted fw-bold mt-5 fs-5">Aún no hay historias publicadas. ¡Animate a ser el primero!</p>`;
      return;
    }

    const fragment = document.createDocumentFragment();

    historias.forEach((historia, index) => {
      const fecha = historia.createdAt ? new Date(historia.createdAt) : null;
      const fechaTexto = fecha instanceof Date && !isNaN(fecha)
        ? fecha.toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Pronto';

      const imagenHtml = historia.foto
        ? `<img src="${historia.foto}" alt="Historia de ${historia.nombre || 'Anónimo'}" class="card-img-top" style="object-fit: cover; height: 220px; width: 100%; border-radius: 18px 18px 0 0;">`
        : '';

      const tipoBadge = historia.tipoEM
        ? `<span class="badge bg-warning ms-3 px-2 py-1">${historia.tipoEM}</span>`
        : '';

      const ubicacionTexto = historia.ubicacion
        ? `<span class="text-muted fw-bold mt-3 d-block" style="font-size:0.9rem;">📍 ${historia.ubicacion}</span>`
        : '';

      const col = document.createElement("div");
      col.className = "col";

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0 rounded-4 text-start" style="background-color: #FDFDFD; animation-delay: ${index * 0.1}s">
          ${imagenHtml}
          <div class="card-body d-flex flex-column p-4">
            <div class="d-flex align-items-center mb-3">
              <h5 class="card-title fw-bold text-dark m-0" style="font-size: 1.25rem;">${historia.nombre || 'Anónimo'}</h5>
              ${tipoBadge}
            </div>
            <p class="card-text text-muted flex-grow-1" style="font-style: italic;">"${historia.testimonio}"</p>
            ${ubicacionTexto}
            <span class="text-muted fw-bold mt-3" style="font-size:0.85rem;">🗓️ ${fechaTexto}</span>
          </div>
        </div>
      `;

      fragment.appendChild(col);
    });

    container.appendChild(fragment);
  } catch (error) {
    console.error('Error cargando historias:', error);
    if (loading) loading.style.display = 'none';
    container.innerHTML = `<p class="col-12 text-center text-danger fw-bold mt-5 fs-5">Ocurrió un error cargando las historias.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", cargarHistoriasPublicas);
