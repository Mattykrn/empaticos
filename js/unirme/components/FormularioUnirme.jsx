import { MAX_CARACTERES, TIPOS_EM } from "../constants.js";
import ContadorCaracteres from "./ContadorCaracteres.jsx";

export default function FormularioUnirme({ state, dispatch, onSubmit }) {
  const { nombre, tipoEM, historia, anonimo, isSubmitting, errorValidacion } = state;

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label htmlFor="nombre" className="form-label fw-bold">Tu Nombre <span className="text-muted fw-normal">(Opcional)</span></label>
        <input
          type="text"
          className="form-control form-control-lg bg-light border-0"
          id="nombre"
          placeholder="Ej: Laura"
          value={nombre}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "nombre", value: e.target.value })}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="tipoEM" className="form-label fw-bold">Tipo de Esclerosis Multiple <span className="text-danger">*</span></label>
        <select
          className="form-select form-select-lg bg-light border-0"
          id="tipoEM"
          required
          value={tipoEM}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "tipoEM", value: e.target.value })}
        >
          <option value="" disabled>Selecciona una opcion...</option>
          {TIPOS_EM.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="historia" className="form-label fw-bold mb-0">Tu Historia <span className="text-danger">*</span></label>
          <ContadorCaracteres total={historia.length} />
        </div>
        <textarea
          className="form-control bg-light border-0"
          id="historia"
          rows="6"
          placeholder="Escribe lo que sientas. Este es un espacio seguro..."
          maxLength={MAX_CARACTERES}
          required
          value={historia}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "historia", value: e.target.value })}
        ></textarea>
        {errorValidacion && <div className="text-danger mt-2 small fw-bold">{errorValidacion}</div>}
      </div>

      <div className="mb-4 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="anonimo-checkbox"
          checked={anonimo}
          onChange={(e) => dispatch({ type: "SET_FIELD", field: "anonimo", value: e.target.checked })}
        />
        <label className="form-check-label text-muted" htmlFor="anonimo-checkbox">Publicar de forma anonima</label>
      </div>

      <div className="d-grid mt-5">
        <button type="submit" className="btn btn-warning btn-lg fw-bold shadow-sm d-flex justify-content-center align-items-center" disabled={isSubmitting}>
          {isSubmitting ? (
            <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Enviando...</>
          ) : (
            "Enviar mi historia"
          )}
        </button>
      </div>
    </form>
  );
}
