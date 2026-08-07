import React, { useState } from 'react';
import EntradaCard from '../components/EntradaCard';
import useEntries from '../hooks/useEntries';
import { EM_TYPES } from '../api';

const FILTERS = ['Todos', ...EM_TYPES];

/**
 * Historias page: testimonios de vida de la comunidad, filtrables por
 * tipo de diagnóstico, con reacciones de apoyo.
 */
export default function Historias() {
  const { entries, loading, error, reload } = useEntries('historia');
  const [filter, setFilter] = useState('Todos');

  const filtered = filter === 'Todos'
    ? entries
    : entries.filter((e) => e.emType === filter);

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-4">
        <h1 className="fw-bold display-5 text-warning mb-3">Historias Reales ❤️</h1>
        <p className="lead text-muted">Testimonios de nuestra comunidad que inspiran, emocionan y acompañan.</p>
      </div>

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
          <button className="btn btn-sm btn-warning ms-3 fw-bold" onClick={reload}>Reintentar</button>
        </div>
      )}

      <div className="d-flex justify-content-center flex-wrap gap-2 mb-5">
        {FILTERS.map((em) => (
          <button
            key={em}
            type="button"
            className={`filter-chip ${filter === em ? 'active' : ''}`}
            onClick={() => setFilter(em)}
          >
            {em === 'Todos' ? 'Todas las historias' : em}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando historias...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5">
          <p className="fs-5 fw-bold text-muted">Aún no hay historias para este filtro.</p>
          <a href="#/unirme" className="btn btn-warning btn-lg px-4 fw-bold btn-glow">Compartí la tuya</a>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filtered.map((entry) => (
            <div key={entry.id} className="col">
              <EntradaCard entry={entry} onError={reload} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 text-center section-note">
        <p className="mb-0">¿Querés contar tu historia? Sumate desde la sección <a href="#/unirme">Unirme</a>.</p>
      </div>
    </main>
  );
}
