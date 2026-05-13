/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  📊 PANEL ADMINISTRATIVO - admin.jsx                                      ║
 * ║  Maneja: Login de admin, revisión y aprobación de historias de Firestore  ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * 🏗️ ARQUITECTURA DEL ARCHIVO:
 * ================================
 * 
 * 1. SETUP INICIAL
 *    - Importo los React hooks
 *    - Defino la contraseña maestra del admin
 * 
 * 2. CONTEXT API
 *    - AdminContext: contenedor para compartir datos
 *    - useAdminContext(): hook para acceder a ese contexto
 *    - AdminProvider: componente que proporciona los datos a los componentes hijos
 * 
 * 3. LÓGICA DE DATOS - useAdminHistorias
 *    - fetchHistorias(): 🔁 LOOP forEach - trae historias no aprobadas de Firebase
 *    - approveStory(): marca una historia como aprobada
 *    - rejectStory(): elimina permanentemente una historia
 * 
 * 4. COMPONENTE PRINCIPAL - AdminApp
 *    - Manejo del estado de login
 *    - Renderizado condicional (si está logueado o no)
 *    - Creo el contexto para los componentes hijos
 * 
 * 5. COMPONENTES VISUALES
 *    - LoginPanel: formulario de contraseña
 *    - AdminHeader: encabezado con botones
 *    - StoryCard: tarjeta individual de una historia
 *    - AdminContent: contenedor principal con 🔁 LOOP map para renderizar todas las tarjetas
 * 
 * 6. RENDERIZADO FINAL
 *    - Monto la app en el DOM
 * 
 * 🎨 CÓMO DIFERENCIAR LÓGICA DE VISUAL:
 * ========================================
 * LÓGICA (código que procesa datos):
 *   - useState, useCallback, useMemo (manejo de estado)
 *   - Funciones async (consultas a Firebase)
 *   - Condicionales (if, ternarios)
 *   - Loops (forEach, map)
 * 
 * VISUAL (todo lo que ves en pantalla):
 *   - JSX (HTML en JavaScript)
 *   - Clases Bootstrap (btn, card, row, col, etc.)
 *   - Estructura de elementos HTML
 *   - Estilos y diseño
 * 
 * 🔁 LOOPS QUE USAMOS EN ESTE CÓDIGO:
 * =====================================
 * - LOOP #1: querySnapshot.forEach(...) en fetchHistorias
 *   Itera sobre cada documento de Firebase para agregarlos a un array
 * 
 * - LOOP #2: historias.map(...) en AdminContent
 *   Itera sobre el array de historias y renderiza una tarjeta para cada una
 */

// ============================================================
// 📌 IMPORTACIONES Y CONFIGURACIÓN INICIAL
// ============================================================
// window.db viene de firebase-config.js
// Es la conexión a la base de datos de Firebase que se cargó antes en el HTML

// Estos son los React hooks que usamos:
// - useState: para guardar datos que cambian (estado)
// - useCallback: para optimizar funciones (que no se recreen innecesariamente)
// - useMemo: para optimizar valores (que no se recalculen innecesariamente)
// - createContext + useContext: para compartir datos entre componentes

const { useState, useEffect, useCallback, useMemo, createContext, useContext } = React;

// 🔐 La contraseña maestra del panel admin
const ADMIN_PASSWORD = "EMpaticos2025arg";

// ============================================================
// 🎯 CONTEXT API: AdminContext
// ============================================================
// Este es un contenedor de datos que me permite compartir información
// (como si el usuario está logueado, las historias, etc.) entre componentes
// sin necesidad de pasar props por todas partes
const AdminContext = createContext();

/**
 * 🪝 CUSTOM HOOK: useAdminContext
 * Hook personalizado que me trae el contexto y valida que esté dentro del Provider
 * Si lo uso fuera del AdminProvider, tira un error
 */
function useAdminContext() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext debe ser usado dentro de AdminProvider");
  }
  return context;
}

/**
 * 📦 COMPONENTE: AdminProvider
 * Este componente envuelve la app y proporciona datos a todos los componentes hijos
 * Todo lo que está adentro puede acceder al contexto
 */
function AdminProvider({ children, value }) {
  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

// ============================================================
// 🪝 CUSTOM HOOK: useAdminHistorias
// Aquí está toda la lógica relacionada con traer, aprobar y rechazar historias de Firebase
// ============================================================
function useAdminHistorias() {
  // Estas son las variables de estado que cambian:
  const [historias, setHistorias] = useState([]);           // Array con todas las historias pendientes
  const [cargando, setCargando] = useState(false);          // Flag: ¿estoy cargando datos ahora?
  const [error, setError] = useState("");                   // Mensaje de error si algo falla

  /**
   * 🔄 FUNCIÓN: fetchHistorias
   * Traigo de Firebase todas las historias que NO han sido aprobadas (aprobado = false)
   * Uso async/await para consultar Firebase
   * Acá está el LOOP #1: forEach itera sobre cada documento que Firebase devuelve
   */
  const fetchHistorias = useCallback(async () => {
    setCargando(true);
    setError("");

    const db = window.db;
    if (!db) {
      setError("Error: Firebase no está configurado (revisá firebase-config.js)");
      setCargando(false);
      return;
    }

    try {
      // Consulto a Firebase: traigo solo historias donde aprobado = false
      const querySnapshot = await db.collection("historias")
        .where("aprobado", "==", false)
        .get();

      const docs = [];
      // 🔁 LOOP #1: forEach itera sobre CADA documento de la respuesta de Firebase
      // Por cada uno, lo agrego al array docs
      querySnapshot.forEach((docSnap) => {
        docs.push({ id: docSnap.id, ...docSnap.data() });
      });

      setHistorias(docs); // Actualizo el estado con las historias traídas
    } catch (err) {
      console.error('Error al cargar historias:', err);
      setError(err.message);
    } finally {
      // Esto se ejecuta siempre, haya error o no
      setCargando(false);
    }
  }, []);

  /**
   * ✓ FUNCIÓN: approveStory
   * Doy "aprobación" a una historia marcándola como aprobado: true en Firebase
   * Después de aprobar, recargo la lista para sacar la historia de "pendientes"
   */
  const approveStory = useCallback(async (id) => {
    try {
      await window.db.collection("historias").doc(id).update({ aprobado: true });
      await fetchHistorias(); // Recargo la lista
    } catch (err) {
      console.error("Error aprobando:", err);
      alert("Error al intentar aprobar: " + err.message);
    }
  }, [fetchHistorias]);

  /**
   * ✕ FUNCIÓN: rejectStory
   * Elimino permanentemente una historia de Firebase
   * Pido confirmación al usuario primero (window.confirm)
   * ⚠️ Esta acción NO se puede deshacer
   */
  const rejectStory = useCallback(async (id) => {
    if (window.confirm("⚠️ ¿Seguro que querés rechazar y BORRAR esta historia permanentemente de Firebase?")) {
      try {
        await window.db.collection("historias").doc(id).delete();
        await fetchHistorias(); // Recargo la lista sin la historia que acabo de borrar
      } catch (err) {
        console.error("Error borrando:", err);
        alert("Error al intentar borrar: " + err.message);
      }
    }
  }, [fetchHistorias]);

  // Retorno un objeto con todo lo que los componentes necesitan para funcionar
  return { historias, cargando, error, fetchHistorias, approveStory, rejectStory };
}

// ============================================================
// 🏠 COMPONENTE PRINCIPAL: AdminApp
// Manejo: del login, logout, estado de sesión y renderizado condicional
// ============================================================
function AdminApp() {
  // Variables de estado:
  const [isLoggedIn, setIsLoggedIn] = useState(false);      // ¿El usuario está logueado?
  const [password, setPassword] = useState("");              // La contraseña que escribió el usuario
  
  // Traigo todas las funciones del hook personalizado
  const adminHistorias = useAdminHistorias();

  /**
   * 🔑 FUNCIÓN: handleLogin
   * Verifico si la contraseña que escribió es correcta
   * Si es correcta: activo el login y cargo las historias
   * Si es incorrecta: muestro un alert
   */
  const handleLogin = useCallback(() => {
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      adminHistorias.fetchHistorias();
    } else {
      alert("🔒 Contraseña incorrecta ❤️");
    }
  }, [password, adminHistorias]);

  /**
   * 🚪 FUNCIÓN: handleLogout
   * Cierro la sesión borrando el estado
   */
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setPassword("");
  }, []);

  /**
   * ⌨️ FUNCIÓN: handlePasswordChange
   * Actualizo el estado cada vez que el usuario escribe algo en el input
   * Se ejecuta en el evento onChange del <input>
   */
  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  /**
   * 📦 OBJETO: contextValue
   * Aquí agrego todos los datos que van a estar disponibles en el contexto
   * useMemo es una optimización que hace que solo recalcule si cambian las dependencias
   */
  const contextValue = useMemo(() => ({
    isLoggedIn,
    handleLogout,
    ...adminHistorias // Spread: incluyo todos los datos de historias
  }), [isLoggedIn, handleLogout, adminHistorias]);

  // RENDERIZADO CONDICIONAL:
  // Si no está logueado: muestro el LoginPanel
  if (!isLoggedIn) {
    return (
      <LoginPanel 
        password={password}
        onPasswordChange={handlePasswordChange}
        onLogin={handleLogin}
      />
    );
  }

  // Si SÍ está logueado: muestro el contenido admin dentro del Provider
  return (
    <AdminProvider value={contextValue}>
      <AdminContent />
    </AdminProvider>
  );
}

// ============================================================
// 📦 COMPONENTES VISUALES (Memorizados con React.memo)
// React.memo = Optimización que evita re-renderizar si los props no cambian
// ============================================================

/**
 * 🔐 COMPONENTE: LoginPanel
 * Muestro el formulario de login (solo aparece si NO está logueado)
 * Tiene:
 *   - Input para la contraseña
 *   - Botón para conectarse
 *   - Validación al presionar Enter
 */
const LoginPanel = React.memo(({ password, onPasswordChange, onLogin }) => {
  return (
    // Contenedor Bootstrap centrado
    <div className="row justify-content-center">
      <div className="col-md-5">
        {/* Tarjeta de login con estilos Bootstrap */}
        <div className="card p-4 rounded-4 shadow-sm border-0">
          <div className="card-body text-center">
            <h5 className="fw-bold mb-4">Acceso Reservado</h5>
            
            {/* Input para ingresar la contraseña */}
            <div className="mb-4">
              <input 
                type="password" 
                className="form-control form-control-lg text-center" 
                placeholder="Contraseña maestra"
                value={password}                    // Vinculado al estado
                onChange={onPasswordChange}         // Se ejecuta al escribir
                onKeyDown={(e) => e.key === 'Enter' && onLogin()}  // Enter también conecta
              />
            </div>
            
            {/* Botón de login */}
            <button onClick={onLogin} className="btn btn-warning btn-lg w-100 fw-bold">
              Entrar de forma segura
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * 📊 COMPONENTE: AdminHeader
 * Este es el encabezado de la página admin
 * Tiene:
 *   - Título "Pendientes de revisión"
 *   - Botón Recargar (ejecuta fetchHistorias)
 *   - Botón Cerrar sesión (ejecuta handleLogout)
 */
const AdminHeader = React.memo(() => {
  // Traigo las funciones del contexto
  const { handleLogout, fetchHistorias } = useAdminContext();

  return (
    // Barra de encabezado con Bootstrap
    <div className="d-flex justify-content-between mb-5 align-items-center bg-light p-3 rounded-4 shadow-sm">
      <h3 className="m-0 fw-bold text-dark">Pendientes de revisión</h3>
      <div>
        {/* Botón Recargar */}
        <button onClick={fetchHistorias} className="btn btn-outline-warning fw-bold bg-white me-2">
          ↻ Recargar
        </button>
        {/* Botón Cerrar sesión */}
        <button onClick={handleLogout} className="btn btn-outline-secondary fw-bold bg-white">
          Cerrar sesión
        </button>
      </div>
    </div>
  );
});

/**
 * 🗂️ COMPONENTE: StoryCard
 * Esta es la tarjeta individual que muestra una historia
 * Tiene:
 *   - Nombre del usuario (o "Anónimo")
 *   - Badge con el tipo de EM
 *   - El texto del testimonio
 *   - Botones Aprobar (verde) y Borrar (rojo)
 */
const StoryCard = React.memo(({ story }) => {
  // Traigo las funciones del contexto
  const { approveStory, rejectStory } = useAdminContext();

  // Manejadores de botones (optimizados con useCallback)
  const handleApprove = useCallback(() => approveStory(story.id), [story.id, approveStory]);
  const handleReject = useCallback(() => rejectStory(story.id), [story.id, rejectStory]);

  return (
    // Columna para el grid responsivo
    <div className="col">
      {/* Tarjeta Bootstrap */}
      <div className="card h-100 border-0 shadow-sm rounded-4">
        <div className="card-body d-flex flex-column p-4">
          
          {/* Título con nombre y badge */}
          <h5 className="card-title text-warning fw-bold mb-3">
            {story.nombre || 'Anónimo'}                    {/* Muestro nombre o "Anónimo" */}
            <span className="badge bg-light text-dark ms-2 border">
              {story.tipoEM || 'N/A'}                      {/* Muestro tipo de EM */}
            </span>
          </h5>
          
          {/* Texto del testimonio */}
          <p className="card-text flex-grow-1 text-muted">
            "{story.testimonio}"
          </p>
          
          {/* Botones de acciones */}
          <div className="mt-auto d-flex gap-2">
            <button onClick={handleApprove} className="btn btn-success flex-fill py-2 fw-bold">
              ✓ Aprobar
            </button>
            <button onClick={handleReject} className="btn btn-danger flex-fill py-2 fw-bold">
              ✕ Borrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * 📋 COMPONENTE: AdminContent
 * Este es el contenedor principal del panel admin
 * Usa el contexto para acceder a los datos
 * Muestra diferentes cosas según el estado:
 *   1. Si hay error → muestra mensaje rojo de error
 *   2. Si está cargando → muestra "Consultando base de datos..."
 *   3. Si no hay historias → muestra "¡Todo al día!"
 *   4. Si hay historias → renderiza un grid con tarjetas (acá está el LOOP #2)
 */
const AdminContent = () => {
  // Traigo datos del contexto
  const { historias, cargando, error } = useAdminContext();
  
  // Optimización: cuento las historias solo cuando el array cambia
  const historiasCount = useMemo(() => historias.length, [historias.length]);

  return (
    <div className="mt-4">
      {/* Encabezado del admin */}
      <AdminHeader />

      {/* Sección de errores (aparece solo si error existe) */}
      {error && (
        <div className="col-12 text-center my-5">
          <div className="alert alert-danger rounded-4 d-inline-block p-4">
            <h5 className="fw-bold">⚠️ Error al conectar con Firestore</h5>
            <p className="mb-0">{error}</p>
          </div>
        </div>
      )}

      {/* Estado de cargando (aparece mientras cargo datos) */}
      {cargando ? (
        <div className="col-12 text-center my-5">
          <p className="lead fw-bold text-muted w-100">Consultando base de datos NoSQL...</p>
        </div>
      ) : historiasCount === 0 && !error ? (
        {/* Sin historias pendientes (aparece si no hay nada que aprobar) */}
        <div className="col-12 text-center my-5">
          <p className="lead fw-bold text-muted w-100">✨ ¡Todo al día! No hay historias pendientes de aprobación.</p>
        </div>
      ) : (
        {/* Grid de tarjetas (aparece si hay historias) */}
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {/* 🔁 LOOP #2: map(...) itera sobre CADA historia en el array */}
          {/* key={story.id} es importante: le ayuda a React a identificar qué elemento cambió */}
          {historias.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 🚀 INICIALIZACIÓN Y RENDERIZADO (ENTRADA PRINCIPAL DE LA APP)
// ============================================================
// Este código se ejecuta en cuanto el navegador carga admin.html
// Lo que hace:
// 1. Busca el elemento <div id="react-admin-root"> en el HTML
// 2. Renderiza el componente AdminApp adentro
// 3. La app comienza a funcionar

const root = ReactDOM.createRoot(document.getElementById("react-admin-root"));
root.render(<AdminApp />);
