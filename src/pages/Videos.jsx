import React from 'react';
import EntradaCard from '../components/EntradaCard';
import useEntries from '../hooks/useEntries';

/**
 * Videos page: contenido audiovisual educativo y motivador
 * seleccionado por la comunidad.
 */
export default function Videos() {
  const { entries, loading, error, reload } = useEntries('video');

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-4">
        <h1 className="fw-bold display-5 text-warning mb-3">Videos y Aprendizaje 🎬</h1>
        <p className="lead text-muted">Contenido audiovisual para informarte, inspirarte y entender la esclerosis múltiple desde diferentes voces.</p>
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
            <span className="visually-hidden">Cargando videos...</span>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 fw-bold text-muted">Aún no hay videos publicados. ¡Compartí uno que te haya ayudado!</p>
          <a href="#/unirme" className="btn btn-warning btn-lg px-4 fw-bold btn-glow">Compartir un video</a>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 g-4">
          {entries.map((entry) => (
            <div key={entry.id} className="col">
              <EntradaCard entry={entry} onError={reload} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
