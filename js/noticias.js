// ==================== NOTICIAS - Clase 14 + 18 + 20 ====================
// Matii: Uso array + map + filter para renderizar dinámicamente (como vimos en las clases)

const noticias = [
  {
    titulo:
      "EPOF Argentina impulsa campaña por las Enfermedades Poco Frecuentes",
    resumen:
      "La organización EPOF Argentina lanza una iniciativa nacional para visibilizar las enfermedades raras, incluyendo la esclerosis múltiple, y promover el acceso equitativo a tratamientos y apoyo médico.",
    fecha: "2026-04-06",
    imagen:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    link: "https://www.epofargentina.org/campana-epof",
  },
  {
    titulo: "Gen de los yaks podría reparar la mielina",
    resumen:
      "Un gen adaptado a la vida en altura muestra potencial para regenerar la mielina dañada en pacientes con EM.",
    fecha: "2026-03-22",
    imagen:
      "https://images.unsplash.com/photo-1508385082359-f38ae991e8f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.diariodenavarra.es/noticias/salud/2026/03/22/gen-yak-reparar-dano-esclerosis-multiple-573000-3172.html",
  },
  {
    titulo: "Nuevo biomarcador detecta progresión de EM antes de los síntomas",
    resumen:
      "Investigadores del Hospital Italiano de Buenos Aires y CONICET identificaron un marcador en sangre (sNfL) que podría anticipar brotes.",
    fecha: "2026-03-20",
    imagen:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.campus.sanofi/es/esclerosis-multiple/biomarcadores",
  },
  {
    titulo: "Descubrimiento sobre la muerte neuronal en EM",
    resumen:
      "Investigadores de Johns Hopkins identificaron el mecanismo molecular de la muerte neuronal, abriendo la puerta a terapias más protectoras.",
    fecha: "2026-03-14",
    imagen:
      "https://images.unsplash.com/photo-1581090700227-4c4d1a3a3a3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.infobae.com/salud/2026/03/14/un-hallazgo-abre-la-puerta-a-nuevos-tratamientos-para-la-esclerosis-multiple/",
  },
  {
    titulo: "Fenebrutinib muestra resultados prometedores en fase III",
    resumen:
      "Roche anuncia gran reducción en la progresión de la EM actuando sobre la microglía. Posible aprobación ANMAT en 2027.",
    fecha: "2026-02-15",
    imagen:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.infobae.com/salud/2024/05/11/esclerosis-multiple-cuales-son-los-avances-mas-prometedores-en-los-tratamientos/",
  },
  {
    titulo: "Terapia CAR-T: Resultados preliminares para formas agresivas",
    resumen:
      "Ensayos clínicos aplicando células CAR-T han demostrado resultados esperanzadores para frenar el daño neurológico.",
    fecha: "2026-01-15",
    imagen:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.redaccionmedica.com/secciones/neurologia/la-terapia-car-t-abre-una-nueva-via-contra-la-esclerosis-multiple-mas-agresiva-6134",
  },
  {
    titulo: "Ley de accesibilidad avanza en el Congreso Nacional",
    resumen:
      "Iniciativa de ley incluye mejoras en transporte, cobertura de salud y protección de empleo para personas diagnosticadas con formas progresivas.",
    fecha: "2026-01-10",
    imagen:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.argentina.gob.ar/andis",
  },
  {
    titulo: "Inteligencia Artificial identifica nuevos subtipos clínicos",
    resumen:
      "Estudio publicado en Nature revela dos nuevos subtipos biológicos usando IA, que cambiarán el enfoque del tratamiento.",
    fecha: "2025-12-05",
    imagen:
      "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.nature.com/articles/esclerosis-multiple-subtipos-2025",
  },
  {
    titulo: "Enfoque en la remielinización: Reparando el Sistema Nervioso",
    resumen:
      "Expertos internacionales en ECTRIMS subrayan que iniciar tratamientos en fases subclínicas frena la evolución, además de buscar recuperar nervios dañados.",
    fecha: "2025-05-18",
    imagen:
      "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.clinicbarcelona.org/asistencia/enfermedades/esclerosis-multiple",
  },
  {
    titulo: "Estudio francés cuestiona eficacia de ciertos monoclonales",
    resumen:
      "Fármacos como rituximab y ocrelizumab muestran resultados limitados o con dudas en perfiles de seguridad en algunos estudios observacionales.",
    fecha: "2024-09-26",
    imagen:
      "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.infobae.com/salud/2024/09/26/estudio-duda-eficacia-farmacos-esclerosis-multiple/",
  },
];

function cargarNoticias() {
  const container = document.getElementById("noticias-container");
  const loading = document.getElementById("loading-noticias");
  const error = document.getElementById("error-noticias");
  const filtroSelect = document.getElementById("filtro-anio");

  if (!container) return;

  function renderizarNoticias(filtro = "todos") {
    container.innerHTML = "";
    if (loading) loading.style.display = "none";
    if (error) error.style.display = "none";

    const filtradas =
      filtro === "todos"
        ? noticias
        : noticias.filter((n) => n.fecha.startsWith(filtro));

    if (filtradas.length === 0) {
      container.innerHTML = `<p class="col-12 text-center text-muted fw-bold mt-5 fs-5">No se encontraron noticias publicadas en ese año.</p>`;
      return;
    }

    // Ordenar de más reciente a más antigua
    filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    filtradas.forEach((noticia, index) => {
      // Intentamos parsear la fecha para que se vea linda
      const dateParts = noticia.fecha.split("-");
      const formatedDate =
        dateParts.length === 3
          ? new Date(
              dateParts[0],
              dateParts[1] - 1,
              dateParts[2],
            ).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : noticia.fecha;

      const col = document.createElement("div");
      col.className = "col";

      // Si la noticia no tenía imagen definida explícita, usamos un placeholder premium genérico
      const imagenUrl =
        noticia.imagen ||
        "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=500&q=80";

      col.innerHTML = `
        <div class="card h-100 shadow-sm border-0 rounded-4 text-start" style="background-color: #FAFAFA; animation-delay: ${index * 0.1}s">
          <img src="${imagenUrl}" class="card-img-top news-image" alt="${noticia.titulo}" style="object-fit: cover; height: 200px; width: 100%; border-radius: 16px 16px 0 0;">
          <div class="card-body d-flex flex-column p-4">
            <span style="font-size:0.85rem;" class="text-muted fw-bold mb-2">🗓️ ${formatedDate}</span>
            <h5 class="card-title fw-bold text-dark mb-3" style="font-size: 1.25rem;">${noticia.titulo}</h5>
            <p class="card-text text-muted flex-grow-1">${noticia.resumen}</p>
            <a href="${noticia.link}" target="_blank" class="btn btn-warning mt-3 fw-bold w-100 news-link" style="color:white; border-radius: 8px;">Leer artículo original →</a>
          </div>
        </div>
      `;

      container.appendChild(col);
    });
  }

  // Escuchamos el select para filtrar:
  if (filtroSelect) {
    filtroSelect.addEventListener("change", (e) => {
      renderizarNoticias(e.target.value);
    });
  }

  // Simulamos carga para darle estética profesional
  setTimeout(() => {
    renderizarNoticias("todos");
  }, 600);
}

// Ejecutar directamente cuando el script cargue
document.addEventListener("DOMContentLoaded", cargarNoticias);
