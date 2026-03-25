// Clase 10 - Constantes y variables
const API_URL = "https://lazaro-backend-sqlite.onrender.com/api"; // Cambiar cuando backend esté estable
const ADMIN_PASSWORD = "EMpaticos2025arg";

// Clase 13 - Clase Historia
class Historia {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre || "Anónimo";
    this.tipoEM = data.tipoEM || "No especificado";
    this.historia = data.historia;
    this.approved = data.approved || false;
    this.createdAt = new Date(data.createdAt);
  }

  // Método para crear card (Clase 16 - createElement)
  crearCard() {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("h5");
    title.textContent = `${this.nombre} (${this.tipoEM})`;
    card.appendChild(title);

    const text = document.createElement("p");
    text.textContent = this.historia;
    card.appendChild(text);

    const date = document.createElement("small");
    date.textContent = this.createdAt.toLocaleDateString();
    card.appendChild(date);

    if (!this.approved) {
      const btnAprobar = document.createElement("button");
      btnAprobar.textContent = "Aprobar";
      btnAprobar.className = "btn-aprobar";
      btnAprobar.dataset.id = this.id;
      card.appendChild(btnAprobar);

      const btnRechazar = document.createElement("button");
      btnRechazar.textContent = "Rechazar";
      btnRechazar.className = "btn-rechazar";
      btnRechazar.dataset.id = this.id;
      card.appendChild(btnRechazar);
    }

    return card;
  }
}

// Clase 19 - Early return + guard clauses + try/catch avanzado
async function cargarHistorias() {
  const container = document.querySelector("#stories-container");
  if (!container) return; // Guard clause 1

  container.innerHTML = "<p>Cargando historias...</p>";

  try {
    const res = await fetch(`${API_URL}/stories/all`);
    if (!res.ok) {
      return mostrarError(`Error del servidor: ${res.status}`);
    }

    const data = await res.json();

    if (data.length === 0) {
      return mostrarMensaje("No hay historias pendientes.");
    }

    // Clase 14 - filter + map
    const cards = data
      .filter(item => !item.approved) // solo pendientes
      .map(item => new Historia(item).crearCard());

    container.innerHTML = "";
    cards.forEach(card => container.appendChild(card));

  } catch (err) {
    mostrarError(`Algo salió mal: ${err.message}`);
  }
}

// Funciones auxiliares (Clase 19 - early return)
function mostrarError(mensaje) {
  const container = document.querySelector("#stories-container");
  container.innerHTML = `<p class="error">${mensaje}</p>`;
}

function mostrarMensaje(mensaje) {
  const container = document.querySelector("#stories-container");
  container.innerHTML = `<p class="info">${mensaje}</p>`;
}

// Clase 15-16 - Delegación de eventos
function setupDelegacion() {
  const container = document.querySelector("#stories-container");
  if (!container) return;

  container.addEventListener("click", async e => {
    const target = e.target;

    if (target.classList.contains("btn-aprobar")) {
      const id = target.dataset.id;
      try {
        const res = await fetch(`${API_URL}/stories/${id}/approve`, { method: "PATCH" });
        if (res.ok) cargarHistorias();
      } catch (err) {
        alert("Error al aprobar");
      }
    }

    if (target.classList.contains("btn-rechazar")) {
      const id = target.dataset.id;
      if (confirm("¿Seguro? Se borrará permanentemente")) {
        try {
          const res = await fetch(`${API_URL}/stories/${id}`, { method: "DELETE" });
          if (res.ok) cargarHistorias();
        } catch (err) {
          alert("Error al rechazar");
        }
      }
    }
  });
}

// Login (Clase 11 - condicional)
function setupLogin() {
  const loginBtn = document.querySelector("#login-btn");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", () => {
    const pass = document.querySelector("#password").value;
    if (pass === ADMIN_PASSWORD) {
      document.querySelector("#login-form").style.display = "none";
      document.querySelector("#admin-panel").style.display = "block";
      cargarHistorias();
    } else {
      alert("Contraseña incorrecta");
    }
  });
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  setupLogin();
  setupDelegacion();

  // Si ya estamos en admin y logueado
  if (document.querySelector("#admin-panel")?.style.display !== "none") {
    cargarHistorias();
  }
});