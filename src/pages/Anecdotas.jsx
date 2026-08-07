import React from 'react';
import EntradaCard from '../components/EntradaCard';
import useEntries from '../hooks/useEntries';

/**
 * Anecdotas page: momentos divertidos de la comunidad. El humor también
 * acompaña el camino con la esclerosis múltiple.
 */
export default function Anecdotas() {
  const { entries, loading, error, reload } = useEntries('anecdota');

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-4">
        <h1 className="fw-bold display-5 text-warning mb-3">Anécdotas Divertidas 😂</h1>
        <p className="lead text-muted">Porque reírnos juntos también es una forma de apoyo. Compartí tus momentos más graciosos con la EM.</p>
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
            <span className="visually-hidden">Cargando anécdotas...</span>
          </div>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 fw-bold text-muted">Todavía no hay anécdotas. ¡Animate a contar la tuya y nos sacamos una risa juntos!</p>
          <a href="#/unirme" className="btn btn-warning btn-lg px-4 fw-bold btn-glow">Contar una anécdota</a>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
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
