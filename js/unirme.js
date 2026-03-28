import { db } from './firebase-config.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

function setupUnirmeForm() {
  const formUnirme = document.getElementById('form-unirme');
  if (!formUnirme) return;

  const btnSubmit = document.getElementById('submit-btn');
  const msjExito = document.getElementById('mensaje-exito');
  const errorHistoria = document.getElementById('error-historia');
  const inputHistoria = document.getElementById('historia');
  const divContador = document.getElementById('contador-caracteres');

  // Contador de caracteres (simple)
  inputHistoria.addEventListener('input', () => {
    divContador.textContent = `${inputHistoria.value.length}/1000 caracteres`;
  });

  formUnirme.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorHistoria.style.display = 'none';

    let nombre = document.getElementById('nombre').value.trim();
    const tipoEM = document.getElementById('tipoEM').value;
    const historia = inputHistoria.value.trim();
    const anonimo = document.getElementById('anonimo-checkbox').checked;

    if (!tipoEM) {
      document.getElementById('tipoEM').classList.add('is-invalid');
      return;
    } else {
      document.getElementById('tipoEM').classList.remove('is-invalid');
    }

    if (!historia) {
      errorHistoria.style.display = 'block';
      return;
    }

    if (anonimo || nombre === '') {
      nombre = "Anónimo";
    }

    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Enviando...`;

    try {
      if (!db) throw new Error("Firebase no está configurado (revisá firebase-config.js)");

      // Guardar en Firestore Database y publicar la historia de inmediato
      await addDoc(collection(db, "historias"), {
        nombre: nombre,
        tipoEM: tipoEM,
        testimonio: historia,
        aprobado: true, // Publicar inmediatamente para que aparezca en historias
        fecha: serverTimestamp() // Timestamp del servidor de base de datos
      });

      // Enviar correo usando Formsubmit.co mediante el formulario HTML normal
      formUnirme.submit();
    } catch (error) {
      console.error("Error al guardar historia:", error);
      alert("Hubo un error. Puede que te falte copiar las claves de Firebase en `js/firebase-config.js`.");
      btnSubmit.disabled = false;
      btnSubmit.innerText = "Enviar mi historia con amor ❤️";
    }
  });
}

setupUnirmeForm();
