import React from 'react';
import { NavLink } from 'react-router-dom';
import EntradaCard from '../components/EntradaCard';
import useEntries from '../hooks/useEntries';

/**
 * Home page component. This is the landing section users first see.
 */
export default function Home() {
  const { entries, loading, error } = useEntries();
  const recent = entries.slice(0, 6);

  return (
    <main>
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7">
              <span className="eyebrow text-warning fw-bold mb-3 d-inline-block">Comunidad para Esclerosis Múltiple</span>
              <h1 className="display-3 fw-bold mb-4">No estás solo ❤️</h1>
              <p className="lead mb-4 text-white-75">Tu espacio premium de apoyo y comprensión para Esclerosis Múltiple. Historias reales, anécdotas que nos sacan una risa, videos y recursos para acompañarte con una experiencia moderna.</p>
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
          <p className="text-muted">Compartimos historias reales, noticias, anécdotas y esperanza. Explorá nuestras secciones y sentite parte de una gran comunidad.</p>
        </div>
        <div className="row g-4 justify-content-center">
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/historias" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-naranja">❤️</div>
                <h3 className="h5 fw-bold text-warning">Historias reales</h3>
                <p className="text-muted mb-0">Tu historia puede inspirar a otra persona con Esclerosis Múltiple.</p>
              </div>
            </NavLink>
          </div>
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/anecdotas" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-risa">😂</div>
                <h3 className="h5 fw-bold text-warning">Anécdotas divertidas</h3>
                <p className="text-muted mb-0">Los momentos graciosos de la comunidad, porque reír también sana.</p>
              </div>
            </NavLink>
          </div>
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/videos" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-azul">🎬</div>
                <h3 className="h5 fw-bold text-warning">Videos educativos</h3>
                <p className="text-muted mb-0">Aprendé y compartí contenido audiovisual sobre la esclerosis múltiple.</p>
              </div>
            </NavLink>
          </div>
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/galeria" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-galeria">📷</div>
                <h3 className="h5 fw-bold text-warning">Galería de fotos</h3>
                <p className="text-muted mb-0">Momentos de la comunidad en imágenes: encuentros y pequeñas alegrías.</p>
              </div>
            </NavLink>
          </div>
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/noticias" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-verde">📰</div>
                <h3 className="h5 fw-bold text-warning">Noticias confiables</h3>
                <p className="text-muted mb-0">Actualizaciones científicas y sociales para mantenerte informado.</p>
              </div>
            </NavLink>
          </div>
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/unirme" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-risa">✍️</div>
                <h3 className="h5 fw-bold text-warning">Unirme a la comunidad</h3>
                <p className="text-muted mb-0">Compartí tu historia, una anécdota o un video y ayudá a otros.</p>
              </div>
            </NavLink>
          </div>
          <div className="col-sm-6 col-lg-4">
            <NavLink to="/nosotros" className="text-decoration-none">
              <div className="card card-modern p-4 h-100">
                <div className="mb-3 avatar-circle avatar-naranja">💛</div>
                <h3 className="h5 fw-bold text-warning">Apoyo real</h3>
                <p className="text-muted mb-0">Conectate con una comunidad que entiende lo que estás viviendo.</p>
              </div>
            </NavLink>
          </div>
        </div>
      </section>

      <section className="container section-card">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
          <div>
            <h2 className="fw-bold page-title mb-1">Lo último de la comunidad</h2>
            <p className="text-muted mb-0">Historias, anécdotas y videos más recientes.</p>
          </div>
          <NavLink to="/historias" className="btn btn-outline-warning fw-bold">Ver todas las secciones</NavLink>
        </div>

        {error && <div className="alert alert-warning">{error}</div>}

        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-warning" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        ) : recent.length === 0 ? (
          <p className="text-center text-muted fw-bold py-4 mb-0">Todavía no hay contenido publicado. ¡Sé el primero en compartir!</p>
        ) : (
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
            {recent.map((entry) => (
              <div key={entry.id} className="col">
                <EntradaCard entry={entry} />
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
