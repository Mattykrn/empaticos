import React, { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

function formatoFecha(fecha) {
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Historias page: loads stories from the Node backend.
 * If the backend is offline, it falls back to a static sample story.
 */
export default function Historias() {
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
