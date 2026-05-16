// main.js - Acá centralizo la lógica principal del sitio
import { crearContadorVisitas } from './contadores.js';

const API_BASE_URL = window.location.origin;

// Si existe el contador, lo inicializo apenas carga el script
if (document.getElementById('contador-visitas')) {
  try {
    const incrementar = crearContadorVisitas();
    incrementar();
  } catch(e) { console.log('Contador no soportado por faltas de utilería'); }
}

document.addEventListener('DOMContentLoaded', () => {
  // Dejo el mapa y la cache en este scope para reutilizarlos sin ensuciar window
  let mapa;
  const geocodeCache = new Map();

  // Esta función trae testimonios y los pinta en lista + mapa
  function cargarTestimonios() {
    const listaTestimonios = document.getElementById('lista-testimonios');
    if (!listaTestimonios || !mapa) return;

    fetch(`${API_BASE_URL}/api/testimonios`)
      .then(response => response.json())
      .then(testimonios => {
        listaTestimonios.innerHTML = '<h3>Testimonios recientes</h3>';

        const fragment = document.createDocumentFragment();
        testimonios.forEach(test => {
          const nuevoTestimonio = document.createElement('div');
          nuevoTestimonio.innerHTML = `
            <h4>${test.nombre}</h4>
            <p>${test.testimonio}</p>
            <p><strong>Ubicación:</strong> ${test.ubicacion}</p>
            ${test.foto ? `<img src="${API_BASE_URL}${test.foto}" alt="Imagen de ${test.nombre}" style="max-width: 200px;">` : ''}
          `;
          fragment.appendChild(nuevoTestimonio);
        });
        listaTestimonios.appendChild(fragment);

        testimonios.forEach(async (test) => {
          if (!test.ubicacion) return;

          let point = geocodeCache.get(test.ubicacion);
          if (!point) {
            try {
              const geoResponse = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(test.ubicacion)}`);
              const data = await geoResponse.json();
              if (data.length === 0) return;

              point = { lat: data[0].lat, lon: data[0].lon };
              geocodeCache.set(test.ubicacion, point);
            } catch (e) {
              return;
            }
          }

          L.marker([point.lat, point.lon]).addTo(mapa)
            .bindPopup(`<strong>${test.nombre}</strong><br>${test.testimonio}`);
        });
      })
      .catch(err => console.error('Error al cargar testimonios:', err));
  }

  const contadorElemento = document.getElementById('contador');
  if (contadorElemento) {
    let visitas = localStorage.getItem('visitas') || 0;
    visitas++;
    localStorage.setItem('visitas', visitas);
    contadorElemento.textContent = visitas;
  }

  // Inicializo Leaflet solo si la sección del mapa existe en la página actual
  function inicializarMapa() {
    const mapaHistorias = document.getElementById('mapa-historias');
    if (!mapaHistorias || typeof L === 'undefined') return false;

    mapa = L.map('mapa-historias').setView([0, 0], 2); // Vista inicial global

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapa);

    return true;
  }

  const mapaInicializado = inicializarMapa();

  // Si el mapa arrancó bien, recién ahí cargo testimonios
  if (mapaInicializado) {
    cargarTestimonios();
  }

  const personita = document.getElementById('personita');
  const mapaHistorias = document.getElementById('mapa-historias');

  // Este bloque mueve la "personita" sin saturar el render (usa requestAnimationFrame)
  if (mapaHistorias) {
    let animationFrame = null;
    let lastEvent = null;

    mapaHistorias.addEventListener('mousemove', (e) => {
      if (!personita) return;

      lastEvent = e;
      if (animationFrame !== null) return;

      animationFrame = requestAnimationFrame(() => {
        if (!lastEvent) {
          animationFrame = null;
          return;
        }

        personita.style.display = 'block';
        personita.style.left = `${lastEvent.offsetX - 15}px`;
        personita.style.top = `${lastEvent.offsetY - 15}px`;
        animationFrame = null;
      });
    });

    mapaHistorias.addEventListener('mouseleave', () => {
      if (personita) {
        personita.style.display = 'none';
      }
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      lastEvent = null;
    });
  }

  // Si estoy en una vista con formulario, capturo envío y publico en backend
  const formTestimonio = document.getElementById('form-testimonio');
  const listaTestimonios = document.getElementById('lista-testimonios');

  if (formTestimonio && listaTestimonios) {
    formTestimonio.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value;
      const testimonio = document.getElementById('testimonio').value;
      const ubicacion = document.getElementById('ubicacion').value;
      const imagenInput = document.getElementById('imagen');

      if (imagenInput.files.length > 0) {
        // Armo el FormData porque incluye texto + archivo
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('testimonio', testimonio);
        formData.append('ubicacion', ubicacion);
        formData.append('imagen', imagenInput.files[0]);

        // Envío al backend local
        fetch(`${API_BASE_URL}/api/testimonios`, {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            console.log('Testimonio guardado:', data);
            // Vuelvo a cargar para reflejar el cambio al instante
            cargarTestimonios();
          })
          .catch(err => console.error('Error al guardar testimonio:', err));
      }

      formTestimonio.reset();
    });
  }

  // Este helper abre la red elegida con la URL actual ya codificada
  window.compartirEnRedes = function (red) {
    const url = encodeURIComponent(window.location.href);
    const texto = encodeURIComponent('¡Mira esta página increíble!');

    let enlace = '';
    if (red === 'facebook') {
      enlace = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (red === 'twitter') {
      enlace = `https://twitter.com/intent/tweet?url=${url}&text=${texto}`;
    }

    if (enlace) {
      window.open(enlace, '_blank');
    }
  };
});