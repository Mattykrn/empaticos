import React, { useState } from 'react';

/**
 * Admin page. Includes a simple password check for local administration.
 */
export default function Admin() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (password === 'EMpaticos2025arg') {
      setLoggedIn(true);
      setMessage('Ingreso correcto. Aquí estará el panel de administración en React.');
    } else {
      setMessage('Contraseña incorrecta. Intentá de nuevo.');
    }
  }

  function handleLogout() {
    setLoggedIn(false);
    setPassword('');
    setMessage('Sesión cerrada.');
  }

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5 text-warning mb-3">Panel Admin</h1>
        <p className="lead text-muted">Accedé de forma segura y mirá los próximos pasos del sitio.</p>
      </div>

      {!loggedIn ? (
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card card-modern shadow-sm rounded-4 border-0 p-4">
              <h3 className="fw-bold mb-4">Acceso Reservado</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <input
                    type="password"
                    className="form-control form-control-lg text-center"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña maestra"
                  />
                </div>
                <button type="submit" className="btn btn-warning btn-lg w-100 fw-bold btn-glow">Entrar de forma segura</button>
              </form>
              {message && <p className="text-danger text-center mt-3">{message}</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="card card-modern shadow-sm rounded-4 border-0 p-4">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-column flex-md-row gap-3">
            <div>
              <h3 className="fw-bold">Administrador</h3>
              <p className="text-muted mb-0">Por ahora tengo solo el acceso de prueba. En el próximo paso voy a integrar Firebase aquí.</p>
            </div>
            <button className="btn btn-outline-secondary" onClick={handleLogout}>Cerrar sesión</button>
          </div>
          <p className="text-muted">Funcionalidad futura: aprobar historias, revisar mensajes y ver estadísticas.</p>
        </div>
      )}
    </main>
  );
}
