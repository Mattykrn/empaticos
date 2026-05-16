import { db } from './firebase-config.js';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, orderBy } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

const ADMIN_PASSWORD = "EMpaticos2025arg";

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('btn-login').addEventListener('click', login);
  document.getElementById('btn-logout').addEventListener('click', logout);
  document.getElementById('btn-reload').addEventListener('click', loadStories);

  const list = document.getElementById('stories-list');
  if (list) {
    list.addEventListener('click', (event) => {
      const approveBtn = event.target.closest('.btn-approve');
      if (approveBtn) {
        approveStory(approveBtn.getAttribute('data-id'));
        return;
      }

      const rejectBtn = event.target.closest('.btn-reject');
      if (rejectBtn) {
        rejectStory(rejectBtn.getAttribute('data-id'));
      }
    });
  }
});

function login() {
  const pass = document.getElementById('admin-password').value;
  if (pass === ADMIN_PASSWORD) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
    loadStories();
  } else {
    alert("🔒 Contraseña incorrecta ❤️");
  }
}

function logout() {
  document.getElementById('login-section').style.display = 'flex';
  document.getElementById('admin-panel').style.display = 'none';
  document.getElementById('admin-password').value = '';
}

async function loadStories() {
  const list = document.getElementById('stories-list');
  list.innerHTML = '<div class="col-12 text-center my-5"><p class="lead fw-bold text-muted w-100">Consultando base de datos NoSQL...</p></div>';

  if (!db) {
    list.innerHTML = '<div class="col-12 text-center my-5"><p class="text-danger">Error: Firebase no está configurado (revisá firebase-config.js)</p></div>';
    return;
  }

  try {
    const q = query(
      collection(db, "historias"), 
      where("aprobado", "==", false)
      // Nota: Si agregas orderBy("fecha", "desc"), Firestore podría pedirte crear un índice.
      // Por ahora se omitió orderBy para evitar el requisito del índice hasta que esté testeado.
    );

    const querySnapshot = await getDocs(q);
    
    list.innerHTML = '';

    if (querySnapshot.empty) {
      list.innerHTML = '<div class="col-12 text-center my-5"><p class="lead fw-bold text-muted w-100">✨ ¡Todo al día! No hay historias pendientes de aprobación.</p></div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    querySnapshot.forEach((documento) => {
      const story = documento.data();
      const id = documento.id;
      
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm rounded-4">
          <div class="card-body d-flex flex-column p-4">
            <h5 class="card-title text-warning fw-bold mb-3">${story.nombre || 'Anónimo'} <span class="badge bg-light text-dark ms-2 border">${story.tipoEM || 'N/A'}</span></h5>
            <p class="card-text flex-grow-1 text-muted">"${story.testimonio}"</p>
            <div class="mt-auto d-flex gap-2">
              <button class="btn btn-success flex-fill py-2 fw-bold btn-approve" data-id="${id}">✓ Aprobar</button>
              <button class="btn btn-danger flex-fill py-2 fw-bold btn-reject" data-id="${id}">✕ Borrar</button>
            </div>
          </div>
        </div>
      `;
      fragment.appendChild(col);
    });

    list.appendChild(fragment);

  } catch (err) {
    console.error('Error al cargar historias:', err);
    list.innerHTML = `
    <div class="col-12 text-center my-5">
      <div class="alert alert-danger rounded-4 d-inline-block p-4">
        <h5 class="fw-bold">⚠️ Error al conectar con Firestore</h5>
        <p class="mb-0">${err.message}</p>
      </div>
    </div>`;
  }
}

async function approveStory(id) {
  try {
    const docRef = doc(db, "historias", id);
    await updateDoc(docRef, {
      aprobado: true
    });
    loadStories(); // Recargar lista
  } catch (err) {
    console.error("Error aprobando:", err);
    alert("Error al intentar aprobar: " + err.message);
  }
}

async function rejectStory(id) {
  if (confirm("⚠️ ¿Seguro que querés rechazar y BORRAR esta historia permanentemente de Firebase?")) {
    try {
      const docRef = doc(db, "historias", id);
      await deleteDoc(docRef);
      loadStories(); // Recargar lista
    } catch (err) {
      console.error("Error borrando:", err);
      alert("Error al intentar borrar: " + err.message);
    }
  }
}
