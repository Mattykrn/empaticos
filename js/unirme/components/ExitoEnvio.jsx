export default function ExitoEnvio() {
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
