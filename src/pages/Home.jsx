import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * Home page component. This is the landing section users first see.
 */
export default function Home() {
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
