// FormContext.js - Context API para el formulario de "Unirse a la comunidad"
// Permite compartir estado y handlers sin prop drilling

const { createContext, useContext } = React;

// Crear el contexto
const FormContext = createContext();

// Hook personalizado para usar el contexto
export function useFormContext() {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext debe ser usado dentro de FormProvider");
  }
  return context;
}

// Proveedor del contexto
export function FormProvider({ children, value }) {
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}
