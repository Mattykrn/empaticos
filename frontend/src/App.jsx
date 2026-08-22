import React, { useState, useEffect } from 'react';
import api from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

// Base de noticias especializada en Esclerosis Múltiple con fuentes oficiales
const NOTICIAS_ORIGINALES = [
  {
    id: 1,
    titulo: "Inhibidores de BTK: la nueva frontera en el tratamiento de la EM Progresiva",
    categoria: "Nuevos Fármacos",
    fecha: "20 Agosto 2026",
    autor: "Redacción Neurología & Investigación",
    fuente: "European Committee for Treatment and Research in MS (ECTRIMS)",
    fuenteUrl: "https://www.ectrims.eu",
    resumen: "Los ensayos clínicos de fase III con inhibidores de la tirosina quinasa de Bruton (BTK) demuestran capacidad para atravesar la barrera hematoencefálica y actuar directamente sobre la neuroinflamación cerebral compartimentada.",
    imagen: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80",
    tiempoLectura: "5 min de lectura"
  },
  {
    id: 2,
    titulo: "Avances en terapias de remielinización y reparación del daño axonal",
    categoria: "Investigación",
    fecha: "17 Agosto 2026",
    autor: "Comité Científico Internacional",
    fuente: "National Multiple Sclerosis Society (NMSS Research)",
    fuenteUrl: "https://www.nationalmssociety.org/research",
    resumen: "Nuevos compuestos biológicos en fase experimental estimulan la diferenciación de células precursoras de oligodendrocitos (OPC), buscando reparar la vaina de mielina dañada.",
    imagen: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
    tiempoLectura: "4 min de lectura"
  },
  {
    id: 3,
    titulo: "Biomarcadores en sangre: Neurofilamentos de Cadena Ligera (NfL)",
    categoria: "Diagnóstico & Monitoreo",
    fecha: "12 Agosto 2026",
    autor: "Servicio de Neuroinmunología Clínica",
    fuente: "Multiple Sclerosis Journal (SAGE Publishing)",
    fuenteUrl: "https://journals.sagepub.com/home/msj",
    resumen: "La medición de NfL mediante análisis de sangre ultrasensibles consolida su uso en la práctica clínica para predecir brotes con meses de anticipación y monitorear la respuesta terapéutica.",
    imagen: "https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80",
    tiempoLectura: "4 min de lectura"
  },
  {
    id: 4,
    titulo: "Trasplante de Células Madre Hematopoyéticas (TCMH): Consenso 2026",
    categoria: "Ensayos Clínicos",
    fecha: "08 Agosto 2026",
    autor: "Sociedad de Neurología",
    fuente: "PubMed Central / National Institutes of Health (NIH)",
    fuenteUrl: "https://pubmed.ncbi.nlm.nih.gov",
    resumen: "Protocolos de acondicionamiento de intensidad intermedia confirman una tasa sostenida de ausencia de actividad de la enfermedad (NEDA) en pacientes con EM recurrente activa.",
    imagen: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80",
    tiempoLectura: "6 min de lectura"
  },
  {
    id: 5,
    titulo: "El papel del microbioma intestinal y la dieta antiinflamatoria en la EM",
    categoria: "Estilo de Vida & Tratamiento",
    fecha: "03 Agosto 2026",
    autor: "Unidad de Nutrición y Neurociencias",
    fuente: "European Multiple Sclerosis Platform (EMSP)",
    fuenteUrl: "https://emsp.org",
    resumen: "Investigaciones recientes revelan cómo los ácidos grasos de cadena corta producidos por la microbiota modulan las células T reguladoras en el sistema nervioso.",
    imagen: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
    tiempoLectura: "3 min de lectura"
  }
];

const HISTORIAS_BACKUP = [
  {
    _id: 'story-em-101',
    author: 'María Celeste A.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    titulo: 'Mi camino de superación tras 3 años del diagnóstico de EM',
    content: 'Al principio sentí mucha incertidumbre tras el diagnóstico de Esclerosis Múltiple, pero con el tratamiento adecuado y el apoyo de mi familia aprendí que la fortaleza se construye día a día.',
    rolAutor: 'paciente',
    createdAt: new Date().toISOString(),
    reacciones: [
      { uid: 'u1', tipo: 'fuerza' },
      { uid: 'u2', tipo: 'fuerza' },
      { uid: 'u3', tipo: 'abrazo' },
      { uid: 'u4', tipo: 'gracias' }
    ]
  },
  {
    _id: 'story-em-102',
    author: 'Lucas V.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    titulo: 'Acompañando a mi hermana en su proceso',
    content: 'Como familiar entendí que lo más importante es estar presentes, escuchar sin juzgar y motivarnos mutuamente en los momentos de fatiga.',
    rolAutor: 'familiar',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    reacciones: [
      { uid: 'u5', tipo: 'fuerza' },
      { uid: 'u6', tipo: 'abrazo' }
    ]
  }
];

// Componente principal de historias y muro comunitario
function MuroComunitarioApp() {
  const { usuario, loginConGoogle, logout, modalAbierto, setModalAbierto, abrirModalRegistro } = useAuth();
  
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [rolSeleccionado, setRolSeleccionado] = useState('paciente');
  const [historias, setHistorias] = useState([]);
  const [cargandoHistorias, setCargandoHistorias] = useState(true);
  const [errorHistorias, setErrorHistorias] = useState(null);
  
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [guardandoHistoria, setGuardandoHistoria] = useState(false);

  const [fraseInspiradora, setFraseInspiradora] = useState(null);
  const [cargandoFrase, setCargandoFrase] = useState(true);

  // 1. Cargar historias desde el backend MongoDB mediante GET /api/stories con VITE_API_URL
  useEffect(() => {
    const cargarHistoriasAPI = async () => {
      setCargandoHistorias(true);
      setErrorHistorias(null);
      try {
        const response = await api.get('/stories');
        if (response.data && response.data.ok && Array.isArray(response.data.data)) {
          setHistorias(response.data.data.length > 0 ? response.data.data : HISTORIAS_BACKUP);
        } else if (Array.isArray(response.data)) {
          setHistorias(response.data.length > 0 ? response.data : HISTORIAS_BACKUP);
        } else {
          setHistorias(HISTORIAS_BACKUP);
        }
      } catch (err) {
        console.warn('Conexión backend (usando backup seguro local):', err.message);
        setErrorHistorias('No se pudo conectar con el servidor backend. Mostrando contenido local de reserva.');
        setHistorias(HISTORIAS_BACKUP);
      } finally {
        setCargandoHistorias(false);
      }
    };

    cargarHistoriasAPI();
  }, []);

  // 2. Cargar frase motivacional desde el backend mediante GET /api/external/quote
  useEffect(() => {
    const cargarFraseExterna = async () => {
      setCargandoFrase(true);
      try {
        const response = await api.get('/external/quote');
        if (response.data && response.data.ok && response.data.data) {
          setFraseInspiradora(response.data.data);
        }
      } catch (err) {
        console.warn('Error al cargar frase inspiradora:', err.message);
        setFraseInspiradora({
          frase: 'No estás solo en este camino. Cada pequeño paso cuenta y la comunidad está aquí para sostenerte.',
          autor: 'Comunidad Empáticos'
        });
      } finally {
        setCargandoFrase(false);
      }
    };

    cargarFraseExterna();
  }, []);

  // 3. Crear historias enviando POST /api/stories con VITE_API_URL
  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!usuario) {
      if (setModalAbierto) setModalAbierto(true);
      else if (abrirModalRegistro) abrirModalRegistro();
      return;
    }

    if (!nuevoTitulo.trim() || !nuevoContenido.trim()) return;

    setGuardandoHistoria(true);
    try {
      const payload = {
        author: usuario.nombre || 'Usuario Empáticos',
        avatar: usuario.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        content: nuevoContenido.trim(),
        contenido: nuevoContenido.trim(),
        titulo: nuevoTitulo.trim(),
        rolAutor: usuario.rol || rolSeleccionado || 'paciente',
        imageUrl: ''
      };

      const res = await api.post('/stories', payload);
      const historiaRespuesta = res.data?.data || res.data || {
        ...payload,
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        reacciones: []
      };

      setHistorias(prev => [historiaRespuesta, ...prev]);
      setNuevoTitulo('');
      setNuevoContenido('');
    } catch (err) {
      console.error('Error al guardar la historia en MongoDB Atlas:', err.message);
      // Fallback local en pantalla
      const historiaLocal = {
        _id: Date.now().toString(),
        author: usuario.nombre || 'Usuario Empáticos',
        avatar: usuario.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        titulo: nuevoTitulo.trim(),
        content: nuevoContenido.trim(),
        rolAutor: usuario.rol || 'paciente',
        createdAt: new Date().toISOString(),
        reacciones: []
      };
      setHistorias(prev => [historiaLocal, ...prev]);
      setNuevoTitulo('');
      setNuevoContenido('');
    } finally {
      setGuardandoHistoria(false);
    }
  };

  // 4. Conectar botones de reacción para enviar POST /api/reactions y actualizar contador persistente
  const handleReaccionar = async (storyId, tipoReaccion) => {
    if (!usuario) {
      if (setModalAbierto) setModalAbierto(true);
      else if (abrirModalRegistro) abrirModalRegistro();
      return;
    }

    const userId = usuario.uid || usuario.id || 'usr-anon';

    // Actualización optimista de estado local
    setHistorias(prev =>
      prev.map(h => {
        const idActual = (h._id || h.id).toString();
        if (idActual === storyId.toString()) {
          const reaccionesPrev = Array.isArray(h.reacciones) ? h.reacciones : [];
          const yaExiste = reaccionesPrev.find(r => (r.uid === userId || r.userId === userId) && (r.tipo === tipoReaccion || r.type === tipoReaccion));
          
          let nuevasReacciones;
          if (yaExiste) {
            nuevasReacciones = reaccionesPrev.filter(r => !((r.uid === userId || r.userId === userId) && (r.tipo === tipoReaccion || r.type === tipoReaccion)));
          } else {
            nuevasReacciones = [
              ...reaccionesPrev.filter(r => (r.uid !== userId && r.userId !== userId)),
              { uid: userId, userId: userId, tipo: tipoReaccion, type: tipoReaccion }
            ];
          }

          return { ...h, reacciones: nuevasReacciones };
        }
        return h;
      })
    );

    // Enviar petición POST /api/reactions al backend para persistir en MongoDB Atlas
    try {
      const res = await api.post('/reactions', {
        targetId: storyId,
        userId: userId,
        type: tipoReaccion,
        tipo: tipoReaccion
      });

      if (res.data && res.data.ok && res.data.data && Array.isArray(res.data.data.reacciones)) {
        const reaccionesBackend = res.data.data.reacciones;
        setHistorias(prev =>
          prev.map(h => {
            const idActual = (h._id || h.id).toString();
            if (idActual === storyId.toString()) {
              return { ...h, reacciones: reaccionesBackend };
            }
            return h;
          })
        );
      }
    } catch (err) {
      console.warn('Error al sincronizar reacción con la BD:', err.message);
    }
  };

  // Función para obtener el conteo de reacciones por tipo
  const obtenerConteo = (reaccionesList, tipoTarget) => {
    if (!reaccionesList) return 0;
    if (Array.isArray(reaccionesList)) {
      return reaccionesList.filter(r => r.tipo === tipoTarget || r.type === tipoTarget).length;
    }
    if (typeof reaccionesList === 'object') {
      return reaccionesList[tipoTarget] || 0;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* NAVBAR NARANJA ENERGETICO CON LINK A INSTAGRAM */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md border-b border-orange-600">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <div 
              onClick={() => setSeccionActiva('inicio')}
              className="flex items-center gap-3 cursor-pointer select-none group"
            >
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner border border-white/30 group-hover:scale-105 transition-transform">
                🧡
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white block leading-tight">Empáticos</span>
                <span className="text-[10px] font-bold tracking-widest text-orange-100 uppercase block">Comunidad & Apoyo EM</span>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1.5 bg-orange-600/40 p-1.5 rounded-full border border-orange-400/50 backdrop-blur-md">
              {['inicio', 'historias', 'noticias', 'nosotros'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSeccionActiva(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition-all duration-200 ${
                    seccionActiva === tab
                      ? 'bg-white text-orange-600 shadow-md scale-105'
                      : 'text-orange-100 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* BOTÓN DE INSTAGRAM CON ICONO OFICIAL */}
              <a
                href="https://www.instagram.com/em.paticos2026/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center border border-white/30 backdrop-blur-md transition-all hover:scale-110 shadow-sm"
                title="Síguenos en Instagram @em.paticos2026"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>

              {usuario ? (
                <div className="flex items-center gap-3 bg-orange-600/50 p-1.5 pr-4 rounded-full border border-orange-400 text-white backdrop-blur-md">
                  <img 
                    src={usuario.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                    alt={usuario.nombre} 
                    className="w-8 h-8 rounded-full object-cover border border-white/60"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight">{usuario.nombre}</p>
                    <p className="text-[10px] text-orange-200 font-semibold capitalize">{usuario.rol || 'paciente'}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="ml-2 text-xs font-bold text-orange-200 hover:text-white transition-colors"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setModalAbierto ? setModalAbierto(true) : abrirModalRegistro && abrirModalRegistro()}
                  className="bg-white hover:bg-orange-50 text-orange-600 px-6 py-2.5 rounded-full text-sm font-black shadow-md border border-white/80 transition-all hover:scale-105 active:scale-95"
                >
                  Unirme
                </button>
              )}
            </div>
          </div>
        </header>

        {/* BANNER DE FRASE MOTIVACIONAL CONSUMIDA DE API EXTERNA EN ESPAÑOL */}
        {fraseInspiradora && (
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-inner transition-all border-b border-orange-700">
            <div className="max-w-4xl mx-auto px-4 py-2.5 text-center flex items-center justify-center gap-2">
              <span className="text-sm">💡</span>
              <p className="text-xs md:text-sm font-medium italic">
                "{fraseInspiradora.frase}" — <span className="font-bold">{fraseInspiradora.autor}</span>
              </p>
            </div>
          </div>
        )}

        {/* HERO */}
        {seccionActiva === 'inicio' && (
          <section className="relative overflow-hidden py-16 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/70 border border-orange-200/60 text-orange-800 text-xs font-semibold">
                ✨ Red Comunitaria de Esclerosis Múltiple
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                Nadie camina solo en este proceso.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Un espacio seguro creado para que pacientes, familiares y acompañantes puedan compartir testimonios reales, encontrar contención y acceder a novedades científicas verificadas sobre Esclerosis Múltiple.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setSeccionActiva('historias')}
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/25 transition-transform hover:scale-105"
                >
                  Ver Muro de Historias
                </button>
                <button
                  onClick={() => setSeccionActiva('noticias')}
                  className="bg-white hover:bg-slate-50 text-slate-700 font-bold px-8 py-3.5 rounded-full border border-slate-200 shadow-sm transition-colors"
                >
                  Últimos Avances Médicos
                </button>
              </div>
            </div>
          </section>
        )}

        {/* CONTENIDO PRINCIPAL */}
        <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
          {/* SECCIÓN VIDEO EXPLICATIVO: ¿QUÉ ES LA ESCLEROSIS MÚLTIPLE? */}
          {(seccionActiva === 'inicio' || seccionActiva === 'nosotros') && (
            <section className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-100/30 p-6 md:p-10 rounded-3xl border border-orange-200/80 shadow-sm space-y-6">
              <div className="max-w-3xl mx-auto text-center space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
                  🎬 Video Educativo & Concientización
                </span>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                  ¿Qué es la Esclerosis Múltiple?
                </h2>
                <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                  Un recurso audiovisual claro e informativo para comprender cómo afecta la EM al sistema nervioso central, visibilizar sus síntomas y empatizar con quienes convivimos con esta condición.
                </p>
              </div>

              <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-black aspect-video">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/gbkrlXuzodU"
                  title="¿Qué es la Esclerosis Múltiple? - Video Explicativo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center text-xs">
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-2xl block">🧠</span>
                  <p className="font-bold text-slate-800 mt-1">Enfermedad Autoinmune</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">El sistema inmune afecta el sistema nervioso central</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-2xl block">🛡️</span>
                  <p className="font-bold text-slate-800 mt-1">La Vaina de Mielina</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Capa protectora de las neuronas que transmite impulsos</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <span className="text-2xl block">🤝</span>
                  <p className="font-bold text-slate-800 mt-1">Apoyo & Empatía</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Comprender los síntomas invisibles nos conecta a todos</p>
                </div>
              </div>
            </section>
          )}

          {/* SECCIÓN DE HISTORIAS */}
          {(seccionActiva === 'inicio' || seccionActiva === 'historias') && (
            <section className="space-y-8">
              <div className="flex justify-between items-end border-b border-orange-100 pb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">Muro de la Comunidad</h2>
                  <p className="text-sm text-slate-500">Experiencias y testimonios persistidos en MongoDB Atlas (/api/stories & /api/reactions)</p>
                </div>
              </div>

              {/* FORMULARIO DE PUBLICACIÓN */}
              <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  ✍️ Comparte tu historia o testimonio
                </h3>
                <form onSubmit={handlePublicar} className="space-y-3">
                  <input
                    type="text"
                    placeholder="Título de tu publicación..."
                    value={nuevoTitulo}
                    onChange={(e) => setNuevoTitulo(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <textarea
                    rows="3"
                    placeholder="Escribe tu vivencia, consejo o mensaje para la comunidad..."
                    value={nuevoContenido}
                    onChange={(e) => setNuevoContenido(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                  />
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400">
                      {usuario ? `Publicando como ${usuario.nombre}` : 'Inicia sesión con Google para publicar'}
                    </span>
                    <button
                      type="submit"
                      disabled={guardandoHistoria}
                      className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {guardandoHistoria && (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      <span>{guardandoHistoria ? 'Guardando en BD...' : 'Publicar Historia'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* MANEJO DE ESTADOS DE CARGA (SPINNER / SKELETON) Y ERROR */}
              {cargandoHistorias ? (
                <div className="space-y-4">
                  <div className="p-6 bg-white rounded-3xl border border-orange-100 shadow-sm animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/6"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                  </div>
                  <div className="p-6 bg-white rounded-3xl border border-orange-100 shadow-sm animate-pulse space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/5"></div>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                  </div>
                </div>
              ) : (
                <div>
                  {errorHistorias && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{errorHistorias}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {historias.map((historia) => {
                      const idUnico = (historia._id || historia.id).toString();
                      const fuerzaCount = obtenerConteo(historia.reacciones, 'fuerza');
                      const abrazoCount = obtenerConteo(historia.reacciones, 'abrazo');
                      const graciasCount = obtenerConteo(historia.reacciones, 'gracias');
                      const nombreAutor = historia.author || historia.autorNombre || 'Anónimo';
                      const avatarAutor = historia.avatar || historia.autorFoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';
                      const textoContenido = historia.content || historia.contenido;

                      return (
                        <article key={idUnico} className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={avatarAutor} 
                                alt={nombreAutor} 
                                className="w-10 h-10 rounded-full object-cover border border-orange-200" 
                              />
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 leading-tight">{nombreAutor}</h4>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-orange-600 font-semibold capitalize">{historia.rolAutor || 'paciente'}</span>
                                  <span className="text-slate-300">•</span>
                                  <span className="text-slate-400">
                                    {historia.createdAt ? new Date(historia.createdAt).toLocaleDateString() : historia.fecha || 'Reciente'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <h5 className="font-bold text-slate-800 text-base">{historia.titulo || 'Historia de la comunidad'}</h5>
                            <p className="text-sm text-slate-600 leading-relaxed">{textoContenido}</p>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                            <button
                              onClick={() => handleReaccionar(idUnico, 'fuerza')}
                              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 text-xs font-medium text-slate-600 hover:text-orange-600 border border-slate-100 transition-colors flex items-center gap-1.5"
                            >
                              💪 Fuerza <span className="font-bold">{fuerzaCount}</span>
                            </button>
                            <button
                              onClick={() => handleReaccionar(idUnico, 'abrazo')}
                              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 text-xs font-medium text-slate-600 hover:text-orange-600 border border-slate-100 transition-colors flex items-center gap-1.5"
                            >
                              🫂 Abrazo <span className="font-bold">{abrazoCount}</span>
                            </button>
                            <button
                              onClick={() => handleReaccionar(idUnico, 'gracias')}
                              className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-orange-50 text-xs font-medium text-slate-600 hover:text-orange-600 border border-slate-100 transition-colors flex items-center gap-1.5"
                            >
                              🙏 Gracias <span className="font-bold">{graciasCount}</span>
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* SECCIÓN DE NOTICIAS CON FUENTES */}
          {(seccionActiva === 'inicio' || seccionActiva === 'noticias') && (
            <section className="space-y-8">
              <div className="flex justify-between items-end border-b border-orange-100 pb-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900">Noticias & Avances Científicos</h2>
                  <p className="text-sm text-slate-500">Estudios clínicos y nuevos tratamientos sobre Esclerosis Múltiple</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {NOTICIAS_ORIGINALES.map((noticia) => (
                  <div key={noticia.id} className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                    <div>
                      <div className="h-44 overflow-hidden relative">
                        <img 
                          src={noticia.imagen} 
                          alt={noticia.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <span className="absolute top-3 left-3 bg-orange-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {noticia.categoria}
                        </span>
                      </div>

                      <div className="p-5 space-y-2.5">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>{noticia.fecha}</span>
                          <span>{noticia.tiempoLectura}</span>
                        </div>
                        <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                          {noticia.titulo}
                        </h3>
                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                          {noticia.resumen}
                        </p>
                      </div>
                    </div>

                    <div className="p-5 pt-0">
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-500 truncate max-w-[170px]" title={noticia.fuente}>
                          {noticia.fuente}
                        </span>
                        <a 
                          href={noticia.fuenteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-orange-600 font-bold hover:text-orange-700 inline-flex items-center gap-1 shrink-0"
                        >
                          Estudio ↗
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SECCIÓN NOSOTROS CON LINK A INSTAGRAM */}
          {seccionActiva === 'nosotros' && (
            <section className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-orange-100 shadow-sm space-y-6 text-center">
              <span className="text-4xl">🧡</span>
              <h2 className="text-3xl font-black text-slate-900">Sobre la Plataforma Empáticos</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                Empáticos es un proyecto desarrollado como plataforma de apoyo comunitario para personas que conviven con Esclerosis Múltiple, familiares y cuidadores. Integra testimonios en tiempo real con divulgación científica de fuentes médicas oficiales.
              </p>

              <div className="pt-2">
                <a
                  href="https://www.instagram.com/em.paticos2026/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Seguinos en Instagram @em.paticos2026</span>
                </a>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="p-3 bg-orange-50/50 rounded-2xl">
                  <span className="text-xl block">🤝</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">Apoyo Mutuo</p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-2xl">
                  <span className="text-xl block">🔬</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">Avances en EM</p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-2xl">
                  <span className="text-xl block">🛡️</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">Espacio Seguro</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* MODAL DE AUTENTICACIÓN GOOGLE */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setModalAbierto(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold p-1 rounded-full hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-2xl">
                🤝
              </div>
              <h3 className="text-xl font-black text-slate-900">Únete a Empáticos</h3>
              <p className="text-xs text-slate-500">
                Conéctate con tu cuenta de Google para compartir tu historia en la comunidad.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                ¿Cuál es tu rol en la comunidad?
              </label>
              <select
                value={rolSeleccionado}
                onChange={(e) => setRolSeleccionado(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
              >
                <option value="paciente">Paciente</option>
                <option value="familiar">Familiar</option>
                <option value="acompanante">Acompañante / Amigo</option>
                <option value="profesional">Profesional de la Salud</option>
              </select>
            </div>

            <button
              onClick={() => loginConGoogle(rolSeleccionado)}
              className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-colors hover:border-slate-300"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Continuar con Google
            </button>
          </div>
        </div>
      )}

      {/* FOOTER NARANJA ENERGETICO CON LINK DIRECTO A INSTAGRAM */}
      <footer className="border-t border-orange-600 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-8 text-center text-xs text-orange-100 shadow-inner">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-white text-base font-bold">
            <span>🧡</span> Empáticos
          </div>
          <p>© 2026 Empáticos — Desarrollado por Matías Torres. Global Academy.</p>
          <div className="pt-1">
            <a 
              href="https://www.instagram.com/em.paticos2026/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 text-orange-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
              <span>@em.paticos2026 en Instagram</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MuroComunitarioApp />
    </AuthProvider>
  );
}