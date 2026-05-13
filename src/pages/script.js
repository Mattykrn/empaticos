// script.js - JavaScript compartido para todo EMpaticos (Clases 10-19)
// Autor: Matías Torres & Grok ❤️

// === Constantes globales (Clase 10) ===
const API_URL = "https://lazaro-backend-sqlite.onrender.com/api"; // Cambiar cuando backend esté estable
const ADMIN_PASSWORD = "EMpaticos2025arg"; // Cambiar por una segura en producción

// === Clase Historia (Clase 13 - objetos y clases) ===
class Historia {
  constructor(data) {
    this.id = data.id;
    this.nombre = data.nombre || "Anónimo";
    this.tipoEM = data.tipoEM || "No especificado";
    this.historia = data.historia;
    this.approved = data.approved || false;
    this.createdAt = new Date(data.createdAt);
  }

  // Método para crear card dinámica (Clase 16 - createElement)
  crearCard() {
    const col = document.createElement("div");
    col.className = "col-md-6 col-lg-4";

    const card = document.createElement("div");
    card.className = "card h-100 shadow-sm";

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("h5");
    title.className = "card-title text-warning";
    title.textContent = `${this.nombre} (${this.tipoEM})`;
    body.appendChild(title);

    const texto = document.createElement("p");
    texto.className = "card-text";
    texto.textContent = this.historia;
    body.appendChild(texto);

    const fecha = document.createElement("small");
    fecha.className = "text-muted";
    fecha.textContent = this.createdAt.toLocaleDateString();
    body.appendChild(fecha);

    if (!this.approved) {
      const btnAprobar = document.createElement("button");
      btnAprobar.className = "btn btn-success btn-sm me-2";
      btnAprobar.textContent = "Aprobar";
      btnAprobar.dataset.id = this.id;
      body.appendChild(btnAprobar);

      const btnRechazar = document.createElement("button");
      btnRechazar.className = "btn btn-danger btn-sm";
      btnRechazar.textContent = "Rechazar";
      btnRechazar.dataset.id = this.id;
      body.appendChild(btnRechazar);
    } else {
      const badge = document.createElement("span");
      badge.className = "badge bg-success";
      badge.textContent = "Aprobada";
      body.appendChild(badge);
    }

    card.appendChild(body);
    col.appendChild(card);
    return col;
  }
}

// === Funciones reutilizables (Clase 19 - early return + guard clauses) ===
function mostrarError(containerId, mensaje) {
  const container = document.querySelector(containerId);
  if (!container) return;

  container.innerHTML = `<p class="lead text-danger text-center">${mensaje}</p>`;
}

function mostrarLoading(containerId) {
  const container = document.querySelector(containerId);
  if (!container) return;

  container.innerHTML = '<p class="lead text-center">Cargando...</p>';
}

// === Cargar historias aprobadas (para historias.html) ===
async function cargarHistoriasPublicas() {
  const container = document.querySelector("#historias-container");
  if (!container) return;

  mostrarLoading("#historias-container");

  try {
    const res = await fetch(`${API_URL}/stories`);
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();

    if (data.length === 0) {
      container.innerHTML = '<p class="lead text-center">Aún no hay historias aprobadas. ¡Sé el primero! ❤️</p>';
      return;
    }

    container.innerHTML = "";
    data
      .map(item => new Historia(item).crearCard())
      .forEach(card => container.appendChild(card));

  } catch (err) {
    mostrarError("#historias-container", `No pudimos cargar las historias 😔 (${err.message})`);
  }
}

// === Cargar historias para admin (todas, pendientes y aprobadas) ===
async function cargarHistoriasAdmin() {
  const container = document.querySelector("#stories-container");
  if (!container) return;

  mostrarLoading("#stories-container");

  try {
    const res = await fetch(`${API_URL}/stories/all`);
    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();

    container.innerHTML = "";
    data
      .map(item => new Historia(item).crearCard())
      .forEach(card => container.appendChild(card));

  } catch (err) {
    mostrarError("#stories-container", `No pudimos cargar las historias 😔 (${err.message})`);
  }
}

// === Delegación de eventos para admin (Clase 15-16) ===
function setupAdminDelegacion() {
  const container = document.querySelector("#stories-container");
  if (!container) return;

  container.addEventListener("click", async e => {
    const target = e.target;

    if (target.matches(".btn-aprobar")) {
      const id = target.dataset.id;
      try {
        const res = await fetch(`${API_URL}/stories/${id}/approve`, { method: "PATCH" });
        if (res.ok) cargarHistoriasAdmin();
      } catch (err) {
        alert("Error al aprobar");
      }
    }

    if (target.matches(".btn-rechazar")) {
      const id = target.dataset.id;
      if (confirm("¿Seguro que querés rechazar y borrar esta historia?")) {
        try {
          const res = await fetch(`${API_URL}/stories/${id}`, { method: "DELETE" });
          if (res.ok) cargarHistoriasAdmin();
        } catch (err) {
          alert("Error al rechazar");
        }
      }
    }
  });
}

// === Login simple para admin (Clase 11) ===
function setupLoginAdmin() {
  const loginBtn = document.querySelector("#login-btn");
  if (!loginBtn) return;

  loginBtn.addEventListener("click", () => {
    const pass = document.querySelector("#admin-password").value;
    if (pass === ADMIN_PASSWORD) {
      document.querySelector("#login-section").style.display = "none";
      document.querySelector("#admin-panel").style.display = "block";
      cargarHistoriasAdmin();
    } else {
      alert("Contraseña incorrecta ❤️");
    }
  });
}

// === Inicialización global ===
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  // Ejecuta según la página
  if (currentPage.includes("admin")) {
    setupLoginAdmin();
    setupAdminDelegacion();
  }

  if (currentPage.includes("historias")) {
    cargarHistoriasPublicas();
  }

  // Contador de visitas en cualquier página que lo tenga
  if (document.getElementById("contador-visitas")) {
    const incrementar = crearContadorVisitas();
    incrementar();
  }
});

// Contador de visitas reutilizable (Clase 12 + 16)
function crearContadorVisitas() {
  let visitas = localStorage.getItem("visitas") || 0;
  visitas = Number(visitas);

  return function () {
    visitas++;
    localStorage.setItem("visitas", visitas);
    document.getElementById("contador-visitas").textContent = visitas;
  };
}