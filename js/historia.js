// Script para cargar y mostrar las historias desde la API

const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', async () => {
  const contenedorHistorias = document.getElementById('historias-container');

  try {
    // Obtener historias desde la API
    const response = await fetch(`${API_BASE_URL}/api/testimonios`);
    
    if (!response.ok) {
      throw new Error(`Error del servidor: ${response.status}`);
    }
    
    const historias = await response.json();

    // Limpiar contenedor
    contenedorHistorias.innerHTML = '';

    // Validar que sea un array
    if (!Array.isArray(historias) || historias.length === 0) {
      contenedorHistorias.innerHTML = `
        <div class="col w-100 text-center">
          <p class="text-muted fs-5">Aún no hay historias compartidas. ¡Sé el primero!</p>
          <a href="unirme.html" class="btn btn-warning mt-3">Compartir mi historia</a>
        </div>
      `;
      return;
    }

    // Renderizar cada historia
    historias.forEach((historia) => {
      const fecha = new Date(historia.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const imagenHTML = historia.foto 
        ? `<img src="${API_BASE_URL}${historia.foto}" class="card-img-top rounded-3" alt="Imagen de ${historia.nombre}" style="height: 200px; object-fit: cover;">`
        : '';

      const tarjeta = document.createElement('div');
      tarjeta.className = 'col';
      tarjeta.innerHTML = `
        <div class="card h-100 shadow-sm border-0 d-flex flex-column" style="background-color: #fff9f2; overflow: hidden;">
          ${imagenHTML}
          <div class="card-body">
            <h5 class="card-title fw-bold text-dark">${historia.nombre}</h5>
            <p class="card-text text-secondary mb-4" style="line-height: 1.6; white-space: pre-wrap; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">
              ${historia.testimonio}
            </p>
            <div class="mb-3">
              <small class="text-muted d-block">
                <strong>📍 Ubicación:</strong> ${historia.ubicacion}
              </small>
            </div>
          </div>
          <div class="card-footer bg-transparent border-0 mt-auto text-end pb-3">
            <small class="text-muted fw-bold">${fecha}</small>
          </div>
        </div>
      `;

      contenedorHistorias.appendChild(tarjeta);
    });

  } catch (error) {
    console.error('Error al cargar historias:', error);
    contenedorHistorias.innerHTML = `
      <div class="col w-100 text-center">
        <p class="text-danger fs-5">Error al cargar las historias. Intenta más tarde.</p>
      </div>
    `;
  }
});
