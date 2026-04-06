// ui-features.js - Se encarga de inyectar dinámicamente Instagram, Pagos y GTranslate en todas las páginas.

export function setupUIFeatures() {
  const instaPath = "M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z";

  // 1. Agregar GTranslate, Instagram y Botón Apoyar a la Navbar principal
  const navbar = document.querySelector('.navbar-nav');
  if (navbar) {
    const li = document.createElement('li');
    li.className = 'nav-item ms-lg-4 d-flex align-items-center mt-4 mt-lg-0 pb-2 pb-lg-0';
    li.innerHTML = `
      <div class="gtranslate_wrapper me-3"></div>
      <a class="nav-link text-white mx-2 p-0" href="https://instagram.com/empaticos_oficial" target="_blank" title="Nuestro Instagram" style="transition: transform 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-instagram" viewBox="0 0 16 16">
          <path d="${instaPath}"/>
        </svg>
      </a>
      <button class="btn btn-warning rounded-pill px-4 ms-3 fw-bold shadow-sm d-flex align-items-center" data-bs-toggle="modal" data-bs-target="#modalApoyo">Apoyarnos 🤎</button>
    `;
    navbar.appendChild(li);
  }

  // 2. Agregar ícono de Instagram al Footer
  const footerContainer = document.querySelector('footer .container');
  if (footerContainer) {
    const instaLink = document.createElement('div');
    instaLink.className = 'mt-3 d-flex justify-content-center align-items-center';
    instaLink.innerHTML = `
      <a href="https://instagram.com/empaticos_oficial" target="_blank" class="text-white text-decoration-none d-flex align-items-center" style="opacity: 0.9; transition: opacity 0.2s;">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-instagram" viewBox="0 0 16 16">
          <path d="${instaPath}"/>
        </svg>
        <span class="ms-2 fw-bold fs-6">@empaticos_oficial</span>
      </a>
    `;
    footerContainer.appendChild(instaLink);
  }

  // 3. Inyectar Modal de Apoyo en el Body
  const modalHTML = `
    <div class="modal fade" id="modalApoyo" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content rounded-4 border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h5 class="modal-title fw-bold fs-4 ms-2 mt-2 text-dark">Ayudanos a seguir creciendo 🤎</h5>
            <button type="button" class="btn-close me-2 mt-2" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body text-center p-4">
            <p class="text-muted mb-4">Todo aporte, por más pequeño que sea, nos permite mantener la página online y seguir compartiendo historias. ¡Gracias de todo corazón!</p>
            
            <!-- Tarjeta Brubank -->
            <div class="card border-2 border-warning rounded-4 mb-3 shadow-sm" style="background-color: #fffaf0;">
              <div class="card-body py-4">
                <h6 class="text-warning fw-bold mb-2 text-uppercase" style="letter-spacing: 1px;">🏦 Transferencia Brubank</h6>
                <p class="mb-1 text-muted">Alias</p>
                <div class="d-flex justify-content-center align-items-center gap-2">
                  <h4 class="fw-bolder text-dark mb-0 user-select-all" style="cursor: pointer;" onclick="navigator.clipboard.writeText('empaticos'); alert('¡Alias empaticos copiado!');">empaticos</h4>
                  <span class="text-muted" style="cursor:pointer;" onclick="navigator.clipboard.writeText('empaticos'); alert('¡Alias empaticos copiado!');">📋</span>
                </div>
                <p class="small text-muted mt-2 mb-0">Haciendo clic seleccionás el alias para copiarlo.</p>
              </div>
            </div>

            <!-- Boton MercadoPago / Cafecito -->
            <div class="mt-4 d-flex gap-3">
              <a href="#" class="btn w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm text-white" style="background-color: #009EE3;">
                🤝 Mercado Pago
              </a>
              <a href="#" class="btn w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm text-dark" style="background-color: #E2F2D5;">
                ☕ Invitar un Cafecito
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // 4. Inyectar Configuracion GTranslate
  window.gtranslateSettings = {
    "default_language": "es",
    "languages": ["es", "en", "pt", "fr", "it", "de"],
    "wrapper_selector": ".gtranslate_wrapper",
    "alt_flags": { "en": "usa", "pt": "brazil", "es": "argentina" }
  };
  const gtScript = document.createElement('script');
  gtScript.src = "https://cdn.gtranslate.net/widgets/latest/dropdown.js";
  gtScript.defer = true;
  document.head.appendChild(gtScript);
}
