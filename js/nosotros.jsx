// window.db viene de firebase-config.js (SDK compat, cargado antes de Babel en el HTML)

const { useState, useEffect, useCallback, useMemo } = React;

// ============================================================
// 🎯 CUSTOM HOOK: useHistoriasContador
// Encapsula lógica de fetch del contador de historias
// ============================================================
function useHistoriasContador() {
  const [contador, setContador] = useState(0);

  useEffect(() => {
    async function fetchContador() {
      try {
        const db = window.db;
        if (!db) {
          console.error("Firebase no está configurado");
          return;
        }
        
        const querySnapshot = await db.collection("historias")
          .where("aprobado", "==", true)
          .get();
        
        setContador(querySnapshot.size);
      } catch (e) {
        console.error("Error al obtener contador de historias:", e);
      }
    }
    fetchContador();
  }, []);

  return contador;
}

// ============================================================
// 📦 COMPONENTES MEMORIZADOS
// ============================================================

const ContadorHistorias = React.memo(() => {
  const contador = useHistoriasContador();

  return (
    <span className="fw-bold text-warning display-6 mx-2">
      {contador}
    </span>
  );
});

const rootContador = ReactDOM.createRoot(document.getElementById('react-contador-root'));
rootContador.render(<ContadorHistorias />);

// ── FAQ Accordion ─────────────────────────────────────────────────────────────
// Concepto: array de objetos mapeado a sub-componentes (Clase 24)
// Cada tarjeta maneja su propio estado abierto/cerrado con useState (Clase 25)

const preguntasFrecuentes = [
  {
    id: 1,
    pregunta: "¿Qué es la Esclerosis Múltiple (EM)?",
    respuesta: "La EM es una enfermedad autoinmune que afecta el sistema nervioso central. El sistema inmune ataca la mielina, la capa protectora que recubre las fibras nerviosas, lo que interfiere con la comunicación entre el cerebro y el resto del cuerpo."
  },
  {
    id: 2,
    pregunta: "¿Cuáles son los síntomas más frecuentes?",
    respuesta: "Los síntomas varían mucho entre personas, pero los más comunes incluyen fatiga, dificultad para caminar, visión borrosa o doble, entumecimiento u hormigueo en las extremidades, problemas de equilibrio y dificultades cognitivas."
  },
  {
    id: 3,
    pregunta: "¿Tiene cura la EM?",
    respuesta: "Actualmente no existe una cura definitiva, pero hay muchos tratamientos que modifican el curso de la enfermedad (DMTs), reducen la frecuencia de brotes y ayudan a mejorar la calidad de vida. La investigación avanza rápidamente."
  },
  {
    id: 4,
    pregunta: "¿Cómo puedo unirme a la comunidad EMpaticos?",
    respuesta: "Podés compartir tu historia en la sección 'Unirme', leer los testimonios de otros en 'Historias' y seguirnos en Instagram (@em.paticos2026). Toda la comunidad está aquí para acompañarte."
  },
  {
    id: 5,
    pregunta: "¿Para quién es esta comunidad?",
    respuesta: "Para cualquier persona afectada por la EM: pacientes, familiares, parejas y amigos. También para profesionales de la salud que buscan conectar con la realidad cotidiana de quienes conviven con esta enfermedad."
  }
];

// Sub-componente: recibe pregunta y respuesta como props (Clase 24)
// Maneja su propio estado de abierto/cerrado con useState (Clase 25)
const PreguntaCard = React.memo(({ pregunta, respuesta }) => {
  const initialOpen = false; // Estado inicial en variable separada (Clase 25)
  const [isOpen, setIsOpen] = useState(initialOpen);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const estilos = useMemo(() => ({
    header: {
      cursor: 'pointer',
      borderBottom: isOpen ? '1px solid #f0f0f0' : 'none'
    }
  }), [isOpen]);

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3 overflow-hidden">
      <div
        className="card-header bg-white d-flex justify-content-between align-items-center py-3 px-4"
        onClick={handleToggle}
        style={estilos.header}
      >
        <h6 className="fw-bold m-0 text-dark">{pregunta}</h6>
        <span className="text-warning fw-bold fs-5">{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Renderizado condicional: solo muestra la respuesta si isOpen es true (Clase 25) */}
      {isOpen && (
        <div className="card-body px-4 py-3">
          <p className="text-muted mb-0">{respuesta}</p>
        </div>
      )}
    </div>
  );
});

// Componente padre: mapea el arreglo de preguntas y genera un PreguntaCard por cada objeto (Clase 24)
const FAQSection = React.memo(() => {
  // Memoizar el arreglo de preguntas (aunque es constante, buena práctica)
  const preguntas = useMemo(() => preguntasFrecuentes, []);

  return (
    <div className="mt-5 mb-4">
      <h2 className="fw-bold text-center mb-2" style={{ color: 'var(--naranja)' }}>Preguntas Frecuentes</h2>
      <p className="text-center text-muted mb-4">Todo lo que necesitás saber sobre la EM y nuestra comunidad.</p>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {preguntas.map(({ id, pregunta, respuesta }) => (
            // La prop key es obligatoria en listas (Clase 24)
            // Destructuramos las propiedades del objeto directamente en el map (Clase 24)
            <PreguntaCard key={id} pregunta={pregunta} respuesta={respuesta} />
          ))}
        </div>
      </div>
    </div>
  );
});

const rootFAQ = ReactDOM.createRoot(document.getElementById('react-faq-root'));
rootFAQ.render(<FAQSection />);
