import React from 'react';

/**
 * Modal for supporting the project. This is rendered once and re-used across pages.
 */
export default function SupportModal() {
  return (
    <div className="modal fade" id="modalApoyo" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0 shadow-lg">
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold fs-4 ms-2 mt-2">Ayudanos a seguir creciendo 🤎</h5>
            <button type="button" className="btn-close me-2 mt-2" data-bs-dismiss="modal" aria-label="Cerrar" />
          </div>
          <div className="modal-body text-center p-4">
            <p className="text-muted mb-4">Todo aporte nos permite mantener la página online y seguir compartiendo historias. ¡Gracias de todo corazón!</p>
            <div className="card card-modern support-card border-warning mb-3">
              <div className="card-body py-3">
                <h6 className="text-warning fw-bold mb-2 text-uppercase">🇦🇷 Cuenta Argentina</h6>
                <p className="mb-1 text-muted">Alias Brubank</p>
                <h4 className="fw-bolder mb-0 user-select-all">empaticos</h4>
              </div>
            </div>
            <div className="card card-modern support-card border-danger mb-3">
              <div className="card-body py-3">
                <h6 className="fw-bold mb-2 text-uppercase text-danger">🌍 Cuenta Internacional</h6>
                <p className="mb-1 text-muted">N° de Cuenta Astropay</p>
                <h4 className="fw-bolder mb-0 user-select-all">559328471673</h4>
              </div>
            </div>
            <div className="mt-4">
              <a href="#" className="btn w-100 rounded-pill py-3 fw-bold fs-5 shadow-sm text-white" style={{ backgroundColor: '#009EE3' }}>
                🤝 Transferir por Mercado Pago
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
