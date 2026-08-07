import React, { useState, useEffect } from 'react';
import EntradaCard from '../components/EntradaCard';
import {
  getAllEntries,
  setEntryStatus,
  deleteEntry,
  TYPE_LABELS,
  getStats,
  loginAdmin,
  setAdminToken,
  getAdminToken,
  verifyAdminToken,
} from '../api';

const FILTERS = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'approved', label: 'Aprobadas' },
  { value: 'all', label: 'Todas' },
];

/**
 * Admin page: panel funcional para moderar el contenido de la comunidad.
 * El acceso se autentica contra el backend (/api/auth/login) o con
 * Firebase Auth en producción (FIREBASE_AUTH_ENABLED=true).
 */
export default function Admin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);
  const [loggedIn, setLoggedIn] = useState(() => Boolean(getAdminToken()));
  const [verifying, setVerifying] = useState(() => Boolean(getAdminToken()));
  const [loginMessage, setLoginMessage] = useState('');
  const [filter, setFilter] = useState('pending');
  const [entries, setEntries] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workingId, setWorkingId] = useState('');

  const adminPassword = () => window.sessionStorage.getItem('empaticos-admin-pass') || '';

  async function loadAll() {
    setLoading(true);
    setError('');
    try {
      const data = await getAllEntries(adminPassword());
      setEntries(data.entries || []);
      const statsData = await getStats();
      setStats(statsData);
    } catch (err) {
      handleActionError(err, 'No se pudieron cargar las entradas.');
    } finally {
      setLoading(false);
    }
  }

  // Verifica la sesión guardada contra /auth/verify al montar el panel.
  useEffect(() => {
    if (!getAdminToken()) {
      setVerifying(false);
      return;
    }
    verifyAdminToken()
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false))
      .finally(() => setVerifying(false));
  }, []);

  useEffect(() => {
    if (loggedIn && !verifying) {
      loadAll();
    }
  }, [loggedIn, verifying]);

  // Si el backend rechaza la sesión (401), cierra sesión automáticamente.
  function handleActionError(err, fallback) {
    if (err && err.isUnauthorized) {
      handleLogout();
      setLoginMessage(err.message || 'Sesión expirada. Iniciá sesión de nuevo.');
      return;
    }
    setError(err.message || fallback);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoginMessage('');
    setLoggingIn(true);
    try {
      let token = '';
      if (import.meta.env.VITE_FIREBASE_AUTH_ENABLED === 'true') {
        const { initializeApp } = await import('firebase/app');
        const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
        const app = initializeApp({
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        });
        const userCredential = await signInWithEmailAndPassword(getAuth(app), email, password);
        token = await userCredential.user.getIdToken();
      } else {
        const data = await loginAdmin(email, password);
        token = data.token;
      }
      setAdminToken(token);
      setLoggedIn(true);
    } catch (err) {
      setLoginMessage(err.message || 'No se pudo iniciar sesión.');
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    setAdminToken(null);
    window.sessionStorage.removeItem('empaticos-admin-pass');
    setLoggedIn(false);
    setPassword('');
    setEmail('');
    setEntries([]);
    setStats(null);
  }

  async function approve(entry) {
    setWorkingId(entry.id);
    setError('');
    try {
      await setEntryStatus(entry.id, 'approved', adminPassword());
      await loadAll();
    } catch (err) {
      handleActionError(err, 'No se pudo aprobar la entrada.');
    } finally {
      setWorkingId('');
    }
  }

  async function reject(entry) {
    setWorkingId(entry.id);
    setError('');
    try {
      await setEntryStatus(entry.id, 'pending', adminPassword());
      await loadAll();
    } catch (err) {
      handleActionError(err, 'No se pudo devolver la entrada a pendiente.');
    } finally {
      setWorkingId('');
    }
  }

  async function remove(entry) {
    if (!window.confirm('¿Seguro que querés eliminar esta entrada de forma permanente?')) {
      return;
    }
    setWorkingId(entry.id);
    setError('');
    try {
      await deleteEntry(entry.id, adminPassword());
      await loadAll();
    } catch (err) {
      handleActionError(err, 'No se pudo eliminar la entrada.');
    } finally {
      setWorkingId('');
    }
  }

  const filtered = filter === 'all'
    ? entries
    : entries.filter((e) => e.status === filter);

  const pendingCount = stats ? stats.pending : entries.filter((e) => e.status === 'pending').length;

  if (verifying) {
    return (
      <main className="container py-5 section-card">
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Verificando sesión...</span>
          </div>
          <p className="text-muted fw-bold mt-3">Verificando sesión...</p>
        </div>
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="container py-5 section-card">
        <div className="page-heading text-center mb-5">
          <h1 className="fw-bold display-5 text-warning mb-3">Panel Admin</h1>
          <p className="lead text-muted">Accedé de forma segura para moderar el contenido de la comunidad.</p>
        </div>

        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card card-modern shadow-sm rounded-4 border-0 p-4">
              <h3 className="fw-bold mb-4">Acceso Reservado</h3>
              <form onSubmit={handleLogin}>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control form-control-lg text-center"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email del admin (opcional en desarrollo)"
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control form-control-lg text-center"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña maestra"
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn btn-warning btn-lg w-100 fw-bold btn-glow" disabled={loggingIn}>
                  {loggingIn ? 'Verificando...' : 'Entrar de forma segura'}
                </button>
              </form>
              {loginMessage && <p className="text-danger text-center mt-3 fw-bold">{loginMessage}</p>}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-5 section-card">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
        <div>
          <h1 className="fw-bold display-6 text-warning mb-1">Panel Admin</h1>
          <p className="text-muted mb-0">Moderá el contenido publicado por la comunidad.</p>
        </div>
        <button className="btn btn-outline-secondary fw-bold" onClick={handleLogout}>Cerrar sesión</button>
      </div>

      {stats && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.total}</span>
              <span className="admin-stat-label">Publicadas</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.pending}</span>
              <span className="admin-stat-label">Pendientes</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.totalAll}</span>
              <span className="admin-stat-label">Total entradas</span>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="admin-stat">
              <span className="admin-stat-value">{stats.totalReactions}</span>
              <span className="admin-stat-label">Reacciones</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-warning" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-chip ${filter === f.value ? 'active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label} {f.value === 'pending' ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted fw-bold fs-5">
          ✨ No hay entradas en esta categoría.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filtered.map((entry) => (
            <div key={entry.id} className="col">
              <EntradaCard entry={entry} showStatus adminPassword={adminPassword()} onError={() => setError('No se pudo registrar la reacción.')}>
                <div className="d-flex flex-wrap gap-2 mt-auto">
                  {entry.status !== 'approved' ? (
                    <button
                      className="btn btn-success flex-fill fw-bold"
                      onClick={() => approve(entry)}
                      disabled={workingId === entry.id}
                    >
                      {workingId === entry.id ? '...' : '✓ Aprobar'}
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-secondary flex-fill fw-bold"
                      onClick={() => reject(entry)}
                      disabled={workingId === entry.id}
                    >
                      Despublicar
                    </button>
                  )}
                  <button
                    className="btn btn-danger flex-fill fw-bold"
                    onClick={() => remove(entry)}
                    disabled={workingId === entry.id}
                  >
                    ✕ Eliminar
                  </button>
                </div>
              </EntradaCard>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 text-center section-note">
        <p className="mb-0">
          Entradas de tipo: {ENTRY_TYPE_NAMES()}
        </p>
      </div>
    </main>
  );

  function ENTRY_TYPE_NAMES() {
    return Object.values(TYPE_LABELS).join(', ');
  }
}
