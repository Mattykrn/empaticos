import React, { useEffect, useMemo, useState } from 'react';
import useEntries from '../hooks/useEntries';
import { resolveMediaUrl } from '../api';

/**
 * Galeria page: fotos de la comunidad con lightbox para verlas en grande.
 */
export default function Galeria() {
  const { entries, loading, error, reload } = useEntries('galeria');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const photos = useMemo(() => {
    const items = [];
    for (const entry of entries) {
      for (const url of entry.mediaUrls || []) {
        items.push({ url, caption: entry.title || '' });
      }
    }
    return items;
  }, [entries]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    function onKey(event) {
      if (event.key === 'Escape') setLightboxIndex(null);
      if (event.key === 'ArrowRight') nextPhoto();
      if (event.key === 'ArrowLeft') prevPhoto();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function nextPhoto() {
    setLightboxIndex((idx) => (idx + 1) % photos.length);
  }

  function prevPhoto() {
    setLightboxIndex((idx) => (idx - 1 + photos.length) % photos.length);
  }

  const current = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-4">
        <h1 className="fw-bold display-5 text-warning mb-3">Galería de la Comunidad 📷</h1>
        <p className="lead text-muted">Momentos, encuentros y pequeñas grandes cosas que comparte nuestra comunidad.</p>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
          <button className="btn btn-sm btn-warning ms-3 fw-bold" onClick={reload}>Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando galería...</span>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 fw-bold text-muted">Aún no hay fotos en la galería. ¡Compartí los tuyos!</p>
          <a href="#/unirme" className="btn btn-warning btn-lg px-4 fw-bold btn-glow">Subir fotos</a>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              className="gallery-item"
              onClick={() => setLightboxIndex(index)}
              aria-label="Ampliar foto"
            >
              <img src={resolveMediaUrl(photo.url)} alt={photo.caption || `Foto ${index + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {current && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightboxIndex(null);
          }}
        >
          <button type="button" className="lightbox-close" onClick={() => setLightboxIndex(null)} aria-label="Cerrar">✕</button>
          <button type="button" className="lightbox-nav lightbox-prev" onClick={prevPhoto} aria-label="Foto anterior">‹</button>
          <figure className="lightbox-content">
            <img src={resolveMediaUrl(current.url)} alt={current.caption || 'Foto de la comunidad'} />
            {current.caption && <figcaption className="lightbox-caption">{current.caption}</figcaption>}
          </figure>
          <button type="button" className="lightbox-nav lightbox-next" onClick={nextPhoto} aria-label="Foto siguiente">›</button>
        </div>
      )}
    </main>
  );
}
