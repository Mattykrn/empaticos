// Acá manejo todo el flujo del formulario de unirme.html

const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
  const formUnirme = document.getElementById('form-unirme');
  const imagenInput = document.getElementById('imagen');
  const ubicacionInput = document.getElementById('ubicacion');
  const inputHistoria = document.getElementById('historia');
  const divContador = document.getElementById('contador-caracteres');

  if (!formUnirme || !inputHistoria) return;

  if (divContador) {
    inputHistoria.addEventListener('input', () => {
      divContador.textContent = `${inputHistoria.value.length}/1000 caracteres`;
    });
  }

  formUnirme.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreInput = document.getElementById('nombre');
    const anonimoCheckbox = document.getElementById('anonimo-checkbox');

    const nombre = nombreInput && nombreInput.value ? nombreInput.value : 'Anónimo';
    const historia = inputHistoria.value;
    const ubicacion = ubicacionInput && ubicacionInput.value ? ubicacionInput.value : 'No especificada';
    const anonimo = anonimoCheckbox ? anonimoCheckbox.checked : false;

    if (!historia.trim()) {
      formUnirme.submit();
      return;
    }

    if (imagenInput && imagenInput.files.length > 0) {
      const formData = new FormData();
      formData.append('nombre', anonimo ? 'Anónimo' : nombre);
      formData.append('testimonio', historia);
      formData.append('ubicacion', ubicacion);
      formData.append('imagen', imagenInput.files[0]);

      try {
        const response = await fetch(`${API_BASE_URL}/api/testimonios`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          console.error('No se pudo guardar la foto en la galería local');
        }
      } catch (err) {
        console.error('Error al guardar foto:', err);
      }
    }

    formUnirme.submit();
  });
});
