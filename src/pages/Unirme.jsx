import React, { useState } from 'react';

const API_PLACEHOLDER = 'https://TU_BACKEND_URL/api';
const API_BASE = window.EMPATICOS_API_BASE && window.EMPATICOS_API_BASE !== API_PLACEHOLDER
  ? window.EMPATICOS_API_BASE
  : 'http://localhost:4000/api';

/**
 * Unirme page: sends new story submissions to the Node backend.
 */
export default function Unirme() {
  const [formState, setFormState] = useState({
    nombre: '',
    tipoEM: '',
    historia: '',
    anonimo: false
  });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setSending(true);
    setStatus('Enviando historia...');

    try {
      const response = await fetch(`${API_BASE}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formState.nombre || 'Anónimo',
          type: formState.tipoEM,
          story: formState.historia,
          anonymous: formState.anonimo
        })
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      setStatus('Historia enviada con éxito. Gracias por compartir.');
      setFormState({ nombre: '', tipoEM: '', historia: '', anonimo: false });
    } catch (error) {
      setStatus('No se pudo enviar la historia. Asegurate de que el backend esté activo en localhost:4000.');
    } finally {
      setSending(false);
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  }

  return (
    <main className="container py-5 section-card">
      <div className="page-heading text-center mb-5">
        <h1 className="fw-bold display-5">Unirme a EMpaticos ❤️</h1>
        <p className="lead text-muted">Compartí tu historia y ayudá a otros a sentirse acompañados.</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card card-modern form-card shadow-sm p-4">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Tu nombre (opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  name="nombre"
                  placeholder="Ej: Matías"
                  value={formState.nombre}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="tipoEM" className="form-label">Tipo de Esclerosis Múltiple *</label>
                <select
                  className="form-select"
                  id="tipoEM"
                  name="tipoEM"
                  required
                  value={formState.tipoEM}
                  onChange={handleChange}
                >
                  <option value="">Seleccioná tu fenotipo...</option>
                  <option value="SCA">Síndrome clínico aislado (SCA)</option>
                  <option value="EMRR">Remitente-recurrente (EMRR)</option>
                  <option value="EMPP">Primaria progresiva (EMPP)</option>
                  <option value="EMSP">Secundaria progresiva (EMSP)</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="historia" className="form-label">Tu testimonio *</label>
                <textarea
                  className="form-control"
                  id="historia"
                  name="historia"
                  rows="7"
                  required
                  placeholder="Contanos tu experiencia..."
                  value={formState.historia}
                  onChange={handleChange}
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="anonimo-checkbox"
                  name="anonimo"
                  checked={formState.anonimo}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="anonimo-checkbox">Quiero permanecer anónimo</label>
              </div>

              <div className="text-center">
                <button type="submit" className="btn btn-warning btn-lg px-5 btn-glow" disabled={sending}>
                  {sending ? 'Enviando...' : 'Enviar Historia al backend'}
                </button>
              </div>
            </form>
            {status && <p className="text-muted text-center mt-4">{status}</p>}
          </div>
        </div>
      </div>
    </main>
  );
}
