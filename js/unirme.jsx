// window.db viene de firebase-config.js (SDK compat, cargado antes de Babel en el HTML)

const { useReducer, useCallback, useMemo, createContext, useContext } = React;

const TIPOS_EM = [
  { value: "EMRR", label: "EMRR (Remitente-Recurrente)" },
  { value: "EMSP", label: "EMSP (Secundaria Progresiva)" },
  { value: "EMPP", label: "EMPP (Primaria Progresiva)" },
  { value: "Familiar", label: "Familiar / Amigo / Pareja" },
  { value: "Otro", label: "Otro / Aun en diagnostico" }
];

const MAX_CARACTERES = 1000;

const initialState = {
  menuOpen: false,
  nombre: "",
  tipoEM: "",
  historia: "",
  anonimo: false,
  isSubmitting: false,
  success: false,
  errorValidacion: ""
};

function formReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_MENU":
      return { ...state, menuOpen: !state.menuOpen };
    case "CLOSE_MENU":
      return { ...state, menuOpen: false };
    case "SET_FIELD":
      return {
        ...state,
        [action.field]: action.value,
        errorValidacion: ""
      };
    case "SET_ERROR":
      return { ...state, errorValidacion: action.message };
    case "SUBMIT_START":
      return { ...state, isSubmitting: true, errorValidacion: "" };
    case "SUBMIT_SUCCESS":
      return { ...state, isSubmitting: false, success: true };
    case "SUBMIT_FAIL":
      return { ...state, isSubmitting: false };
    default:
      return state;
  }
}

// ============================================================
// 🎯 CONTEXT API: FormContext
// Permite compartir estado y handlers sin prop drilling
// ============================================================
const FormContext = createContext();

function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext debe ser usado dentro de FormProvider");
  }
  return context;
}

function FormProvider({ children, value }) {
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

// ============================================================
// 🎯 CUSTOM HOOK: useFormState
// Encapsula toda la lógica del formulario y retorna handlers
// ============================================================
function useFormState() {
  const [state, dispatch] = useReducer(formReducer, initialState);

  // Memoizar handlers para evitar recrearlos en cada render
  const handleNombreChange = useCallback((e) => {
    dispatch({ type: "SET_FIELD", field: "nombre", value: e.target.value });
  }, []);

  const handleTipoEMChange = useCallback((e) => {
    dispatch({ type: "SET_FIELD", field: "tipoEM", value: e.target.value });
  }, []);

  const handleHistoriaChange = useCallback((e) => {
    dispatch({ type: "SET_FIELD", field: "historia", value: e.target.value });
  }, []);

  const handleAnonimoChange = useCallback((e) => {
    dispatch({ type: "SET_FIELD", field: "anonimo", value: e.target.checked });
  }, []);

  const handleToggleMenu = useCallback(() => {
    dispatch({ type: "TOGGLE_MENU" });
  }, []);

  const handleSelectTipo = useCallback((value) => {
    dispatch({ type: "SET_FIELD", field: "tipoEM", value });
    dispatch({ type: "CLOSE_MENU" });
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!state.tipoEM) {
      dispatch({ type: "SET_ERROR", message: "Por favor selecciona tu tipo de EM." });
      return;
    }

    if (!state.historia.trim()) {
      dispatch({ type: "SET_ERROR", message: "La historia no puede estar vacia." });
      return;
    }

    const nombreFinal = state.anonimo || state.nombre.trim() === "" ? "Anonimo" : state.nombre.trim();
    dispatch({ type: "SUBMIT_START" });

    const db = window.db;

    try {
      if (!db) throw new Error("Firebase no esta configurado (revisa firebase-config.js)");

      await db.collection("historias").add({
        nombre: nombreFinal,
        tipoEM: state.tipoEM,
        testimonio: state.historia.trim(),
        aprobado: false,
        fecha: firebase.firestore.FieldValue.serverTimestamp()
      });

      dispatch({ type: "SUBMIT_SUCCESS" });
    } catch (error) {
      console.error("Error al guardar historia:", error);
      alert("Hubo un error. Puede faltar configurar Firebase en js/firebase-config.js.");
      dispatch({ type: "SUBMIT_FAIL" });
    }
  }, [state.tipoEM, state.historia, state.anonimo, state.nombre]);

  // Retornar estado y handlers
  return {
    state,
    handlers: {
      handleNombreChange,
      handleTipoEMChange,
      handleHistoriaChange,
      handleAnonimoChange,
      handleToggleMenu,
      handleSelectTipo,
      handleSubmit
    }
  };
}

function HeroFormulario() {
  return (
    <section className="bg-light rounded-4 p-3 p-md-4 mb-4 border">
      <p className="mb-1 fw-bold">Comparte tu experiencia</p>
      <p className="text-muted mb-0 small">
        Puedes escribir lo que desees: un diagnostico, un aprendizaje, un miedo o un mensaje para alguien que recien empieza.
      </p>
    </section>
  );
}

const HeaderFormulario = React.memo(() => {
  const { state } = useFormContext();
  const nombreVisible = state.nombre.trim();

  return (
    <header className="text-center mb-4">
      <h3 className="fw-bold mb-2">Unite a la comunidad</h3>
      <p className="text-muted mb-0">
        {nombreVisible ? `Hola ${nombreVisible}, gracias por estar aca.` : "Tu voz puede acompanar a otra persona."}
      </p>
    </header>
  );
});

const MenuTipoEM = React.memo(() => {
  const { state, handlers } = useFormContext();
  const tiposEMOptions = useMemo(() => TIPOS_EM, []);
  
  return (
    <div className="mb-4">
      <button
        type="button"
        className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
        onClick={handlers.handleToggleMenu}
        aria-expanded={state.menuOpen}
        aria-controls="menu-tipos-em"
      >
        <span className="fw-bold">Menu rapido de tipo de EM</span>
        <span>{state.menuOpen ? "Ocultar" : "Mostrar"}</span>
      </button>

      {state.menuOpen && (
        <div id="menu-tipos-em" className="mt-2 border rounded-3 p-2 bg-white">
          {tiposEMOptions.map((tipo) => (
            <button
              key={tipo.value}
              type="button"
              className="btn btn-sm btn-light border me-2 mb-2"
              onClick={() => handlers.handleSelectTipo(tipo.value)}
            >
              {tipo.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

const ContadorCaracteres = React.memo(() => {
  const { state } = useFormContext();
  const total = state.historia.length;

  return (
    <small className={`fw-bold ${total > 900 ? "text-warning" : "text-muted"}`}>
      {total}/{MAX_CARACTERES} caracteres
    </small>
  );
});

const FormularioUnirme = React.memo(() => {
  const { state, handlers } = useFormContext();
  const { nombre, tipoEM, historia, anonimo, isSubmitting, errorValidacion } = state;
  const tiposEMOptions = useMemo(() => TIPOS_EM, []);

  return (
    <form onSubmit={handlers.handleSubmit}>
      <div className="mb-4">
        <label htmlFor="nombre" className="form-label fw-bold">Tu Nombre <span className="text-muted fw-normal">(Opcional)</span></label>
        <input
          type="text"
          className="form-control form-control-lg bg-light border-0"
          id="nombre"
          placeholder="Ej: Laura"
          value={nombre}
          onChange={handlers.handleNombreChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="tipoEM" className="form-label fw-bold">Tipo de Esclerosis Multiple <span className="text-danger">*</span></label>
        <select
          className="form-select form-select-lg bg-light border-0"
          id="tipoEM"
          required
          value={tipoEM}
          onChange={handlers.handleTipoEMChange}
        >
          <option value="" disabled>Selecciona una opcion...</option>
          {tiposEMOptions.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label htmlFor="historia" className="form-label fw-bold mb-0">Tu Historia <span className="text-danger">*</span></label>
          <ContadorCaracteres />
        </div>
        <textarea
          className="form-control bg-light border-0"
          id="historia"
          rows="6"
          placeholder="Escribe lo que sientas. Este es un espacio seguro..."
          maxLength={MAX_CARACTERES}
          required
          value={historia}
          onChange={handlers.handleHistoriaChange}
        ></textarea>
        {errorValidacion && <div className="text-danger mt-2 small fw-bold">{errorValidacion}</div>}
      </div>

      <div className="mb-4 form-check">
        <input
          type="checkbox"
          className="form-check-input"
          id="anonimo-checkbox"
          checked={anonimo}
          onChange={handlers.handleAnonimoChange}
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
});

function ExitoEnvio() {
  return (
    <div className="card-body text-center p-5">
      <div className="mb-4">
        <span style={{ fontSize: "4rem" }}>OK</span>
      </div>
      <h3 className="fw-bold text-success mb-3">Gracias por compartir tu historia.</h3>
      <p className="text-muted fs-5">
        Tu testimonio ha sido enviado y esta pendiente de revision. Pronto se publicara en la seccion de historias.
      </p>
      <a href="historias.html" className="btn btn-outline-warning mt-4 fw-bold">Ver otras historias</a>
    </div>
  );
}

// Componente interno que usa el contexto
function UnirmeFormContent() {
  const { state } = useFormContext();

  if (state.success) {
    return <ExitoEnvio />;
  }

  return (
    <div className="card-body p-4 p-md-5">
      <HeaderFormulario />
      <HeroFormulario />
      <MenuTipoEM />
      <FormularioUnirme />
    </div>
  );
}

function UnirmeApp() {
  // Usar el custom hook para toda la lógica del formulario
  const formState = useFormState();
  const { state, handlers } = formState;

  // Crear el valor del contexto
  const contextValue = {
    state,
    handlers
  };

  return (
    <FormProvider value={contextValue}>
      <UnirmeFormContent />
    </FormProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("react-unirme-root"));
root.render(<UnirmeApp />);
