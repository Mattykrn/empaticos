// Custom Hook: useFormState
// Encapsula toda la lógica del formulario de "Unirse a la comunidad"
// Incluye: estado, reducer, validaciones y handlers memoizados

const { useReducer, useCallback } = React;

export const TIPOS_EM = [
  { value: "EMRR", label: "EMRR (Remitente-Recurrente)" },
  { value: "EMSP", label: "EMSP (Secundaria Progresiva)" },
  { value: "EMPP", label: "EMPP (Primaria Progresiva)" },
  { value: "Familiar", label: "Familiar / Amigo / Pareja" },
  { value: "Otro", label: "Otro / Aun en diagnostico" }
];

export const MAX_CARACTERES = 1000;

export const initialState = {
  menuOpen: false,
  nombre: "",
  tipoEM: "",
  historia: "",
  anonimo: false,
  isSubmitting: false,
  success: false,
  errorValidacion: ""
};

export function formReducer(state, action) {
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
// 🎯 CUSTOM HOOK: useFormState
// Encapsula toda la lógica del formulario y retorna handlers
// ============================================================
export function useFormState() {
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
    dispatch,
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
