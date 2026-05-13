// window.db viene de firebase-config.js (SDK compat, cargado antes de Babel en el HTML)

const { useState, useEffect, useCallback, useMemo } = React;

// ============================================================
// 🎯 CUSTOM HOOK: useHistorias
// Encapsula toda la lógica de fetching y estado de historias
// ============================================================
function useHistorias() {
  const [historias, setHistorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const fetchHistorias = useCallback(async () => {
    setCargando(true);
    setError('');

    const db = window.db;

    if (!db) {
      setError("Firebase no está configurado (revisá firebase-config.js)");
      setCargando(false);
      return;
    }

    try {
      const querySnapshot = await db.collection("historias")
        .where("aprobado", "==", true)
        .get();

      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });

      // Ordenar por fecha (más recientes primero) si tienen fecha
      docs.sort((a, b) => {
        const dateA = a.fecha?.toMillis ? a.fecha.toMillis() : 0;
        const dateB = b.fecha?.toMillis ? b.fecha.toMillis() : 0;
        return dateB - dateA;
      });

      setHistorias(docs);
    } catch (err) {
      console.error("Error cargando historias desde Firestore:", err);
      setError("Ocurrió un error cargando las historias.");
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    fetchHistorias();
  }, [fetchHistorias]);

  return { historias, cargando, error, refetch: fetchHistorias };
}

// Función memoizada para formatear fechas
const formatearFecha = (fecha) => {
  if (!fecha) return "Pronto";
  
  const dateObj = typeof fecha.toDate === 'function' 
    ? fecha.toDate() 
    : new Date(fecha);
    
  return dateObj.toLocaleDateString('es-AR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

// ============================================================
// 📦 COMPONENTES MEMORIZADOS
// ============================================================

const HistoriaCard = React.memo(({ historia, index }) => {
  const formatedDate = useMemo(
    () => formatearFecha(historia.fecha),
    [historia.fecha]
  );

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0 rounded-4 text-start" style={{ backgroundColor: '#FDFDFD', animationDelay: `${index * 0.1}s` }}>
        <div className="card-body d-flex flex-column p-4">
          <div className="d-flex align-items-center mb-3">
            <h5 className="card-title fw-bold text-dark m-0" style={{ fontSize: '1.25rem' }}>
              {historia.nombre || 'Anónimo'}
            </h5>
            <span className="badge bg-warning ms-3 px-2 py-1 text-dark">
              {historia.tipoEM || 'N/A'}
            </span>
          </div>
          <p className="card-text text-muted flex-grow-1" style={{ fontStyle: 'italic' }}>
            "{historia.testimonio}"
          </p>
          <span className="text-muted fw-bold mt-3" style={{ fontSize: '0.85rem' }}>
            🗓️ {formatedDate}
          </span>
        </div>
      </div>
    </div>
  );
});

function HistoriasApp() {
  const { historias, cargando, error } = useHistorias();

  // Estados optimizados con useMemo
  const historiasCount = useMemo(() => historias.length, [historias.length]);

  if (error) {
    return <p className="col-12 text-center text-danger fw-bold mt-5 fs-5">{error}</p>;
  }

  if (cargando) {
    return <p className="text-center text-muted mt-5 fw-bold">Cargando historias de la comunidad...</p>;
  }

  if (historiasCount === 0) {
    return <p className="col-12 text-center text-muted fw-bold mt-5 fs-5">Aún no hay historias publicadas. ¡Animate a ser el primero!</p>;
  }

  return (
    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      {historias.map((historia, index) => (
        <HistoriaCard key={historia.id} historia={historia} index={index} />
      ))}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("react-historias-root"));
root.render(<HistoriasApp />);
