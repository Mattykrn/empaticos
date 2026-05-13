const { useState, useEffect, useCallback, useMemo } = React;

// Estado inicial guardado en variable (buena práctica - Clase 25)
const initialFiltro = "todos";

const noticiasDB = [
  {
    titulo: "Ensayos clínicos de vacunas ARNm contra el Virus de Epstein-Barr (EBV)",
    resumen: "Moderna avanza en los ensayos de la vacuna mRNA-1189, abriendo una puerta histórica para prevenir y potencialmente tratar la Esclerosis Múltiple frenando al EBV.",
    fecha: "2026-05-02",
    imagen: "https://images.unsplash.com/photo-1618015359908-0bf4c2e64627?auto=format&fit=crop&w=600&q=80",
    link: "https://www.nationalmssociety.org/Understanding-MS/What-Causes-MS/Epstein-Barr-Virus",
  },
  {
    titulo: "Frexalimab: Reducción de lesiones sin destruir células B",
    resumen: "Este nuevo tratamiento demostró en ensayos de fase 2 reducir drásticamente las lesiones cerebrales bloqueando la comunicación celular, sin depletar el sistema inmune.",
    fecha: "2026-04-20",
    imagen: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80",
    link: "https://multiplesclerosisnewstoday.com/frexalimab/",
  },
  {
    titulo: "Microbioma Intestinal y terapias de precisión",
    resumen: "Nuevas investigaciones logran identificar cepas bacterianas específicas que exacerban la inflamación, posicionando a los probióticos como terapia complementaria formal.",
    fecha: "2026-04-10",
    imagen: "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&w=600&q=80",
    link: "https://www.msif.org/news/",
  },
  {
    titulo: "EPOF Argentina impulsa campaña por las Enfermedades Poco Frecuentes",
    resumen: "La organización EPOF Argentina lanza una iniciativa nacional para visibilizar las enfermedades raras, incluyendo la esclerosis múltiple, y promover el acceso equitativo a tratamientos.",
    fecha: "2026-04-06",
    imagen: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&q=80",
    link: "https://www.epofargentina.org/campana-epof",
  },
  {
    titulo: "Gen de los yaks podría reparar la mielina",
    resumen: "Un gen adaptado a la vida en altura muestra potencial para regenerar la mielina dañada en pacientes con EM.",
    fecha: "2026-03-22",
    imagen: "https://images.unsplash.com/photo-1508385082359-f38ae991e8f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.diariodenavarra.es/noticias/salud/2026/03/22/gen-yak-reparar-dano-esclerosis-multiple-573000-3172.html",
  },
  {
    titulo: "Nuevo biomarcador detecta progresión de EM antes de los síntomas",
    resumen: "Investigadores del Hospital Italiano de Buenos Aires y CONICET identificaron un marcador en sangre (sNfL) que podría anticipar brotes.",
    fecha: "2026-03-20",
    imagen: "https://images.unsplash.com/photo-1576086213369-97a306d36557?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.campus.sanofi/es/esclerosis-multiple/biomarcadores",
  },
  {
    titulo: "Descubrimiento sobre la muerte neuronal en EM",
    resumen: "Investigadores de Johns Hopkins identificaron el mecanismo molecular de la muerte neuronal, abriendo la puerta a terapias más protectoras.",
    fecha: "2026-03-14",
    imagen: "https://images.unsplash.com/photo-1581090700227-4c4d1a3a3a3a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.infobae.com/salud/2026/03/14/un-hallazgo-abre-la-puerta-a-nuevos-tratamientos-para-la-esclerosis-multiple/",
  },
  {
    titulo: "Fenebrutinib muestra resultados prometedores en fase III",
    resumen: "Roche anuncia gran reducción en la progresión de la EM actuando sobre la microglía. Posible aprobación ANMAT en 2027.",
    fecha: "2026-02-15",
    imagen: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.infobea.com/salud/2024/05/11/esclerosis-multiple-cuales-son-los-avances-mas-prometedores-en-los-tratamientos/",
  },
  {
    titulo: "Terapia CAR-T: Resultados preliminares para formas agresivas",
    resumen: "Ensayos clínicos aplicando células CAR-T han demostrado resultados esperanzadores para frenar el daño neurológico.",
    fecha: "2026-01-15",
    imagen: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.redaccionmedica.com/secciones/neurologia/la-terapia-car-t-abre-una-nueva-via-contra-la-esclerosis-multiple-mas-agresiva-6134",
  },
  {
    titulo: "Ley de accesibilidad avanza en el Congreso Nacional",
    resumen: "Iniciativa de ley incluye mejoras en transporte, cobertura de salud y protección de empleo para personas diagnosticadas con formas progresivas.",
    fecha: "2026-01-10",
    imagen: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.argentina.gob.ar/andis",
  },
  {
    titulo: "Inteligencia Artificial identifica nuevos subtipos clínicos",
    resumen: "Estudio publicado en Nature revela dos nuevos subtipos biológicos usando IA, que cambiarán el enfoque del tratamiento.",
    fecha: "2025-12-05",
    imagen: "https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.nature.com/articles/esclerosis-multiple-subtipos-2025",
  },
  {
    titulo: "Enfoque en la remielinización: Reparando el Sistema Nervioso",
    resumen: "Expertos internacionales en ECTRIMS subrayan que iniciar tratamientos en fases subclínicas frena la evolución, además de buscar recuperar nervios dañados.",
    fecha: "2025-05-18",
    imagen: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.clinicbarcelona.org/asistencia/enfermedades/esclerosis-multiple",
  },
  {
    titulo: "Estudio francés cuestiona eficacia de ciertos monoclonales",
    resumen: "Fármacos como rituximab y ocrelizumab muestran resultados limitados o con dudas en perfiles de seguridad en algunos estudios observacionales.",
    fecha: "2024-09-26",
    imagen: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
    link: "https://www.infobae.com/salud/2024/09/26/estudio-duda-eficacia-farmacos-esclerosis-multiple/",
  }
];

// ============================================================
// 🎯 CUSTOM HOOK: useNoticiasFilter
// Encapsula lógica de filtrado y ordenamiento de noticias
// ============================================================
function useNoticiasFilter() {
  const [filtroAnio, setFiltroAnio] = useState(initialFiltro);
  const [cargando, setCargando] = useState(true);

  // Simulamos carga para darle estética profesional
  useEffect(() => {
    const timer = setTimeout(() => {
      setCargando(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Memoizar noticias filtradas
  const noticiasFiltradas = useMemo(
    () => filtroAnio === "todos" 
      ? noticiasDB 
      : noticiasDB.filter((n) => n.fecha.startsWith(filtroAnio)),
    [filtroAnio]
  );

  // Memoizar noticias ordenadas
  const noticiasOrdenadas = useMemo(
    () => [...noticiasFiltradas].sort((a, b) => new Date(b.fecha) - new Date(a.fecha)),
    [noticiasFiltradas]
  );

  const handleFiltroChange = useCallback((e) => {
    setFiltroAnio(e.target.value);
  }, []);

  return { filtroAnio, cargando, noticiasOrdenadas, handleFiltroChange };
}

// Estilos extraídos a variables const para no ensuciar el JSX (Clase 24)
const estilosCard = {
  backgroundColor: '#FAFAFA',
};

const estilosImagen = {
  objectFit: 'cover',
  height: '200px',
  width: '100%',
  borderRadius: '16px 16px 0 0',
};

const estilosBotonLeer = {
  color: 'white',
  borderRadius: '8px',
};

// ============================================================
// 📦 COMPONENTES MEMORIZADOS
// ============================================================

const ContadorNoticias = React.memo(({ total, filtro }) => {
  const textoFiltro = useMemo(
    () => filtro === "todos" ? "todos los años" : `el año ${filtro}`,
    [filtro]
  );

  return (
    <p className="text-muted mb-4">
      Mostrando <span className="fw-bold text-warning">{total}</span> {total === 1 ? "noticia" : "noticias"} de {textoFiltro}.
    </p>
  );
});

const NoticiaCard = React.memo(({ noticia, index }) => {
  const formatedDate = useMemo(
    () => new Date(noticia.fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    [noticia.fecha]
  );

  return (
    <div className="col">
      <div
        className="card h-100 shadow-sm border-0 rounded-4 text-start"
        style={{ ...estilosCard, animationDelay: `${index * 0.1}s` }}
      >
        <img
          src={noticia.imagen || "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?w=500&q=80"}
          className="card-img-top news-image"
          alt={noticia.titulo}
          style={estilosImagen}
        />
        <div className="card-body d-flex flex-column p-4">
          <span style={{ fontSize: '0.85rem' }} className="text-muted fw-bold mb-2">🗓️ {formatedDate}</span>
          <h5 className="card-title fw-bold text-dark mb-3" style={{ fontSize: '1.25rem' }}>{noticia.titulo}</h5>
          <p className="card-text text-muted flex-grow-1">{noticia.resumen}</p>
          <a href={noticia.link} target="_blank" rel="noreferrer" className="btn btn-warning mt-3 fw-bold w-100 news-link" style={estilosBotonLeer}>
            Leer artículo original →
          </a>
        </div>
      </div>
    </div>
  );
});

function NoticiasApp() {
  const { filtroAnio, cargando, noticiasOrdenadas, handleFiltroChange } = useNoticiasFilter();

  return (
    <>
      <div className="d-flex justify-content-end mb-4 align-items-center">
        <label htmlFor="filtro-anio" className="form-label fw-bold me-3 mb-0 text-dark">Filtrar por año:</label>
        <select 
          id="filtro-anio" 
          className="form-select w-auto" 
          value={filtroAnio}
          onChange={handleFiltroChange}
        >
          <option value="todos">Todos los años</option>
          <option value="2026">2026</option>
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </select>
      </div>

      {/* Renderizado condicional con && (Clase 25): solo muestra si cargando es true */}
      {cargando && (
        <p className="text-center text-muted mt-5 fw-bold">Buscando las últimas novedades...</p>
      )}

      {/* Renderizado condicional con && (Clase 25): solo muestra si NO está cargando */}
      {!cargando && (
        <>
          {/* Sub-componente ContadorNoticias: recibe total y filtro como props (Clase 24) */}
          <ContadorNoticias total={noticiasOrdenadas.length} filtro={filtroAnio} />

          {/* Renderizado condicional con &&: mensaje de no resultados */}
          {noticiasOrdenadas.length === 0 && (
            <p className="col-12 text-center text-muted fw-bold mt-5 fs-5">No se encontraron noticias publicadas en ese año.</p>
          )}

          {/* Renderizado condicional con &&: grilla de noticias */}
          {noticiasOrdenadas.length > 0 && (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {noticiasOrdenadas.map((noticia, index) => (
                <NoticiaCard key={noticia.titulo} noticia={noticia} index={index} />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("react-noticias-root"));
root.render(<NoticiasApp />);
