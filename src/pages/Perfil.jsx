import React, { useState, useEffect, useMemo } from 'react';
import EntradaCard from '../components/EntradaCard';
import useEntries from '../hooks/useEntries';
import { useProfile } from '../context/ProfileContext';
import { useFavorites } from '../context/FavoritesContext';
import { getMyEntries, initialsOf } from '../api';

const TABS = [
  { value: 'entries', label: 'Mis publicaciones' },
  { value: 'favorites', label: 'Mis favoritos' },
  { value: 'comments', label: 'Mis comentarios' },
];

/**
 * Perfil page: una vista simple de la actividad del visitante.
 */
export default function Perfil() {
  const { profile, visitorId, displayName, openModal } = useProfile();
  const { entryIds } = useFavorites();
  const { entries: allEntries, loading: loadingAll } = useEntries();
  const [myEntries, setMyEntries] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);
  const [tab, setTab] = useState('entries');

  useEffect(() => {
    let mounted = true;
    getMyEntries(visitorId)
      .then((data) => {
        if (mounted) setMyEntries(data.entries || []);
      })
      .catch(() => {
        if (mounted) setMyEntries([]);
      })
      .finally(() => {
        if (mounted) setLoadingMine(false);
      });
    return () => {
      mounted = false;
    };
  }, [visitorId]);

  const favorites = useMemo(
    () => allEntries.filter((e) => entryIds.includes(String(e.id))),
    [allEntries, entryIds]
  );

  const commented = useMemo(
    () =>
      allEntries
        .map((entry) => {
          const mine = (entry.comments || []).filter((c) => c.visitorId === visitorId);
          return mine.length > 0 ? { entry, comments: mine } : null;
        })
        .filter(Boolean),
    [allEntries, visitorId]
  );

  const loading = tab === 'entries' ? loadingMine : loadingAll;

  function renderList() {
    if (loading) {
      return (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      );
    }

    if (tab === 'entries') {
      if (myEntries.length === 0) {
        return (
          <EmptyState text="Aún no publicaste nada. ¡Compartí tu primera historia!" link="#/unirme" cta="Publicar ahora" />
        );
      }
      return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {myEntries.map((entry) => (
            <div key={entry.id} className="col">
              <EntradaCard entry={entry} showStatus />
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'favorites') {
      if (favorites.length === 0) {
        return (
          <EmptyState text="No tenés entradas favoritas todavía. Tocá la estrella en cualquier publicación." link="#/historias" cta="Explorar historias" />
        );
      }
      return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {favorites.map((entry) => (
            <div key={entry.id} className="col">
              <EntradaCard entry={entry} />
            </div>
          ))}
        </div>
      );
    }

    if (tab === 'comments') {
      if (commented.length === 0) {
        return <EmptyState text="Aún no comentaste ninguna publicación." link="#/historias" cta="Ir a las historias" />;
      }
      return (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {commented.map(({ entry }) => (
            <div key={entry.id} className="col">
              <EntradaCard entry={entry} />
            </div>
          ))}
        </div>
      );
    }

    return null;
  }

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5 text-warning mb-3">Mi Perfil 👤</h1>
        <p className="lead text-muted">Tus publicaciones, favoritos y comentarios en EMpaticos.</p>
      </div>

      <div className="card card-modern p-4 mb-4 text-center mx-auto" style={{ maxWidth: 520 }}>
        <span className={`avatar-circle avatar-risa mx-auto mb-3`} style={{ width: 72, height: 72, fontSize: '1.8rem' }}>
          {profile.avatar || initialsOf(displayName)}
        </span>
        <h2 className="fw-bold mb-1">{displayName}</h2>
        <p className="text-muted small mb-3">Identificador: {visitorId.slice(0, 18)}…</p>
        <button type="button" className="btn btn-warning fw-bold btn-glow" onClick={openModal}>
          Editar perfil
        </button>
      </div>

      <div className="d-flex justify-content-center flex-wrap gap-2 mb-4">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`filter-chip ${tab === t.value ? 'active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.label}
            <span className="ms-1">({countFor(t.value)})</span>
          </button>
        ))}
      </div>

      {renderList()}
    </main>
  );

  function countFor(value) {
    if (value === 'entries') return myEntries.length;
    if (value === 'favorites') return favorites.length;
    if (value === 'comments') return commented.length;
    return 0;
  }
}

function EmptyState({ text, link, cta }) {
  return (
    <div className="text-center py-5">
      <p className="fs-5 fw-bold text-muted">{text}</p>
      <a href={link} className="btn btn-warning fw-bold btn-glow">{cta}</a>
    </div>
  );
}
