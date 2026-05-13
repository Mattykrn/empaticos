export default function HeaderFormulario({ nombreVisible }) {
  return (
    <header className="text-center mb-4">
      <h3 className="fw-bold mb-2">Unite a la comunidad</h3>
      <p className="text-muted mb-0">
        {nombreVisible ? `Hola ${nombreVisible}, gracias por estar aca.` : "Tu voz puede acompanar a otra persona."}
      </p>
    </header>
  );
}
