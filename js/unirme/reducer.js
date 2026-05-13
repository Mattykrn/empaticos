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
