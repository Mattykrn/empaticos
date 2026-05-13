const { useState, useEffect, useCallback, useMemo } = React;

// Estado inicial en variable separada (Clase 25: buena práctica recomendada por el profe)
const initialVisible = false;

// ============================================================
// 🎯 CUSTOM HOOK: useClock
// Encapsula lógica del reloj con formateo de hora en tiempo real
// ============================================================
function useClock() {
  const [hora, setHora] = useState(() => new Date().toLocaleTimeString());

  useEffect(() => {
    // Component Did Mount
    const temporizador = setInterval(() => {
      setHora(new Date().toLocaleTimeString());
    }, 1000);

    // Component Will Unmount (Efecto de desmontaje)
    return () => {
      clearInterval(temporizador);
    };
  }, []);

  return hora;
}

// ============================================================
// 📦 COMPONENTES MEMORIZADOS
// ============================================================

const Reloj = React.memo(() => {
  const hora = useClock();

  const estilos = useMemo(() => ({
    display: {
      textDecoration: 'none'
    }
  }), []);

  return (
    <div className="reloj-display text-dark fw-bold fs-3 mt-2 font-monospace" style={estilos.display}>
      {hora}
    </div>
  );
});

const RelojWidget = React.memo(() => {
  const [isVisible, setIsVisible] = useState(initialVisible);

  const handleToggle = useCallback(() => {
    setIsVisible(prev => !prev);
  }, []);

  const estilos = useMemo(() => ({
    container: {
      zIndex: 1050,
      transition: 'all 0.3s ease',
      minWidth: '220px',
      textAlign: 'center'
    }
  }), []);

  const buttonClass = useMemo(
    () => `btn mt-3 fw-bold w-100 rounded-pill shadow-sm ${isVisible ? 'btn-outline-danger' : 'btn-warning'}`,
    [isVisible]
  );

  return (
    <div 
      className="position-fixed bottom-0 end-0 m-4 p-3 bg-white rounded-4 shadow-lg border border-warning"
      style={estilos.container}
    >
      <h6 className="text-muted fw-bold mb-2 text-uppercase" style={{ letterSpacing: '1px' }}>Reloj (React)</h6>
      
      {isVisible && <Reloj />}
      
      <button 
        className={buttonClass}
        onClick={handleToggle}
      >
        {isVisible ? 'Detener (Desmontar)' : 'Iniciar (Montar)'}
      </button>
    </div>
  );
});

const root = ReactDOM.createRoot(document.getElementById('react-clock-root'));
root.render(<RelojWidget />);
