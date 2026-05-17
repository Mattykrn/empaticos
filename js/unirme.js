// Acá manejo todo el flujo del formulario de unirme.html

const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  const formUnirme = document.getElementById('form-unirme');
  const imagenInput = document.getElementById('imagen');
  const ubicacionInput = document.getElementById('ubicacion');
  const inputHistoria = document.getElementById('historia');
  const divContador = document.getElementById('contador-caracteres');
  const mensajeExito = document.getElementById('mensaje-exito');
  const errorHistoria = document.getElementById('error-historia');
  const submitBtn = document.getElementById('submit-btn');

  if (!formUnirme || !inputHistoria) return;

  if (divContador) {
    inputHistoria.addEventListener('input', () => {
      divContador.textContent = `${inputHistoria.value.length}/1000 caracteres`;
    });
  }

  formUnirme.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (errorHistoria) {
      errorHistoria.style.display = 'none';
    }

    const nombreInput = document.getElementById('nombre');
    const tipoEMInput = document.getElementById('tipoEM');
    const anonimoCheckbox = document.getElementById('anonimo-checkbox');

    const nombre = nombreInput && nombreInput.value ? nombreInput.value : 'Anónimo';
    const tipoEM = tipoEMInput && tipoEMInput.value ? tipoEMInput.value : '';
    const historia = inputHistoria.value;
    const ubicacion = ubicacionInput && ubicacionInput.value ? ubicacionInput.value : 'No especificada';
    const anonimo = anonimoCheckbox ? anonimoCheckbox.checked : false;

    if (!historia.trim()) {
      if (errorHistoria) {
        errorHistoria.style.display = 'block';
      }
      return;
    }

    const formData = new FormData();
    formData.append('nombre', anonimo ? 'Anónimo' : nombre);
    formData.append('testimonio', historia);
    formData.append('ubicacion', ubicacion);
    formData.append('tipoEM', tipoEM);
    formData.append('anonimo', anonimo ? '1' : '0');

    if (imagenInput && imagenInput.files.length > 0) {
      formData.append('imagen', imagenInput.files[0]);
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/testimonios`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('No se pudo guardar el testimonio');
      }

      if (mensajeExito) {
        mensajeExito.style.display = 'block';
      }
      formUnirme.reset();
      if (divContador) divContador.textContent = '0/1000 caracteres';

      setTimeout(() => {
        window.location.href = './historias.html';
      }, 1800);
    } catch (err) {
      console.error('Error al guardar testimonio:', err);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar Historia ❤️';
      }
    }
  });
});
