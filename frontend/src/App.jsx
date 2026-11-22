import React, { useState, useEffect, useCallback } from 'react';
import api from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useSpeech } from './context/SpeechContext';
import AccessibilityToolbar from './components/AccessibilityToolbar';

const AVATAR_DEFAULT = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

const normalizarTextoVoz = (texto) => (typeof texto === 'string' ? texto.replace(/\s+/g, ' ').trim() : '');

// Normalizar URLs de video ingresadas por usuarios
const normalizarUrlVideo = (url) => {
  if (!url || typeof url !== 'string') return '';
  const limpia = url.trim();
  if (!limpia) return '';
  const conProtocolo = /^https?:\/\//i.test(limpia) ? limpia : `https://${limpia}`;
  try {
    const parsed = new URL(conProtocolo);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.href;
    }
    return '';
  } catch {
    return '';
  }
};

// Procesar URLs de YouTube (watch, youtu.be, embed, shorts)
const obtenerEmbedYoutube = (url) => {
  const normalizada = normalizarUrlVideo(url);
  if (!normalizada) return null;
  const regExp = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = normalizada.match(regExp);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : null;
};

// Noticias
const NOTICIAS_ORIGINALES = [
  {
    id: 1,
    titulo: 'Inhibidores de BTK: la nueva frontera en el tratamiento de la EM Progresiva',
    categoria: 'Tratamientos',
    fecha: '20 Agosto 2026',
    autor: 'Redacción Neurología & Investigación',
    fuente: 'European Committee for Treatment and Research in MS (ECTRIMS)',
    fuenteUrl: 'https://www.ectrims.eu',
    resumen: 'Los ensayos clínicos de fase III con inhibidores de la tirosina quinasa de Bruton (BTK) demuestran capacidad para atravesar la barrera hematoencefálica y actuar directamente sobre la neuroinflamación cerebral compartimentada.',
    imagen: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
    tiempoLectura: '5 min de lectura'
  },
  {
    id: 2,
    titulo: 'Avances en terapias de remielinización y reparación del daño axonal',
    categoria: 'Investigación',
    fecha: '17 Agosto 2026',
    autor: 'Comité Científico Internacional',
    fuente: 'National Multiple Sclerosis Society (NMSS Research)',
    fuenteUrl: 'https://www.nationalmssociety.org/research',
    resumen: 'Nuevos compuestos biológicos en fase experimental estimulan la diferenciación de células precursoras de oligodendrocitos (OPC), buscando reparar la vaina de mielina dañada.',
    imagen: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
    tiempoLectura: '4 min de lectura'
  },
  {
    id: 3,
    titulo: 'Biomarcadores en sangre: Neurofilamentos de Cadena Ligera (NfL)',
    categoria: 'Investigación',
    fecha: '12 Agosto 2026',
    autor: 'Servicio de Neuroinmunología Clínica',
    fuente: 'Multiple Sclerosis Journal (SAGE Publishing)',
    fuenteUrl: 'https://journals.sagepub.com/home/msj',
    resumen: 'La medición de NfL mediante análisis de sangre ultrasensibles consolida su uso en la práctica clínica para predecir brotes con meses de anticipación y monitorear la respuesta terapéutica.',
    imagen: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    tiempoLectura: '4 min de lectura'
  },
  {
    id: 4,
    titulo: 'Trasplante de Células Madre Hematopoyéticas (TCMH): Consenso 2026',
    categoria: 'Tratamientos',
    fecha: '08 Agosto 2026',
    autor: 'Sociedad de Neurología',
    fuente: 'PubMed Central / National Institutes of Health (NIH)',
    fuenteUrl: 'https://pubmed.ncbi.nlm.nih.gov',
    resumen: 'Protocolos de acondicionamiento de intensidad intermedia confirman una tasa sostenida de ausencia de actividad de la enfermedad (NEDA) en pacientes con EM recurrente activa.',
    imagen: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
    tiempoLectura: '6 min de lectura'
  },
  {
    id: 5,
    titulo: 'El papel del microbioma intestinal y la dieta antiinflamatoria en la EM',
    categoria: 'Bienestar',
    fecha: '03 Agosto 2026',
    autor: 'Unidad de Nutrición y Neurociencias',
    fuente: 'European Multiple Sclerosis Platform (EMSP)',
    fuenteUrl: 'https://emsp.org',
    resumen: 'Investigaciones recientes revelan cómo los ácidos grasos de cadena corta producidos por la microbiota modulan las células T reguladoras en el sistema nervioso.',
    imagen: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80',
    tiempoLectura: '3 min de lectura'
  },
  {
    id: 6,
    titulo: 'Redes de apoyo y calidad de vida: el valor de la comunidad en EM',
    categoria: 'Comunidad',
    fecha: '28 Julio 2026',
    autor: 'Equipo de Recursos Globales',
    fuente: 'Multiple Sclerosis International Federation (MSIF)',
    fuenteUrl: 'https://www.msif.org',
    resumen: 'La federación internacional reúne recursos educativos y de acompañamiento para personas con EM, familias y cuidadores, fortaleciendo el acceso a información clara y apoyo entre pares.',
    imagen: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    tiempoLectura: '3 min de lectura'
  }
];

// Historias locales (backup si el servidor backend no está encendido)
const HISTORIAS_BACKUP = [
  {
    _id: '66a000000000000000000001',
    author: 'Matías Torres (Administrador y Creador)',
    autorNombre: 'Matías Torres (Administrador y Creador)',
    avatar: AVATAR_DEFAULT,
    titulo: 'Mi historia con la EM: El camino de nunca bajar los brazos',
    content: `Holaa, mis buenos deseos para quien esté leyendo este comentario ya sea paciente, familiar o simplemente alguien curioso :D

Soy el administrador y diseñador de la página. Convivo con esclerosis múltiple desde el año 2013 (tenía 15 años), hoy en día tengo 28...
La verdad que el diagnóstico temprano me ha ayudado mucho a contener los brotes y todo lo que esta enfermedad conlleva. Cambios de paradigmas tuvo toda mi vida desde el momento del diagnóstico, pero nunca bajé los brazos.

Mi sueño en aquella época (2013) era ser mecánico de automotores. Dado el diagnóstico temprano, me vi a la fuerza en la necesidad de alejarme de los motores, del TC Pista, TC 2000, F1, Superbike y demás. En ese momento en que manipulé un torno con una leve pérdida de equilibrio me llevé un susto. Doy las gracias a la escuela que nos capacitó bien para no tocar las máquinas en momentos en que no nos sentimos bien; eso me dio respeto y me vi obligado a cambiar de rumbos.

Me cambié a informática, me enamoré de lo que es la programación y me seguí capacitando bajo el sueño de ser desarrollador de software, que claramente no acaba simplemente con esto.

Todo fue cambiando. Por el 2013 internet era mucho más áspero y sin filtro, recuerdo desconocer lo que era la enfermedad y cometí el error de googlearlo y fue para peor jaja, muchos de los que ya llevan años sabrán a qué me refiero. Pero con contención profesional y buenas palabras de amigos, psicólogos y psiquiatras llegué a no bajar los brazos y no darme por vencido por más dolores que tenga en el cuerpo. ¡Disfruté mi adolescencia y coseché las mejores amistades que se pueden pedir!

Aprendí que amar a un amigo no es algo mal visto y que no solo se ama a quien duerme con vos, se ama y aprecia a quien estuvo siempre a tu lado. Todo es parte de crecer.

Dejo un mensaje que a mí me abrió la cabeza: "No podés pelear contra lo invencible, es mejor llevar a tu rival de la mano como si fuese una amistad", tirar contra ella solo nos perjudicará :)

Por eso siempre hay que hacer caso a los profesionales. Espero que les sirva este consejo y bueno, ¡que esta comunidad crezca, lleguemos a todos lados y que ningún otro paciente se sienta solo nunca más!`,
    rolAutor: 'paciente',
    tipo: 'historia',
    videoUrl: '',
    createdAt: '2026-08-20T12:00:00.000Z',
    reacciones: [
      { uid: 'u1', userId: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', tipo: 'abrazo', type: 'abrazo' },
      { uid: 'u3', userId: 'u3', tipo: 'gracias', type: 'gracias' }
    ],
    comentarios: [
      {
        _id: '66b000000000000000000001',
        autorNombre: 'María Celeste A.',
        rolAutor: 'paciente',
        texto: '¡Gracias por crear este espacio Matías! Esa frase sobre llevar la EM de la mano me emocionó mucho.',
        createdAt: '2026-08-20T14:30:00.000Z'
      }
    ]
  },
  {
    _id: '66a000000000000000000002',
    author: 'Matías Torres (Admin)',
    autorNombre: 'Matías Torres (Admin)',
    avatar: AVATAR_DEFAULT,
    titulo: '😂 El misterio del control remoto y la heladera',
    content: '¡No todo es superación solemne, las anécdotas insólitas sobran! La famosa "niebla mental" de la EM no perdona jaja. El otro día estuve 40 minutos buscando el control remoto del televisor por toda la casa y adivinen dónde estaba: adentro de la heladera junto a la leche. Me reí solo 10 minutos seguidos. ¡A tomar la vida con buen humor!',
    rolAutor: 'paciente',
    tipo: 'anecdota',
    videoUrl: '',
    createdAt: '2026-08-19T16:00:00.000Z',
    reacciones: [
      { uid: 'u10', userId: 'u10', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u11', userId: 'u11', tipo: 'gracias', type: 'gracias' }
    ],
    comentarios: []
  },
  {
    _id: '66a000000000000000000003',
    author: 'María Celeste A.',
    autorNombre: 'María Celeste A.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    titulo: 'Mi camino de superación tras 3 años del diagnóstico de EM',
    content: 'Al principio sentí mucha incertidumbre tras el diagnóstico de Esclerosis Múltiple, pero con el tratamiento adecuado y el apoyo de mi familia aprendí que la fortaleza se construye día a día.',
    rolAutor: 'paciente',
    tipo: 'historia',
    videoUrl: 'https://www.youtube.com/watch?v=gbkrlXuzodU',
    createdAt: '2026-08-18T10:00:00.000Z',
    reacciones: [
      { uid: 'u1', userId: 'u1', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u2', userId: 'u2', tipo: 'fuerza', type: 'fuerza' },
      { uid: 'u3', userId: 'u3', tipo: 'abrazo', type: 'abrazo' }
    ],
    comentarios: []
  }
];

const FRASES_FALLBACK_FRONTEND = [
  {
    frase: 'No estás solo en este camino. Cada pequeño paso cuenta y la comunidad está aquí para sostenerte.',
    autor: 'Comunidad Empáticos'
  },
  {
    frase: 'Descansar también es avanzar. Escuchar a tu cuerpo es un acto de valentía y cuidado.',
    autor: 'Red de Apoyo Empáticos'
  },
  {
    frase: 'Un día difícil no borra todo lo que ya superaste. Seguí a tu propio ritmo.',
    autor: 'Comunidad Empáticos'
  }
];

function MuroComunitarioApp() {
  const {
    usuario,
    esAdmin: esAdminContexto,
    errorAuth,
    loginConGoogle,
    loginLocal,
    logout,
    obtenerTokenAutenticacion,
    modalAbierto,
    abrirModalRegistro,
    cerrarModalRegistro
  } = useAuth();
  const { hablar, detener, hablando, textoActual } = useSpeech();

  // Validación explícita de administrador único para acciones destructivas
  const emailAdminConfig = import.meta.env.VITE_ADMIN_EMAIL?.toLowerCase().trim() || '';
  const esAdmin = Boolean(
    esAdminContexto &&
    emailAdminConfig &&
    usuario?.email?.toLowerCase().trim() === emailAdminConfig
  );

  // Estados principales
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [rolSeleccionado, setRolSeleccionado] = useState('paciente');
  const [nombreAccesoLocal, setNombreAccesoLocal] = useState('');
  const [autenticandoGoogle, setAutenticandoGoogle] = useState(false);

  const [historias, setHistorias] = useState([]);
  const [cargandoHistorias, setCargandoHistorias] = useState(true);
  const [errorHistorias, setErrorHistorias] = useState(null);
  const [modoDatos, setModoDatos] = useState('conectando');

  // Estados del formulario de nueva historia
  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [nuevoVideoUrl, setNuevoVideoUrl] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('historia');
  const [guardandoHistoria, setGuardandoHistoria] = useState(false);

  // Estados para feedback al usuario (éxito / error)
  const [mensajeFeedback, setMensajeFeedback] = useState(null);

  // Estados para edición de publicación (PUT)
  const [historiaEnEdicion, setHistoriaEnEdicion] = useState(null);
  const [edicionTitulo, setEdicionTitulo] = useState('');
  const [edicionContenido, setEdicionContenido] = useState('');
  const [edicionTipo, setEdicionTipo] = useState('historia');
  const [edicionVideoUrl, setEdicionVideoUrl] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  // Estados para eliminación segura (inline, sin window.confirm)
  const [confirmandoEliminarId, setConfirmandoEliminarId] = useState(null);
  const [eliminandoId, setEliminandoId] = useState(null);

  // Estados para comentarios por publicación
  const [comentariosAbiertos, setComentariosAbiertos] = useState({});
  const [borradorComentario, setBorradorComentario] = useState({});
  const [enviandoComentarioId, setEnviandoComentarioId] = useState(null);

  // Estado de la frase externa y noticias
  const [fraseInspiradora, setFraseInspiradora] = useState(null);
  const [cargandoFrase, setCargandoFrase] = useState(true);
  const [categoriaNoticia, setCategoriaNoticia] = useState('Todas');

  const mostrarFeedback = useCallback((texto, tipo = 'exito') => {
    setMensajeFeedback({ texto, tipo });
    setTimeout(() => {
      setMensajeFeedback((actual) => (actual?.texto === texto ? null : actual));
    }, 5000);
  }, []);

  // Sincronizo selector de tipo del formulario al cambiar entre Historias y Anécdotas
  const cambiarSeccion = (tab) => {
    setSeccionActiva(tab);
    if (tab === 'anecdotas') setNuevoTipo('anecdota');
    if (tab === 'historias') setNuevoTipo('historia');
  };

  // Cargar historias desde la API Backend (MongoDB Atlas o almacenamiento local persistente)
  const cargarHistoriasAPI = useCallback(async () => {
    setCargandoHistorias(true);
    setErrorHistorias(null);
    try {
      const response = await api.get('/stories');
      if (response.data && response.data.ok && Array.isArray(response.data.data)) {
        setHistorias(response.data.data);
        setModoDatos(response.data.modo || 'mongodb_atlas');
      } else if (Array.isArray(response.data)) {
        setHistorias(response.data);
        setModoDatos('mongodb_atlas');
      } else {
        setHistorias(HISTORIAS_BACKUP);
        setModoDatos('offline');
      }
    } catch (err) {
      console.warn('Conexión backend (usando backup seguro local):', err.message);
      setErrorHistorias('No se pudo conectar con el servidor backend. Mostrando contenido local de reserva.');
      setModoDatos('offline');
      setHistorias(HISTORIAS_BACKUP);
    } finally {
      setCargandoHistorias(false);
    }
  }, []);

  useEffect(() => {
    cargarHistoriasAPI();
  }, [cargarHistoriasAPI]);

  // Cargar frase inspiradora desde API externa pública vía Backend
  const cargarFraseExterna = useCallback(async (fraseActual = '') => {
    setCargandoFrase(true);
    try {
      const response = await api.get('/external/quote', {
        params: {
          excluir: fraseActual || undefined,
          t: Date.now()
        }
      });
      if (response.data && response.data.ok && response.data.data) {
        setFraseInspiradora(response.data.data);
      }
    } catch (err) {
      console.warn('Error al cargar frase inspiradora:', err.message);
      const disponibles = FRASES_FALLBACK_FRONTEND.filter((f) => f.frase !== fraseActual);
      const elegida = disponibles[Math.floor(Math.random() * disponibles.length)] || FRASES_FALLBACK_FRONTEND[0];
      setFraseInspiradora(elegida);
    } finally {
      setCargandoFrase(false);
    }
  }, []);

  useEffect(() => {
    cargarFraseExterna();
  }, [cargarFraseExterna]);

  useEffect(() => {
    if (!modalAbierto && !historiaEnEdicion) return undefined;
    const manejarEscape = (evento) => {
      if (evento.key !== 'Escape') return;
      if (modalAbierto) cerrarModalRegistro();
      if (historiaEnEdicion) setHistoriaEnEdicion(null);
    };
    window.addEventListener('keydown', manejarEscape);
    return () => window.removeEventListener('keydown', manejarEscape);
  }, [historiaEnEdicion, modalAbierto, cerrarModalRegistro]);

  const handleIngresoGoogle = async () => {
    setAutenticandoGoogle(true);
    try {
      const user = await loginConGoogle(rolSeleccionado);
      if (user) {
        mostrarFeedback(`¡Bienvenido/a a Empáticos, ${user.nombre}!`, 'exito');
      }
    } finally {
      setAutenticandoGoogle(false);
    }
  };

  const handleIngresoLocal = (e) => {
    e.preventDefault();
    const nombreLimpio = nombreAccesoLocal.trim();
    if (nombreLimpio.length < 2) {
      mostrarFeedback('Ingresá tu nombre o apodo (al menos 2 caracteres) para continuar.', 'error');
      return;
    }
    const user = loginLocal(nombreLimpio, rolSeleccionado);
    setNombreAccesoLocal('');
    mostrarFeedback(`¡Hola, ${user.nombre}! Ya podés publicar, comentar y reaccionar.`, 'exito');
  };

  // Crear nueva historia (POST /api/stories)
  const handlePublicar = async (e) => {
    e.preventDefault();
    if (!nuevoTitulo.trim() || nuevoTitulo.trim().length < 3) {
      mostrarFeedback('El título debe contener al menos 3 caracteres.', 'error');
      return;
    }
    if (!nuevoContenido.trim() || nuevoContenido.trim().length < 5) {
      mostrarFeedback('El contenido debe tener al menos 5 caracteres.', 'error');
      return;
    }

    const videoLimpio = nuevoVideoUrl.trim();
    const videoNormalizado = videoLimpio ? normalizarUrlVideo(videoLimpio) : '';
    if (videoLimpio && !videoNormalizado) {
      mostrarFeedback('El enlace de video no es una URL válida. Ejemplo: https://www.youtube.com/watch?v=...', 'error');
      return;
    }

    let usuarioActual = usuario;
    if (!usuarioActual) {
      abrirModalRegistro();
      mostrarFeedback('Iniciá sesión con Google o con tu nombre para publicar tu historia.', 'error');
      return;
    }

    setGuardandoHistoria(true);
    try {
      const payload = {
        author: usuarioActual.nombre || 'Paciente Empáticos',
        autorNombre: usuarioActual.nombre || 'Paciente Empáticos',
        autorUid: usuarioActual.uid || '',
        avatar: usuarioActual.fotoUrl || AVATAR_DEFAULT,
        autorFoto: usuarioActual.fotoUrl || AVATAR_DEFAULT,
        content: nuevoContenido.trim(),
        contenido: nuevoContenido.trim(),
        titulo: nuevoTitulo.trim(),
        rolAutor: usuarioActual.rol || rolSeleccionado || 'paciente',
        tipo: nuevoTipo,
        videoUrl: videoNormalizado,
        imageUrl: videoNormalizado
      };

      const res = await api.post('/stories', payload);
      const historiaRespuesta = res.data?.data || res.data?.publicacion;

      if (historiaRespuesta) {
        setHistorias((prev) => [historiaRespuesta, ...prev]);
      } else {
        await cargarHistoriasAPI();
      }

      setNuevoTitulo('');
      setNuevoContenido('');
      setNuevoVideoUrl('');
      setErrorHistorias(null);
      mostrarFeedback(res.data?.mensaje || '¡Publicación guardada con éxito!', 'exito');
    } catch (err) {
      console.error('Error al guardar publicación:', err);
      const msg =
        err.response?.data?.errores?.[0]?.mensaje ||
        err.response?.data?.mensaje ||
        'No se pudo conectar con el servidor para guardar la publicación.';
      mostrarFeedback(msg, 'error');
    } finally {
      setGuardandoHistoria(false);
    }
  };

  // Iniciar edición de una publicación
  const iniciarEdicion = (historia) => {
    setHistoriaEnEdicion({
      id: String(historia._id || historia.id),
      titulo: historia.titulo || '',
      contenido: historia.contenido || historia.content || '',
      tipo: historia.tipo || 'historia',
      videoUrl: historia.videoUrl || historia.imageUrl || ''
    });
    setEdicionTitulo(historia.titulo || '');
    setEdicionContenido(historia.contenido || historia.content || '');
    setEdicionTipo(historia.tipo === 'anecdota' ? 'anecdota' : 'historia');
    setEdicionVideoUrl(historia.videoUrl || historia.imageUrl || '');
  };

  // Guardar cambios de edición (PUT /api/stories/:id)
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!edicionTitulo.trim() || edicionTitulo.trim().length < 3) {
      mostrarFeedback('El título debe tener al menos 3 caracteres.', 'error');
      return;
    }
    if (!edicionContenido.trim() || edicionContenido.trim().length < 5) {
      mostrarFeedback('El contenido debe tener al menos 5 caracteres.', 'error');
      return;
    }

    const videoLimpio = edicionVideoUrl.trim();
    const videoNormalizado = videoLimpio ? normalizarUrlVideo(videoLimpio) : '';
    if (videoLimpio && !videoNormalizado) {
      mostrarFeedback('El enlace de video no es una URL válida.', 'error');
      return;
    }

    setGuardandoEdicion(true);
    try {
      const id = historiaEnEdicion.id;
      const res = await api.put(`/stories/${id}`, {
        titulo: edicionTitulo.trim(),
        contenido: edicionContenido.trim(),
        tipo: edicionTipo,
        videoUrl: videoNormalizado,
        imageUrl: videoNormalizado
      });

      if (res.status === 200 || res.data?.ok) {
        const actualizada = res.data?.data || res.data?.publicacion;
        setHistorias((prev) =>
          prev.map((h) => {
            if (String(h._id || h.id) === id) {
              return actualizada || {
                ...h,
                titulo: edicionTitulo.trim(),
                contenido: edicionContenido.trim(),
                content: edicionContenido.trim(),
                tipo: edicionTipo,
                videoUrl: videoNormalizado,
                imageUrl: videoNormalizado,
                updatedAt: new Date().toISOString()
              };
            }
            return h;
          })
        );
        setHistoriaEnEdicion(null);
        mostrarFeedback(res.data?.mensaje || '¡Publicación actualizada correctamente!', 'exito');
      }
    } catch (err) {
      console.error('Error al actualizar publicación:', err);
      const msg =
        err.response?.data?.errores?.[0]?.mensaje ||
        err.response?.data?.mensaje ||
        'Error al actualizar la publicación en el servidor.';
      mostrarFeedback(msg, 'error');
    } finally {
      setGuardandoEdicion(false);
    }
  };

  // Eliminar una publicación (DELETE /api/stories/:id - exclusivo administrador)
  const handleEliminar = async (id) => {
    if (!esAdmin) {
      mostrarFeedback('Acceso denegado. Solo la cuenta administradora autorizada puede eliminar publicaciones.', 'error');
      return;
    }

    const token = await obtenerTokenAutenticacion();
    if (!token) {
      mostrarFeedback('Tu sesión de Google expiró. Iniciá sesión nuevamente para eliminar publicaciones.', 'error');
      return;
    }

    setEliminandoId(id);
    try {
      const res = await api.delete(`/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.status === 200 || res.data?.ok) {
        setHistorias((prev) => prev.filter((h) => String(h._id || h.id) !== String(id)));
        setConfirmandoEliminarId(null);
        mostrarFeedback(res.data?.mensaje || 'Publicación eliminada correctamente.', 'exito');
      }
    } catch (err) {
      console.error('Error al eliminar publicación:', err);
      const msg = err.response?.data?.mensaje || 'No se pudo eliminar la publicación en la base de datos.';
      mostrarFeedback(msg, 'error');
    } finally {
      setEliminandoId(null);
    }
  };

  // Reaccionar a una publicación (POST /api/reactions)
  const handleReaccionar = async (storyId, tipoReaccion) => {
    let usuarioActual = usuario;
    if (!usuarioActual) {
      usuarioActual = loginLocal('Miembro Empáticos', rolSeleccionado || 'paciente');
    }

    const userId = String(usuarioActual?.uid || usuarioActual?.id || 'usr-anon');
    const historiasPrevias = historias;

    setHistorias((prev) =>
      prev.map((h) => {
        const idActual = String(h._id || h.id);
        if (idActual !== String(storyId)) return h;

        const reaccionesPrev = Array.isArray(h.reacciones) ? h.reacciones : [];
        const yaExisteMisma = reaccionesPrev.find(
          (r) => String(r.uid || r.userId || r.usuario) === userId && (r.tipo === tipoReaccion || r.type === tipoReaccion)
        );

        const sinUsuario = reaccionesPrev.filter((r) => String(r.uid || r.userId || r.usuario) !== userId);
        const nuevasReacciones = yaExisteMisma
          ? sinUsuario
          : [...sinUsuario, { uid: userId, userId, usuario: userId, tipo: tipoReaccion, type: tipoReaccion }];

        return { ...h, reacciones: nuevasReacciones };
      })
    );

    try {
      const res = await api.post('/reactions', {
        targetId: storyId,
        userId,
        uid: userId,
        type: tipoReaccion,
        tipo: tipoReaccion
      });

      if (res.data?.ok && Array.isArray(res.data?.data?.reacciones)) {
        const reaccionesBackend = res.data.data.reacciones;
        setHistorias((prev) =>
          prev.map((h) => (String(h._id || h.id) === String(storyId) ? { ...h, reacciones: reaccionesBackend } : h))
        );
      }
    } catch (err) {
      console.warn('Error al sincronizar reacción con la BD:', err.message);
      setHistorias(historiasPrevias);
      mostrarFeedback('No se pudo guardar tu reacción en el servidor. Verificá la conexión.', 'error');
    }
  };

  // Agregar comentario a una publicación (POST /api/stories/:id/comentarios)
  const handleComentar = async (e, storyId) => {
    e.preventDefault();
    const texto = (borradorComentario[storyId] || '').trim();
    if (texto.length < 2) {
      mostrarFeedback('El comentario debe tener al menos 2 caracteres.', 'error');
      return;
    }

    let usuarioActual = usuario;
    if (!usuarioActual) {
      abrirModalRegistro();
      mostrarFeedback('Iniciá sesión con Google o con tu nombre para comentar.', 'error');
      return;
    }

    setEnviandoComentarioId(storyId);
    try {
      const res = await api.post(`/stories/${storyId}/comentarios`, {
        uid: usuarioActual.uid || '',
        autorNombre: usuarioActual.nombre || 'Compañero Empático',
        autorFoto: usuarioActual.fotoUrl || AVATAR_DEFAULT,
        rolAutor: usuarioActual.rol || 'paciente',
        texto
      });

      if (res.data?.ok && Array.isArray(res.data?.data)) {
        setHistorias((prev) =>
          prev.map((h) => (String(h._id || h.id) === String(storyId) ? { ...h, comentarios: res.data.data } : h))
        );
        setBorradorComentario((prev) => ({ ...prev, [storyId]: '' }));
        mostrarFeedback('Comentario publicado con éxito.', 'exito');
      }
    } catch (err) {
      console.error('Error al comentar:', err);
      const msg =
        err.response?.data?.errores?.[0]?.mensaje ||
        err.response?.data?.mensaje ||
        'No se pudo guardar el comentario.';
      mostrarFeedback(msg, 'error');
    } finally {
      setEnviandoComentarioId(null);
    }
  };

  // Helpers de reacciones
  const obtenerConteo = (reaccionesList, tipoTarget) => {
    if (!reaccionesList) return 0;
    if (Array.isArray(reaccionesList)) {
      return reaccionesList.filter((r) => r.tipo === tipoTarget || r.type === tipoTarget).length;
    }
    if (typeof reaccionesList === 'object') {
      return reaccionesList[tipoTarget] || 0;
    }
    return 0;
  };

  const obtenerMiReaccion = (reaccionesList) => {
    if (!usuario || !Array.isArray(reaccionesList)) return null;
    const miUid = String(usuario.uid || usuario.id || '');
    const encontrada = reaccionesList.find((r) => String(r.uid || r.userId || r.usuario) === miUid);
    return encontrada ? (encontrada.tipo || encontrada.type) : null;
  };

  // Filtrar anécdotas
  const historiasFiltradas = historias.filter((h) => {
    if (seccionActiva === 'anecdotas') {
      return (
        h.tipo === 'anecdota' ||
        (h.titulo && h.titulo.toLowerCase().includes('anécdota')) ||
        (h.titulo && h.titulo.includes('😂')) ||
        (h.titulo && h.titulo.includes('😄'))
      );
    }
    return true;
  });

  const noticiasFiltradas = categoriaNoticia === 'Todas'
    ? NOTICIAS_ORIGINALES
    : NOTICIAS_ORIGINALES.filter((noticia) => noticia.categoria === categoriaNoticia);

  const etiquetaModoDatos =
    modoDatos === 'mongodb_atlas'
      ? 'Conectado a MongoDB Atlas'
      : modoDatos === 'local_persistente'
        ? 'Base de datos local persistente activa'
        : modoDatos === 'offline'
          ? 'Modo reserva sin conexión al servidor'
          : 'Conectando con la base de datos...';

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-800 font-sans flex flex-col justify-between">
      <div>
        {/* Barra de navegación */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white shadow-md border-b border-orange-600">
          <div className="max-w-6xl mx-auto px-3 md:px-4 min-h-16 md:min-h-20 py-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => cambiarSeccion('inicio')}
              aria-label="Volver al inicio de Empáticos"
              className="flex items-center gap-2 md:gap-3 cursor-pointer select-none group shrink-0 bg-transparent text-left border-0 px-1"
            >
              <img
                src="/images/LogoEMpaticos2.png"
                alt="Logo de Empáticos, comunidad de apoyo en esclerosis múltiple"
                className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/20 object-contain p-1 shadow-inner border border-white/30 group-hover:scale-105 transition-transform"
              />
              <span>
                <span className="text-lg md:text-2xl font-black font-montserrat text-outline-black uppercase tracking-tight text-white block leading-tight">
                  Empáticos
                </span>
                <span className="text-[9px] md:text-[10px] font-bold tracking-widest text-orange-100 uppercase block">
                  Comunidad & Apoyo
                </span>
              </span>
            </button>

            <nav aria-label="Navegación principal" className="hidden lg:flex items-center gap-1.5 bg-orange-600/40 p-1.5 rounded-full border border-orange-400/50 backdrop-blur-md">
              {['inicio', 'historias', 'anecdotas', 'noticias', 'nosotros'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => cambiarSeccion(tab)}
                  aria-pressed={seccionActiva === tab}
                  className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold capitalize transition-all duration-200 ${
                    seccionActiva === tab
                      ? 'bg-white text-orange-600 shadow-md scale-105'
                      : 'text-orange-100 hover:text-white hover:bg-white/20'
                  }`}
                >
                  {tab === 'anecdotas' ? '😄 Anécdotas' : tab}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:gap-3 shrink-0">
              <a
                href="https://www.instagram.com/em.paticos2026/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white hidden sm:flex items-center justify-center border border-white/30 backdrop-blur-md transition-all hover:scale-110 shadow-sm"
                title="Síguenos en Instagram @em.paticos2026"
                aria-label="Seguir a Empáticos en Instagram"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              {usuario ? (
                <div className="flex items-center gap-2 md:gap-3 bg-orange-600/50 pl-2 pr-1.5 py-1 rounded-full border border-orange-400 text-white backdrop-blur-md">
                  <img
                    src={usuario.fotoUrl || AVATAR_DEFAULT}
                    alt={`Foto de perfil de ${usuario.nombre}`}
                    className="w-8 h-8 rounded-full object-cover border border-white/60"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight max-w-[130px] truncate">{usuario.nombre}</p>
                    <p className="text-[10px] text-orange-200 font-semibold capitalize">{usuario.rol || 'paciente'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    aria-label={`Cerrar sesión de ${usuario.nombre}`}
                    className="px-3 rounded-full text-xs font-bold text-orange-100 hover:text-white hover:bg-white/15 transition-colors"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={abrirModalRegistro}
                  aria-label="Unirme a la comunidad Empáticos"
                  className="bg-white hover:bg-orange-50 text-orange-600 px-5 py-2.5 rounded-full text-xs md:text-sm font-black font-montserrat uppercase shadow-md border border-white/80 transition-all hover:scale-105 active:scale-95"
                >
                  Unirme
                </button>
              )}
            </div>
          </div>

          {/* Navegación móvil */}
          <div className="lg:hidden px-3 pb-3 pt-1 overflow-x-auto scrollbar-hide">
            <nav aria-label="Navegación principal en móvil" className="flex items-center gap-2 min-w-max">
              {['inicio', 'historias', 'anecdotas', 'noticias', 'nosotros'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => cambiarSeccion(tab)}
                  aria-pressed={seccionActiva === tab}
                  className={`px-4 py-2 rounded-full text-xs font-bold capitalize transition-all duration-200 border ${
                    seccionActiva === tab
                      ? 'bg-white text-orange-600 shadow-sm border-white'
                      : 'bg-white/10 text-orange-50 hover:bg-white/20 border-white/20'
                  }`}
                >
                  {tab === 'anecdotas' ? '😄 Anécdotas' : tab}
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Banner de frase motivacional (API externa vía Axios) */}
        {fraseInspiradora && (
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-inner transition-all border-b border-orange-700">
            <div className="max-w-5xl mx-auto px-4 py-2 text-center flex flex-wrap items-center justify-center gap-3">
              <p className="text-xs md:text-sm font-medium italic">
                <span aria-hidden="true" className="mr-1.5 not-italic">💡</span>
                &ldquo;{fraseInspiradora.frase || fraseInspiradora.texto}&rdquo; —{' '}
                <span className="font-bold not-italic">{fraseInspiradora.autor || fraseInspiradora.author}</span>
              </p>
              <button
                type="button"
                onClick={() => cargarFraseExterna(fraseInspiradora.frase || fraseInspiradora.texto)}
                disabled={cargandoFrase}
                title="Consultar otra frase inspiradora"
                aria-label="Cargar otra frase inspiradora"
                className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {cargandoFrase ? (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span aria-hidden="true">🔄</span>
                )}
                <span>Otra frase</span>
              </button>
            </div>
          </div>
        )}

        {/* Alertas de feedback */}
        {mensajeFeedback && (
          <div className="max-w-4xl mx-auto px-4 pt-4 animate-fadeIn">
            <div
              role={mensajeFeedback.tipo === 'error' ? 'alert' : 'status'}
              aria-live="polite"
              className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 border shadow-sm transition-all ${
                mensajeFeedback.tipo === 'exito'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
                <span aria-hidden="true" className="text-base">{mensajeFeedback.tipo === 'exito' ? '✅' : '⚠️'}</span>
                <span>{mensajeFeedback.texto}</span>
              </div>
              <button
                type="button"
                onClick={() => setMensajeFeedback(null)}
                aria-label="Cerrar notificación"
                className="text-sm font-bold opacity-70 hover:opacity-100 rounded-full px-3 transition-opacity"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Sección Hero */}
        {seccionActiva === 'inicio' && (
          <section className="relative overflow-hidden py-14 md:py-16 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/70 border border-orange-200/60 text-orange-800 text-xs font-semibold">
                ✨ Red Comunitaria de Esclerosis Múltiple
              </div>
              <h1 className="text-4xl md:text-6xl font-black font-montserrat text-white text-outline-black uppercase tracking-tight leading-tight">
                Nadie camina solo en este proceso.
              </h1>
              <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Un espacio seguro creado para que pacientes, familiares y acompañantes puedan compartir testimonios reales, anécdotas divertidas con humor, encontrar contención y acceder a novedades científicas sobre EM.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={() => cambiarSeccion('historias')}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black font-montserrat text-outline-black uppercase px-8 py-3.5 rounded-full shadow-lg shadow-orange-500/25 transition-transform hover:scale-105"
                >
                  Ver Muro de Historias
                </button>
                <button
                  type="button"
                  onClick={() => cambiarSeccion('anecdotas')}
                  className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-black font-montserrat text-outline-black uppercase px-8 py-3.5 rounded-full shadow-md transition-transform hover:scale-105"
                >
                  😄 Anécdotas Divertidas
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Contenido principal */}
        <main id="main-content" tabIndex={-1} className="max-w-6xl mx-auto px-4 py-8 space-y-16">
          {/* Video explicativo */}
          {(seccionActiva === 'inicio' || seccionActiva === 'nosotros') && (
            <section className="bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-100/30 p-6 md:p-10 rounded-3xl border border-orange-200/80 shadow-sm space-y-6">
              <div className="max-w-3xl mx-auto text-center space-y-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
                  🎬 Video Educativo & Concientización
                </span>
                <h2 className="text-2xl md:text-4xl font-black font-montserrat text-white text-outline-black uppercase tracking-tight">
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
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-center text-xs">
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <span aria-hidden="true" className="text-2xl block">🧠</span>
                  <p className="font-bold text-slate-800 mt-1">Enfermedad Autoinmune</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">El sistema inmune afecta el sistema nervioso central</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <span aria-hidden="true" className="text-2xl block">🛡️</span>
                  <p className="font-bold text-slate-800 mt-1">La Vaina de Mielina</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Capa protectora de las neuronas que transmite impulsos</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm">
                  <span aria-hidden="true" className="text-2xl block">🤝</span>
                  <p className="font-bold text-slate-800 mt-1">Apoyo & Empatía</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">Comprender los síntomas invisibles nos conecta a todos</p>
                </div>
              </div>
            </section>
          )}

          {/* Muro Comunitario */}
          {(seccionActiva === 'inicio' || seccionActiva === 'historias' || seccionActiva === 'anecdotas') && (
            <section className="space-y-8" aria-labelledby="titulo-muro">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 border-b border-orange-100 pb-4">
                <div>
                  <h2 id="titulo-muro" className="text-2xl md:text-3xl font-black font-montserrat text-white text-outline-black uppercase">
                    {seccionActiva === 'anecdotas' ? '😄 Anecdotario & Humor Comunitario' : 'Muro de la Comunidad'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {seccionActiva === 'anecdotas'
                      ? 'No todo es superación solemne: ¡nos reímos de los despistes, ocurrencias y momentos insólitos!'
                      : 'Experiencias, videos y testimonios compartidos por la comunidad'}
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-full text-xs font-semibold border ${
                  modoDatos === 'offline'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <span aria-hidden="true">{modoDatos === 'offline' ? '🟡' : '🟢'}</span>
                  <span>{etiquetaModoDatos}</span>
                </span>
              </div>

              {/* Formulario de publicación */}
              <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
                    ✍️ Publicar una Historia o Anécdota
                  </h3>
                  <div role="group" aria-label="Tipo de publicación" className="flex gap-2 text-xs w-full sm:w-auto">
                    <button
                      type="button"
                      aria-pressed={nuevoTipo === 'historia'}
                      onClick={() => setNuevoTipo('historia')}
                      className={`px-4 py-2 rounded-full font-bold transition-all ${
                        nuevoTipo === 'historia'
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      📖 Historia
                    </button>
                    <button
                      type="button"
                      aria-pressed={nuevoTipo === 'anecdota'}
                      onClick={() => setNuevoTipo('anecdota')}
                      className={`px-4 py-2 rounded-full font-bold transition-all ${
                        nuevoTipo === 'anecdota'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      😄 Anécdota
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePublicar} className="space-y-3">
                  <div>
                    <label htmlFor="nuevoTitulo" className="sr-only">Título de tu publicación</label>
                    <input
                      id="nuevoTitulo"
                      name="nuevoTitulo"
                      type="text"
                      placeholder={nuevoTipo === 'anecdota' ? 'Título divertido (ej: El día que dejé el teléfono en la heladera)...' : 'Título de tu publicación...'}
                      value={nuevoTitulo}
                      onChange={(e) => setNuevoTitulo(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="nuevoContenido" className="sr-only">Contenido de tu historia o anécdota</label>
                    <textarea
                      id="nuevoContenido"
                      name="nuevoContenido"
                      rows={3}
                      placeholder={nuevoTipo === 'anecdota' ? 'Contá esa situación insólita o cómica que te pasó conviviendo con la EM...' : 'Escribe tu vivencia, consejo o mensaje para la comunidad...'}
                      value={nuevoContenido}
                      onChange={(e) => setNuevoContenido(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y"
                    />
                  </div>

                  <div className="pt-1">
                    <label htmlFor="nuevoVideoUrl" className="text-xs font-bold text-slate-600 block mb-1">
                      🎬 Link de Video (Opcional — YouTube o MP4)
                    </label>
                    <input
                      id="nuevoVideoUrl"
                      name="nuevoVideoUrl"
                      type="text"
                      inputMode="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={nuevoVideoUrl}
                      onChange={(e) => setNuevoVideoUrl(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-2">
                    <span className="text-xs text-slate-500 text-center sm:text-left">
                      {usuario ? `Publicando como ${usuario.nombre} (${usuario.rol || 'paciente'})` : 'Unite con Google o con tu nombre para publicar'}
                    </span>
                    <button
                      type="submit"
                      disabled={guardandoHistoria}
                      className="w-full sm:w-auto justify-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-6 py-2.5 rounded-full transition-all shadow-sm disabled:opacity-50 flex items-center gap-2"
                    >
                      {guardandoHistoria && (
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      <span>{guardandoHistoria ? 'Guardando...' : nuevoTipo === 'anecdota' ? 'Publicar Anécdota' : 'Publicar Historia'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Listado de publicaciones */}
              {cargandoHistorias ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-busy="true" aria-label="Cargando publicaciones">
                  {[1, 2].map((item) => (
                    <div key={item} className="p-6 bg-white rounded-3xl border border-orange-100 shadow-sm animate-pulse space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-slate-200 rounded w-1/3" />
                          <div className="h-3 bg-slate-100 rounded w-1/5" />
                        </div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  {errorHistorias && (
                    <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm rounded-2xl flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true">⚠️</span>
                        <span>{errorHistorias}</span>
                      </div>
                      <button
                        type="button"
                        onClick={cargarHistoriasAPI}
                        className="px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                      >
                        🔄 Reintentar conexión
                      </button>
                    </div>
                  )}

                  {historiasFiltradas.length === 0 ? (
                    <div className="bg-white p-8 rounded-3xl border border-orange-100 text-center space-y-2">
                      <p className="text-sm font-bold text-slate-700">
                        {seccionActiva === 'anecdotas'
                          ? 'Todavía no hay anécdotas publicadas.'
                          : 'Todavía no hay historias publicadas en el muro.'}
                      </p>
                      <p className="text-xs text-slate-500">¡Sé la primera persona en compartir la tuya usando el formulario de arriba!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {historiasFiltradas.map((historia) => {
                        const idUnico = String(historia._id || historia.id);
                        const fuerzaCount = obtenerConteo(historia.reacciones, 'fuerza');
                        const abrazoCount = obtenerConteo(historia.reacciones, 'abrazo');
                        const graciasCount = obtenerConteo(historia.reacciones, 'gracias');
                        const miReaccion = obtenerMiReaccion(historia.reacciones);
                        const nombreAutor = historia.author || historia.autorNombre || 'Anónimo';
                        const avatarAutor = historia.avatar || historia.autorFoto || AVATAR_DEFAULT;
                        const textoContenido = historia.content || historia.contenido || '';
                        const videoTarget = historia.videoUrl || historia.imageUrl || '';
                        const embedYoutube = obtenerEmbedYoutube(videoTarget);
                        const comentarios = Array.isArray(historia.comentarios) ? historia.comentarios : [];
                        const comentariosVisibles = Boolean(comentariosAbiertos[idUnico]);

                        const textoVozHistoria = normalizarTextoVoz(
                          `${historia.titulo || 'Publicación comunitaria'}. Publicado por ${nombreAutor}. ${textoContenido}`
                        );
                        const reproduciendoHistoria = hablando && textoActual === textoVozHistoria;

                        return (
                          <article key={idUnico} className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative">
                            {historia.tipo === 'anecdota' && (
                              <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                                😄 Anécdota
                              </span>
                            )}

                            <div className="space-y-3">
                              <div className="flex items-center gap-3 pr-24">
                                <img
                                  src={avatarAutor}
                                  alt={`Avatar de ${nombreAutor}`}
                                  className="w-10 h-10 rounded-full object-cover border border-orange-200 shrink-0"
                                />
                                <div>
                                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{nombreAutor}</h4>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-orange-600 font-semibold capitalize">{historia.rolAutor || 'paciente'}</span>
                                    <span className="text-slate-300" aria-hidden="true">•</span>
                                    <span className="text-slate-400">
                                      {historia.createdAt ? new Date(historia.createdAt).toLocaleDateString('es-AR') : historia.fecha || 'Reciente'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <h3 className="font-bold text-slate-800 text-base">{historia.titulo || 'Publicación comunitaria'}</h3>
                              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{textoContenido}</p>

                              {/* Reproductor embebido de video */}
                              {embedYoutube ? (
                                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-video bg-black mt-2">
                                  <iframe
                                    className="w-full h-full"
                                    src={embedYoutube}
                                    title={historia.titulo || 'Video compartido en Empáticos'}
                                    loading="lazy"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              ) : (videoTarget && /\.mp4(\?.*)?$/i.test(videoTarget)) ? (
                                <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 aspect-video bg-black mt-2">
                                  <video controls className="w-full h-full">
                                    <source src={videoTarget} type="video/mp4" />
                                    Tu navegador no soporta reproducción de video.
                                  </video>
                                </div>
                              ) : null}
                            </div>

                            <div className="space-y-3 pt-3 border-t border-slate-100">
                              {/* Reacciones */}
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  <button
                                    type="button"
                                    aria-pressed={miReaccion === 'fuerza'}
                                    aria-label={`Enviar fuerza a ${nombreAutor}, actualmente ${fuerzaCount}`}
                                    onClick={() => handleReaccionar(idUnico, 'fuerza')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                                      miReaccion === 'fuerza'
                                        ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                                        : 'bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border-slate-200/70'
                                    }`}
                                  >
                                    💪 Fuerza <span className="font-bold">{fuerzaCount}</span>
                                  </button>
                                  <button
                                    type="button"
                                    aria-pressed={miReaccion === 'abrazo'}
                                    aria-label={`Enviar abrazo a ${nombreAutor}, actualmente ${abrazoCount}`}
                                    onClick={() => handleReaccionar(idUnico, 'abrazo')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                                      miReaccion === 'abrazo'
                                        ? 'bg-rose-500 text-white border-rose-600 shadow-sm'
                                        : 'bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border-slate-200/70'
                                    }`}
                                  >
                                    🫂 Abrazo <span className="font-bold">{abrazoCount}</span>
                                  </button>
                                  <button
                                    type="button"
                                    aria-pressed={miReaccion === 'gracias'}
                                    aria-label={`Dar gracias a ${nombreAutor}, actualmente ${graciasCount}`}
                                    onClick={() => handleReaccionar(idUnico, 'gracias')}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                                      miReaccion === 'gracias'
                                        ? 'bg-teal-600 text-white border-teal-700 shadow-sm'
                                        : 'bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-700 border-slate-200/70'
                                    }`}
                                  >
                                    🙏 Gracias <span className="font-bold">{graciasCount}</span>
                                  </button>
                                </div>
                              </div>

                              {/* Acciones secundarias: Escuchar, Comentarios, Editar y Eliminar */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => (reproduciendoHistoria ? detener() : hablar(textoVozHistoria))}
                                    aria-pressed={reproduciendoHistoria}
                                    aria-label={`${reproduciendoHistoria ? 'Detener lectura de' : 'Escuchar'} ${historia.titulo}`}
                                    className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors flex items-center gap-1.5"
                                  >
                                    <span aria-hidden="true">{reproduciendoHistoria ? '⏹' : '🔊'}</span>
                                    <span>{reproduciendoHistoria ? 'Detener' : 'Escuchar'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    aria-expanded={comentariosVisibles}
                                    aria-label={`${comentariosVisibles ? 'Ocultar' : 'Ver'} ${comentarios.length} comentarios`}
                                    onClick={() =>
                                      setComentariosAbiertos((prev) => ({ ...prev, [idUnico]: !prev[idUnico] }))
                                    }
                                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200/70 text-xs font-bold transition-colors flex items-center gap-1.5"
                                  >
                                    <span aria-hidden="true">💬</span>
                                    <span>{comentarios.length} {comentarios.length === 1 ? 'comentario' : 'comentarios'}</span>
                                  </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => iniciarEdicion(historia)}
                                    title="Editar publicación"
                                    aria-label={`Editar publicación de ${nombreAutor}`}
                                    className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-amber-100 text-slate-600 hover:text-amber-800 text-xs font-bold transition-all border border-slate-200/60 flex items-center gap-1 active:scale-95"
                                  >
                                    ✏️ <span>Editar</span>
                                  </button>

                                  {esAdmin && (
                                    confirmandoEliminarId === idUnico ? (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleEliminar(idUnico)}
                                          disabled={eliminandoId === idUnico}
                                          aria-label={`Confirmar eliminación de la publicación de ${nombreAutor}`}
                                          className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                                        >
                                          {eliminandoId === idUnico ? 'Borrando...' : 'Confirmar'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmandoEliminarId(null)}
                                          aria-label="Cancelar eliminación de publicación"
                                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => setConfirmandoEliminarId(idUnico)}
                                        title="Eliminar publicación (solo administrador)"
                                        aria-label={`Eliminar publicación de ${nombreAutor}`}
                                        className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-bold transition-all border border-slate-200/60 flex items-center gap-1 active:scale-95"
                                      >
                                        🗑️ <span>Eliminar</span>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>

                              {/* Panel de Comentarios */}
                              {comentariosVisibles && (
                                <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                    {comentarios.length === 0 ? (
                                      <p className="text-xs text-slate-400 italic">Todavía no hay comentarios. ¡Dejá un mensaje de apoyo!</p>
                                    ) : (
                                      comentarios.map((c) => (
                                        <div key={c._id || c.id} className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs space-y-1">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="font-bold text-slate-800">
                                              {c.autorNombre}{' '}
                                              <span className="font-semibold text-orange-600 capitalize">({c.rolAutor || 'paciente'})</span>
                                            </span>
                                            {c.createdAt && (
                                              <span className="text-[10px] text-slate-400">
                                                {new Date(c.createdAt).toLocaleDateString('es-AR')}
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-slate-600 leading-relaxed">{c.texto}</p>
                                        </div>
                                      ))
                                    )}
                                  </div>

                                  <form onSubmit={(e) => handleComentar(e, idUnico)} className="flex flex-col sm:flex-row gap-2">
                                    <label htmlFor={`comentario-${idUnico}`} className="sr-only">
                                      Escribir un comentario de apoyo
                                    </label>
                                    <input
                                      id={`comentario-${idUnico}`}
                                      type="text"
                                      value={borradorComentario[idUnico] || ''}
                                      onChange={(e) =>
                                        setBorradorComentario((prev) => ({ ...prev, [idUnico]: e.target.value }))
                                      }
                                      placeholder="Escribí un mensaje de apoyo..."
                                      disabled={enviandoComentarioId === idUnico}
                                      className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                    <button
                                      type="submit"
                                      disabled={enviandoComentarioId === idUnico}
                                      className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-colors disabled:opacity-50"
                                    >
                                      {enviandoComentarioId === idUnico ? 'Enviando...' : 'Comentar'}
                                    </button>
                                  </form>
                                </div>
                              )}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Noticias científicas y avances médicos */}
          {(seccionActiva === 'inicio' || seccionActiva === 'noticias') && (
            <section className="space-y-8" aria-labelledby="titulo-noticias">
              <div className="flex flex-col gap-4 border-b border-orange-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 id="titulo-noticias" className="text-2xl md:text-3xl font-black font-montserrat text-white text-outline-black uppercase">
                    Noticias y Avances Globales en EM
                  </h2>
                  <p className="text-sm text-slate-500">Estudios, tratamientos y recursos de fuentes médicas oficiales</p>
                </div>
                <div role="group" aria-label="Filtrar noticias por categoría" className="flex flex-wrap gap-2">
                  {['Todas', 'Investigación', 'Tratamientos', 'Bienestar', 'Comunidad'].map((categoria) => (
                    <button
                      key={categoria}
                      type="button"
                      aria-pressed={categoriaNoticia === categoria}
                      onClick={() => setCategoriaNoticia(categoria)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
                        categoriaNoticia === categoria
                          ? 'bg-orange-500 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-orange-100 hover:bg-orange-50'
                      }`}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              </div>

              {noticiasFiltradas.length === 0 ? (
                <p className="rounded-3xl border border-orange-100 bg-white p-6 text-center text-sm text-slate-500">
                  No hay noticias disponibles en esta categoría.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {noticiasFiltradas.map((noticia) => {
                    const textoVoz = normalizarTextoVoz(
                      `${noticia.titulo}. ${noticia.resumen}. Tiempo de lectura: ${noticia.tiempoLectura}. Fuente: ${noticia.fuente}.`
                    );
                    const reproduciendo = hablando && textoActual === textoVoz;

                    return (
                      <article key={noticia.id} className="bg-white rounded-3xl border border-orange-100 overflow-hidden shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow">
                        <div>
                          <div className="h-44 overflow-hidden relative">
                            <img
                              src={noticia.imagen}
                              alt={`Imagen ilustrativa de ${noticia.categoria.toLowerCase()}: ${noticia.titulo}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <span className="absolute top-3 left-3 bg-orange-600/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {noticia.categoria}
                            </span>
                          </div>

                          <div className="p-5 space-y-2.5">
                            <div className="flex justify-between text-xs text-slate-400">
                              <span>{noticia.fecha}</span>
                              <span aria-label={`Tiempo de lectura: ${noticia.tiempoLectura}`}>⏱️ {noticia.tiempoLectura}</span>
                            </div>
                            <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-orange-600 transition-colors">
                              {noticia.titulo}
                            </h3>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {noticia.resumen}
                            </p>
                          </div>
                        </div>

                        <div className="p-5 pt-0">
                          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                            <cite className="not-italic text-slate-500 truncate max-w-[170px]" title={noticia.fuente}>
                              {noticia.fuente}
                            </cite>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => (reproduciendo ? detener() : hablar(textoVoz))}
                                aria-pressed={reproduciendo}
                                aria-label={`${reproduciendo ? 'Detener lectura de' : 'Escuchar'} ${noticia.titulo}`}
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-4 py-2 font-bold text-amber-800 hover:bg-amber-100"
                              >
                                <span aria-hidden="true">{reproduciendo ? '⏹' : '🔊'}</span>
                                <span>{reproduciendo ? 'Detener' : 'Escuchar'}</span>
                              </button>
                              <a
                                href={noticia.fuenteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Abrir fuente oficial: ${noticia.fuente}`}
                                className="text-orange-600 font-bold hover:text-orange-700 inline-flex items-center gap-1 px-2 shrink-0"
                              >
                                Fuente oficial ↗
                              </a>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Sobre la plataforma */}
          {seccionActiva === 'nosotros' && (
            <section className="max-w-3xl mx-auto bg-white p-8 rounded-3xl border border-orange-100 shadow-sm space-y-6 text-center">
              <span aria-hidden="true" className="text-4xl block">🧡</span>
              <h2 className="text-3xl font-black font-montserrat text-white text-outline-black uppercase">
                Sobre la Plataforma Empáticos
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                Empáticos es un proyecto desarrollado como plataforma de apoyo comunitario para personas que conviven con Esclerosis Múltiple, familiares y cuidadores. Integra testimonios en tiempo real, anécdotas con humor y divulgación científica de fuentes médicas oficiales.
              </p>

              <div className="pt-2">
                <a
                  href="https://www.instagram.com/em.paticos2026/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 text-white font-bold text-sm shadow-md hover:scale-105 transition-transform"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span>Seguinos en Instagram @em.paticos2026</span>
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div className="p-3 bg-orange-50/50 rounded-2xl">
                  <span aria-hidden="true" className="text-xl block">🤝</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">Apoyo Mutuo</p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-2xl">
                  <span aria-hidden="true" className="text-xl block">🔬</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">Avances en EM</p>
                </div>
                <div className="p-3 bg-orange-50/50 rounded-2xl">
                  <span aria-hidden="true" className="text-xl block">🛡️</span>
                  <p className="font-bold text-slate-800 text-xs mt-1">Espacio Seguro</p>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal de acceso (Google + Ingreso rápido con nombre) */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-unete" className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={cerrarModalRegistro}
              aria-label="Cerrar ventana de acceso"
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold rounded-full hover:bg-slate-100 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center text-2xl">
                🤝
              </div>
              <h3 id="titulo-unete" className="text-xl font-black font-montserrat text-white text-outline-black uppercase">
                Únete a Empáticos
              </h3>
              <p className="text-xs text-slate-500">
                Elegí tu rol e ingresá con tu cuenta de Google o con tu nombre para compartir en la comunidad.
              </p>
            </div>

            {errorAuth && (
              <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                {errorAuth}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="rolSeleccionado" className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                ¿Cuál es tu rol en la comunidad?
              </label>
              <select
                id="rolSeleccionado"
                name="rolSeleccionado"
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
              type="button"
              onClick={handleIngresoGoogle}
              disabled={autenticandoGoogle}
              aria-label="Continuar con Google para unirme a Empáticos"
              className="w-full bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 py-3 rounded-2xl font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-colors hover:border-slate-300 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{autenticandoGoogle ? 'Conectando con Google...' : 'Continuar con Google'}</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              <span>o ingresá con tu nombre</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <form onSubmit={handleIngresoLocal} className="space-y-3">
              <div>
                <label htmlFor="nombreAccesoLocal" className="text-xs font-bold text-slate-700 block mb-1">
                  Tu nombre o apodo
                </label>
                <input
                  id="nombreAccesoLocal"
                  type="text"
                  value={nombreAccesoLocal}
                  onChange={(e) => setNombreAccesoLocal(e.target.value)}
                  placeholder="Ej: Laura M."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-bold text-sm shadow-sm transition-colors"
              >
                Ingresar a la comunidad
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Editar Publicación existente (PUT /api/stories/:id) */}
      {historiaEnEdicion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div role="dialog" aria-modal="true" aria-labelledby="titulo-editar" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-orange-100 relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setHistoriaEnEdicion(null)}
              aria-label="Cerrar editor de publicación"
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 text-xl font-bold rounded-full hover:bg-slate-100 flex items-center justify-center"
            >
              ✕
            </button>

            <div className="border-b border-slate-100 pb-3 pr-10">
              <h3 id="titulo-editar" className="text-lg font-bold text-slate-900 flex items-center gap-2">
                ✏️ Editar Publicación
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Modificá los datos del testimonio. Los cambios se actualizarán de inmediato en la base de datos.
              </p>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4">
              <div className="flex gap-2 text-xs" role="group" aria-label="Tipo de publicación en edición">
                <button
                  type="button"
                  aria-pressed={edicionTipo === 'historia'}
                  onClick={() => setEdicionTipo('historia')}
                  className={`px-4 py-2 rounded-full font-bold transition-all ${
                    edicionTipo === 'historia'
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📖 Historia
                </button>
                <button
                  type="button"
                  aria-pressed={edicionTipo === 'anecdota'}
                  onClick={() => setEdicionTipo('anecdota')}
                  className={`px-4 py-2 rounded-full font-bold transition-all ${
                    edicionTipo === 'anecdota'
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  😄 Anécdota
                </button>
              </div>

              <div>
                <label htmlFor="edicionTitulo" className="block text-xs font-bold text-slate-700 mb-1">
                  Título de la Publicación
                </label>
                <input
                  id="edicionTitulo"
                  type="text"
                  value={edicionTitulo}
                  onChange={(e) => setEdicionTitulo(e.target.value)}
                  placeholder="Título (mínimo 3 caracteres)..."
                  required
                  minLength={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium"
                />
              </div>

              <div>
                <label htmlFor="edicionContenido" className="block text-xs font-bold text-slate-700 mb-1">
                  Contenido / Vivencia
                </label>
                <textarea
                  id="edicionContenido"
                  rows={4}
                  value={edicionContenido}
                  onChange={(e) => setEdicionContenido(e.target.value)}
                  placeholder="Contenido (mínimo 5 caracteres)..."
                  required
                  minLength={5}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-y font-medium"
                />
              </div>

              <div>
                <label htmlFor="edicionVideoUrl" className="block text-xs font-bold text-slate-700 mb-1">
                  🎬 Link de Video (Opcional — YouTube o MP4)
                </label>
                <input
                  id="edicionVideoUrl"
                  type="text"
                  inputMode="url"
                  value={edicionVideoUrl}
                  onChange={(e) => setEdicionVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHistoriaEnEdicion(null)}
                  className="px-4 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoEdicion}
                  className="px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {guardandoEdicion && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  <span>{guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-orange-600 bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 py-8 text-center text-xs text-orange-100 shadow-inner">
        <div className="max-w-6xl mx-auto px-4 space-y-3">
          <div className="flex justify-center items-center gap-2 text-white text-base font-bold">
            <span aria-hidden="true">🧡</span> Empáticos
          </div>
          <p>© 2026 Empáticos — Desarrollado por Matías Torres. Global Academy.</p>
          <div className="pt-1">
            <a
              href="https://www.instagram.com/em.paticos2026/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4 text-orange-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
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
      <AccessibilityToolbar />
      <MuroComunitarioApp />
    </AuthProvider>
  );
}
