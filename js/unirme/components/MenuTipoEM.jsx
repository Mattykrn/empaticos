import { TIPOS_EM } from "../constants.js";

export default function MenuTipoEM({ menuOpen, onToggle, onSelect }) {
  return (
    <div className="mb-4">
      <button
        type="button"
        className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
        onClick={onToggle}
        aria-expanded={menuOpen}
        aria-controls="menu-tipos-em"
      >
        <span className="fw-bold">Menu rapido de tipo de EM</span>
        <span>{menuOpen ? "Ocultar" : "Mostrar"}</span>
      </button>

      {menuOpen && (
        <div id="menu-tipos-em" className="mt-2 border rounded-3 p-2 bg-white">
          {TIPOS_EM.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              className="btn btn-sm btn-light border me-2 mb-2"
              onClick={() => onSelect(tipo.value)}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
