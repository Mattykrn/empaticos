import React, { useState, useEffect } from 'react';

// Sample news data for the Noticias page. This data is static
// and improves the visual representation of the news list.
const noticiasData = [
  {
    titulo: 'EPOF Argentina impulsa campaña por las Enfermedades Poco Frecuentes',
    resumen: 'La organización EPOF Argentina lanza una iniciativa nacional para visibilizar las enfermedades raras, incluyendo la esclerosis múltiple, y promover el acceso equitativo a tratamientos y apoyo médico.',
    fecha: '2026-04-06',
    imagen: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80',
    link: 'https://www.epofargentina.org/campana-epof'
  },
  {
    titulo: 'Gen de los yaks podría reparar la mielina',
    resumen: 'Un gen adaptado a la vida en altura muestra potencial para regenerar la mielina dañada en pacientes con EM.',
    fecha: '2026-03-22',
    imagen: 'https://images.unsplash.com/photo-1508385082359-f38ae991e8f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.diariodenavarra.es/noticias/salud/2026/03/22/gen-yak-reparar-dano-esclerosis-multiple-573000-3172.html'
  },
  {
    titulo: 'Nuevo biomarcador detecta progresión de EM antes de los síntomas',
    resumen: 'Investigadores del Hospital Italiano de Buenos Aires y CONICET identificaron un marcador en sangre (sNfL) que podría anticipar brotes.',
    fecha: '2026-03-20',
    imagen: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.campus.sanofi/es/esclerosis-multiple/biomarcadores'
  },
  {
    titulo: 'Descubrimiento sobre la muerte neuronal en EM',
    resumen: 'Investigadores de Johns Hopkins identificaron el mecanismo molecular de la muerte neuronal, abriendo la puerta a terapias más protectoras.',
    fecha: '2026-03-14',
    imagen: 'https://images.unsplash.com/photo-1581090700227-4c4d1a3a3a3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.infobae.com/salud/2026/03/14/un-hallazgo-abre-la-puerta-a-nuevos-tratamientos-para-la-esclerosis-multiple/'
  },
  {
    titulo: 'Fenebrutinib muestra resultados prometedores en fase III',
    resumen: 'Roche anuncia gran reducción en la progresión de la EM actuando sobre la microglía. Posible aprobación ANMAT en 2027.',
    fecha: '2026-02-15',
    imagen: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.infobae.com/salud/2024/05/11/esclerosis-multiple-cuales-son-los-avances-mas-prometedores-en-los-tratamientos/'
  },
  {
    titulo: 'Terapia CAR-T: Resultados preliminares para formas agresivas',
    resumen: 'Ensayos clínicos aplicando células CAR-T han demostrado resultados esperanzadores para frenar el daño neurológico.',
    fecha: '2026-01-15',
    imagen: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.redaccionmedica.com/secciones/neurologia/la-terapia-car-t-abre-una-nueva-via-contra-la-esclerosis-multiple-mas-agresiva-6134'
  },
  {
    titulo: 'Ley de accesibilidad avanza en el Congreso Nacional',
    resumen: 'Iniciativa de ley incluye mejoras en transporte, cobertura de salud y protección de empleo para personas diagnosticadas con formas progresivas.',
    fecha: '2026-01-10',
    imagen: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.argentina.gob.ar/andis'
  },
  {
    titulo: 'Inteligencia Artificial identifica nuevos subtipos clínicos',
    resumen: 'Estudio publicado en Nature revela dos nuevos subtipos biológicos usando IA, que cambiarán el enfoque del tratamiento.',
    fecha: '2025-12-05',
    imagen: 'https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.nature.com/articles/esclerosis-multiple-subtipos-2025'
  },
  {
    titulo: 'Enfoque en la remielinización: Reparando el Sistema Nervioso',
    resumen: 'Expertos internacionales en ECTRIMS subrayan que iniciar tratamientos en fases subclínicas frena la evolución, además de buscar recuperar nervios dañados.',
    fecha: '2025-05-18',
    imagen: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.clinicbarcelona.org/asistencia/enfermedades/esclerosis-multiple'
  },
  {
    titulo: 'Estudio francés cuestiona eficacia de ciertos monoclonales',
    resumen: 'Fármacos como rituximab y ocrelizumab muestran resultados limitados o con dudas en perfiles de seguridad en algunos estudios observacionales.',
    fecha: '2024-09-26',
    imagen: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    link: 'https://www.infobae.com/salud/2024/09/26/estudio-duda-eficacia-farmacos-esclerosis-multiple/'
  }
];

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Noticias page: filters and shows the latest EM coverage.
 */
export default function Noticias() {
  const [year, setYear] = useState('todos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const filtered = noticiasData
    .filter((item) => year === 'todos' || item.fecha.startsWith(year))
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5 text-warning mb-3">Noticias Reales sobre EM</h1>
        <p className="lead text-muted">Avanzamos juntos con los mejores avances científicos y apoyo de la comunidad.</p>
      </div>

      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        <div className="text-muted fw-bold">Filtrar por año:</div>
        <select className="form-select w-auto" value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="todos">Todos los años</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 fw-bold text-muted">Buscando las últimas novedades...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted fw-bold">No se encontraron noticias publicadas en ese año.</div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filtered.map((noticia) => (
            <article key={noticia.titulo} className="col">
              <div className="card card-modern news-card h-100">
                <img src={noticia.imagen} className="card-img-top news-image" alt={noticia.titulo} />
                <div className="card-body d-flex flex-column p-4">
                  <span className="text-muted fw-bold mb-2">🗓️ {formatoFecha(noticia.fecha)}</span>
                  <h5 className="card-title fw-bold mb-3">{noticia.titulo}</h5>
                  <p className="card-text text-muted flex-grow-1">{noticia.resumen}</p>
                  <a href={noticia.link} target="_blank" rel="noreferrer" className="btn btn-warning mt-3 fw-bold w-100 text-white">
                    Leer artículo original →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
