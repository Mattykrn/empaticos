import React, { useState, useEffect } from 'react';

/**
 * Nosotros page content. Shows mission, vision and a count placeholder.
 */
export default function Nosotros() {
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
