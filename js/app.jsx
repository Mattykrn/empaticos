/*
  js/app.jsx
  Main React Single Page Application for EMpaticos.
  This file defines the SPA shell, page routes, data flow,
  and backend integration for story submission and display.
*/

const { useState, useEffect } = React;
const { HashRouter, Routes, Route, NavLink, useLocation } = ReactRouterDOM;

// API base URL for the Node backend.
// If `window.EMPATICOS_API_BASE` is set in index.html, the app uses it.
// If the placeholder remains, hace fallback al backend local.
const API_PLACEHOLDER = 'https://TU_BACKEND_URL/api';
const API_BASE = window.EMPATICOS_API_BASE && window.EMPATICOS_API_BASE !== API_PLACEHOLDER
  ? window.EMPATICOS_API_BASE
  : 'http://localhost:4000/api';

// Navigation items shown in the header menu.
const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Noticias', path: '/noticias' },
  { label: 'Unirme', path: '/unirme' },
  { label: 'Historias', path: '/historias' },
  { label: 'Nosotros', path: '/nosotros' },
  { label: 'Admin', path: '/admin' }
];

function ThemeToggle({ darkMode, onToggle }) {
  const icon = darkMode ? '☀️' : '🌙';
  const label = darkMode ? 'Modo claro' : 'Modo oscuro';
  return (
    <button
      type="button"
      className={`btn ${darkMode ? 'btn-outline-light' : 'btn-outline-secondary'} btn-sm rounded-pill btn-glow d-flex align-items-center gap-2`}
      onClick={onToggle}
      title="Cambiar modo claro/oscuro"
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

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

/**
 * Utility to format a date string into Spanish locale.
 * @param {string} fecha - ISO-style date string.
 * @returns {string} Localized date text.
 */
function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * ScrollToTop ensures the app always scrolls to the top when the route changes.
 * This improves the navigation experience in a single-page app.
 */
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

/**
 * Header renders the top navigation bar and the support button.
 * It uses NavLink so the app can navigate without full page reloads.
 */
function Header({ darkMode, onToggleTheme }) {
  return (
    <header>
      <nav className="navbar navbar-expand-lg fixed-top">
        <div className="container">
          <NavLink to="/" className="navbar-brand d-flex align-items-center">
            <img src="./images/LogoEMpaticos2.png" alt="EMpaticos" height="50" className="me-3" />
            <span className="fw-bold fs-3">EMpaticos</span>
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Mostrar navegación"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-center">
              {navItems.map((item) => (
                <li key={item.path} className="nav-item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link fw-bold ${isActive ? 'active' : ''}`}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
              <li className="nav-item ms-lg-4 d-flex align-items-center mt-4 mt-lg-0 pb-2 pb-lg-0">
                <div className="gtranslate_wrapper me-3"></div>
                <a
                  className="nav-link text-white mx-2 p-0"
                  href="https://instagram.com/em.paticos2026"
                  target="_blank"
                  rel="noreferrer"
                  title="Nuestro Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.036 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z" />
                  </svg>
                </a>
                <ThemeToggle darkMode={darkMode} onToggle={onToggleTheme} />
                <button className="btn btn-warning rounded-pill px-4 ms-3 fw-bold shadow-sm btn-glow" data-bs-toggle="modal" data-bs-target="#modalApoyo">
                  Apoyarnos 🤎
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

/**
 * Home page content. This is the landing section users first see.
 */
function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="eyebrow text-warning fw-bold mb-3 d-inline-block">Comunidad para Esclerosis Múltiple</span>
              <h1 className="display-3 fw-bold mb-4">No estás solo ❤️</h1>
              <p className="lead mb-4 text-white-75">Tu espacio premium de apoyo y comprensión para Esclerosis Múltiple. Historias reales, noticias actuales y recursos para acompañarte con una experiencia moderna.</p>
              <div className="d-flex flex-column flex-sm-row gap-3">
                <NavLink to="/unirme" className="btn btn-light btn-lg fw-bold shadow-sm btn-glow">Compartir mi historia</NavLink>
                <NavLink to="/historias" className="btn btn-outline-light btn-lg fw-bold btn-glow">Leer testimonios</NavLink>
              </div>
            </div>
            <div className="col-lg-5 mt-5 mt-lg-0">
              <div className="video-wrapper shadow-soft rounded-4 overflow-hidden">
                <div className="ratio ratio-16x9">
                  <iframe
                    src="https://www.youtube.com/embed/gbkrlXuzodU"
                    title="Qué es la EM"
                    allow="fullscreen"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container section-card">
        <div className="text-center mb-4">
          <h2 className="fw-bold page-title">Bienvenido a EMpaticos</h2>
          <p className="text-muted">Compartimos historias reales, noticias y esperanza. Explorá nuestras secciones y sentite parte de una gran comunidad.</p>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-sm-6 col-lg-4">
            <div className="card card-modern p-4 h-100">
              <div className="mb-3 avatar-circle bg-warning text-white">1</div>
              <h3 className="h5 fw-bold">Compartí tu voz</h3>
              <p className="text-muted">Tu historia puede inspirar a otra persona con Esclerosis Múltiple.</p>
            </div>
          </div>
          <div className="col-sm-6 col-lg-4">
            <div className="card card-modern p-4 h-100">
              <div className="mb-3 avatar-circle bg-light">2</div>
              <h3 className="h5 fw-bold">Noticias confiables</h3>
              <p className="text-muted">Actualizaciones científicas y sociales para mantenerte informado.</p>
            </div>
          </div>
          <div className="col-sm-6 col-lg-4">
            <div className="card card-modern p-4 h-100">
              <div className="mb-3 avatar-circle bg-light">3</div>
              <h3 className="h5 fw-bold">Apoyo real</h3>
              <p className="text-muted">Conectate con una comunidad que entiende lo que estás viviendo.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

/**
 * Noticias page: filters and shows the latest EM coverage.
 */
function Noticias() {
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

/**
 * Historias page: loads stories from the Node backend.
 * If the backend is offline, it falls back to a static sample story.
 */
function Historias() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fallbackStories = [
    {
      id: 1,
      name: 'Matías',
      type: 'EMRR',
      story: 'Bienvenido a la sección de Historias. A partir de ahora, cuando alguien llene el formulario de "Unirme", te llegará directamente a tu correo de Gmail (matii.toorres.06@gmail.com). Luego, copiás lo que te mandaron acá adentro del código y aparecerá mágicamente.',
      createdAt: '2026-03-26T00:00:00Z'
    }
  ];

  useEffect(() => {
    async function fetchStories() {
      try {
        const response = await fetch(`${API_BASE}/stories`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        setStories(data.stories || fallbackStories);
      } catch (err) {
        setError('No se pudo conectar al backend. Mostrando historias de ejemplo.');
        setStories(fallbackStories);
      } finally {
        setLoading(false);
      }
    }

    fetchStories();
  }, []);

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5 text-warning mb-3">Historias Reales ❤️</h1>
        <p className="lead text-muted">Testimonios de nuestra comunidad que inspiran, emocionan y acompañan.</p>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando historias...</span>
          </div>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {stories.map((story) => (
            <div key={story.id} className="col">
              <article className="card card-modern story-card h-100 d-flex flex-column">
                <div className="card-body">
                  <h5 className="card-title fw-bold">{story.name || 'Amigo EMpaticos'}</h5>
                  <h6 className="card-subtitle mb-3 text-warning fw-bold">{story.type || 'Historia EM'}</h6>
                  <p className="card-text text-secondary mb-4" style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                    {story.story}
                  </p>
                </div>
                <footer className="card-footer bg-transparent border-0 mt-auto text-end pb-3">
                  <small className="text-muted fw-bold">{formatoFecha(story.createdAt)}</small>
                </footer>
              </article>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 text-center section-note">
        <p className="mb-1">Nota: ahora el formulario envía historias a un backend Node.js local.</p>
        <p className="mb-0">Si el servidor no está activo, verás un ejemplo estático hasta que lo inicies.</p>
      </div>
    </main>
  );
}

/**
 * Unirme page: sends new story submissions to the Node backend.
 */
function Unirme() {
  const [formState, setFormState] = useState({
    nombre: '',
    tipoEM: '',
    historia: '',
    anonimo: false
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setStatus('Enviando historia...');

    try {
      const response = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formState.nombre || 'Anónimo',
          type: formState.tipoEM,
          story: formState.historia,
          anonymous: formState.anonimo
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      setStatus('Historia enviada con éxito. Gracias por compartir.');
      setFormState({ nombre: '', tipoEM: '', historia: '', anonimo: false });
    } catch (error) {
      setStatus('No se pudo enviar la historia. Asegurate de que el backend esté activo en localhost:4000.');
    } finally {
      setSending(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5">Unirme a EMpaticos ❤️</h1>
        <p className="lead text-muted">Compartí tu historia y ayudá a otros a sentirse acompañados.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-modern form-card shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Tu nombre (opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Matías"
                  value={formState.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="tipoEM" className="form-label">Tipo de Esclerosis Múltiple *</label>
                <select
                  className="form-select"
                  id="tipoEM"
                  name="tipoEM"
                  required
                  value={formState.tipoEM}
                  onChange={handleChange}
                >
                  <option value="">Seleccioná tu fenotipo...</option>
                  <option value="SCA">Síndrome clínico aislado (SCA)</option>
                  <option value="EMRR">Remitente-recurrente (EMRR)</option>
                  <option value="EMPP">Primaria progresiva (EMPP)</option>
                  <option value="EMSP">Secundaria progresiva (EMSP)</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="historia" className="form-label">Tu testimonio *</label>
                <textarea
                  className="form-control"
                  id="historia"
                  name="historia"
                  rows="7"
                  required
                  placeholder="Contanos tu experiencia..."
                  value={formState.historia}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="anonimo-checkbox"
                  name="anonimo"
                  checked={formState.anonimo}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="anonimo-checkbox">Quiero permanecer anónimo</label>
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-warning btn-lg px-5 btn-glow" disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar Historia al backend'}
                </button>
              </div>
            </form>
            {status && <p className="text-muted text-center mt-4">{status}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Nosotros page content. Shows mission, vision and a count placeholder.
 */
function Nosotros() {
  const [storyCount, setStoryCount] = useState(0);

  useEffect(() => {
    // Example placeholder: this can be replaced with a real count from the backend.
    setStoryCount(0);
  }, []);

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5 text-warning mb-3">Quiénes Somos ❤️</h1>
        <p className="lead text-muted">Conocé nuestra misión, visión y el propósito humano que impulsa EMpaticos.</p>
      </div>

      <div className="highlight-panel text-center mb-5">
        <p className="lead mb-1">Ya tenemos</p>
        <div className="fw-bold display-6 text-warning">{storyCount}</div>
        <p className="mb-0">historias compartidas en esta comunidad.</p>
      </div>

      <div className="row g-4 justify-content-center">
        <div className="col-md-5">
          <div className="card card-modern h-100 text-center p-4">
            <div className="mb-3 display-4">🎯</div>
            <h2 className="text-warning">Nuestra Misión</h2>
            <p className="text-muted mt-2">Crear un espacio seguro, moderno y lleno de amor donde podamos compartir experiencias, aprender de expertos y sentir que nunca estamos solos en este camino.</p>
          </div>
        </div>
        <div className="col-md-5">
          <div className="card card-modern h-100 text-center p-4">
            <div className="mb-3 display-4">👁️</div>
            <h2 className="text-warning">Nuestra Visión</h2>
            <p className="text-muted mt-2">Ser la comunidad premium de referencia global para apoyo emocional y empoderamiento de personas con Esclerosis Múltiple, ofreciendo herramientas reales.</p>
          </div>
        </div>
      </div>
    </main>
  );
}

/**
 * Admin page placeholder. Includes a simple password check for local administration.
 */
function Admin() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (password === 'EMpaticos2025arg') {
      setLoggedIn(true);
      setMessage('Ingreso correcto. Aquí estará el panel de administración en React.');
    } else {
      setMessage('Contraseña incorrecta. Intentá de nuevo.');
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    setPassword('');
    setMessage('Sesión cerrada.');
  }

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5 text-warning mb-3">Panel Admin</h1>
        <p className="lead text-muted">Accedé de forma segura y mirá los próximos pasos del sitio.</p>
      </div>

      {!loggedIn ? (
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card card-modern shadow-sm rounded-4 border-0 p-4">
              <h3 className="fw-bold mb-4">Acceso Reservado</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control form-control-lg text-center"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña maestra"
                  />
                </div>
                <button type="submit" className="btn btn-warning btn-lg w-100 fw-bold btn-glow">Entrar de forma segura</button>
              </form>
              {message && <p className="text-danger text-center mt-3">{message}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="card card-modern shadow-sm rounded-4 border-0 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
            <div>
              <h3 className="fw-bold">Administrador</h3>
              <p className="text-muted mb-0">Por ahora tengo solo el acceso de prueba. En el próximo paso voy a integrar Firebase aquí.</p>
            </div>
            <button className="btn btn-outline-secondary" onClick={handleLogout}>Cerrar sesión</button>
          </div>
          <p className="text-muted">Funcionalidad futura: aprobar historias, revisar mensajes y ver estadísticas.</p>
        </div>
      )}
    </main>
  );
}

/**
 * Modal for supporting the project. This is rendered once and re-used across pages.
 */
function SupportModal() {
  return (
    <div className="modal fade" id="modalApoyo" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold fs-4 ms-2 mt-2">Ayudanos a seguir creciendo 🤎</h5>
            <button type="button" className="btn-close me-2 mt-2" data-bs-dismiss="modal" aria-label="Cerrar" />
          </div>
          <div className="modal-body text-center p-4">
            <p className="text-muted mb-4">Todo aporte nos permite mantener la página online y seguir compartiendo historias. ¡Gracias de todo corazón!</p>
            <div className="card card-modern support-card border-warning mb-3">
              <div className="card-body py-3">
                <h6 className="text-warning fw-bold mb-2 text-uppercase">🇦🇷 Cuenta Argentina</h6>
                <p className="mb-1 text-muted">Alias Brubank</p>
                <h4 className="fw-bolder mb-0 user-select-all">empaticos</h4>
              </div>
            </div>
            <div className="card card-modern support-card border-danger mb-3">
              <div className="card-body py-3">
                <h6 className="fw-bold mb-2 text-uppercase text-danger">🌍 Cuenta Internacional</h6>
                <p className="mb-1 text-muted">N° de Cuenta Astropay</p>
                <h4 className="fw-bolder mb-0 user-select-all">559328471673</h4>
              </div>
            </div>
            <div className="mt-4">
              <a href="#" className="btn w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm text-white" style={{ backgroundColor: '#009EE3' }}>
                🤝 Transferir por Mercado Pago
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Footer displayed on every page.
 */
function Footer() {
  return (
    <footer>
      <div className="container py-5">
        <p className="fs-5 mb-1">EMpaticos © 2026 – No estás solo ❤️</p>
        <p className="mb-0">Contactanos: matii.toorres.06@gmail.com</p>
      </div>
    </footer>
  );
}

/**
 * NotFound page for unmatched routes.
 */
function NotFound() {
  return (
    <main className="container py-5 section-card text-center">
      <div className="card card-modern p-5 border-0 mx-auto" style={{ maxWidth: 720 }}>
        <h1 className="display-5 fw-bold mb-4">Página no encontrada</h1>
        <p className="lead text-muted mb-4">Esa ruta no existe todavía. Volvé al inicio y seguí navegando.</p>
        <NavLink to="/" className="btn btn-warning btn-lg px-4 btn-glow">Volver al home</NavLink>
      </div>
    </main>
  );
}

/**
 * App contains the shared layout and route definitions.
 */
function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = window.localStorage.getItem('empaticos-theme');
    if (stored === 'dark' || stored === 'light') {
      return stored === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const themeValue = darkMode ? 'dark' : 'light';
    document.documentElement.dataset.theme = themeValue;
    window.localStorage.setItem('empaticos-theme', themeValue);
  }, [darkMode]);

  const handleToggleTheme = () => setDarkMode((prev) => !prev);

  return (
    <>
      <Header darkMode={darkMode} onToggleTheme={handleToggleTheme} />
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/historias" element={<Historias />} />
          <Route path="/unirme" element={<Unirme />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <SupportModal />
      <Footer />
    </>
  );
}

// Render the entire React application inside the root element.
ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter>
    <ScrollToTop />
    <App />
  </HashRouter>
);
