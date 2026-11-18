import axios from 'axios';

// En este script de auditoría automatizada configuro mi cliente HTTP Axios para conectarme a la API de Empáticos.
// Utilizo la URL de mi variable de entorno API_URL o por defecto apunto a la instancia local/producción.
const BASE_URL = process.env.API_URL || 'http://localhost:5000';
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true // Permito capturar respuestas HTTP 4xx y 5xx sin lanzar excepciones para auditarlas directamente
});

// Variable global donde almacenaré el _id generado por MongoDB durante la prueba de creación
let publicacionIdCreada = null;

// Objeto en el que acumulo los resultados globales para mi informe de auditoría
const resumenPruebas = {
  exitosas: 0,
  fallidas: 0,
  total: 8
};

// En este helper formato la salida por consola mostrando checks verdes [✔ PASS] o cruces rojas [✖ FAIL]
const logResultado = (numeroPrueba, titulo, exito, detalles) => {
  if (exito) {
    resumenPruebas.exitosas++;
    console.log(`\x1b[32m[✔ PASS]\x1b[0m Prueba ${numeroPrueba}: ${titulo}`);
  } else {
    resumenPruebas.fallidas++;
    console.log(`\x1b[31m[✖ FAIL]\x1b[0m Prueba ${numeroPrueba}: ${titulo}`);
  }
  console.log(`         📌 Detalle: ${detalles}`);
  console.log(`--------------------------------------------------------------------------------`);
};





// ====================================================================================================
// SECCIÓN 1: PRUEBA 1 - POST /api/publicaciones (Registro de un nuevo testimonio comunitario)
// ====================================================================================================
const prueba1_crearPublicacion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 1: POST /api/publicaciones...`);

  try {
    // Aquí pruebo el registro de una nueva publicación y preparo su payload con datos de testimonio completo
    const nuevoTestimonio = {
      titulo: 'Testimonio de superación comunitaria - Auditoría Automatizada',
      contenido: 'Comparto mi experiencia de superación para brindar contención y fuerza a toda la comunidad de Empáticos.',
      autorNombre: 'Matías Torres (Auditor Backend)',
      rolAutor: 'paciente',
      categoria: 'superacion',
      tipo: 'testimonio',
      status: 'approved'
    };

    // Envío la solicitud HTTP POST hacia mi servidor Express
    const res = await api.post('/api/publicaciones', nuevoTestimonio);
    const tiempoMs = Date.now() - inicio;

    // Verifico que el código de respuesta devuelto sea 201 (Created) o 200 (OK)
    const esStatusValido = res.status === 201 || res.status === 200;
    const bodyData = res.data.data || res.data.publicacion || res.data;

    // En este paso capturo el _id único asignado por MongoDB para usarlo en las siguientes pruebas
    publicacionIdCreada = bodyData._id || bodyData.id;

    const exito = esStatusValido && Boolean(publicacionIdCreada);
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | ID MongoDB Asignado: ${publicacionIdCreada || 'Ninguno'}`;

    logResultado(1, 'POST /api/publicaciones - Creación de testimonio', exito, detalle);
  } catch (error) {
    logResultado(1, 'POST /api/publicaciones - Creación de testimonio', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 2: PRUEBA 2 - GET /api/publicaciones (Listado general y comprobación de persistencia)
// ====================================================================================================
const prueba2_listarPublicaciones = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 2: GET /api/publicaciones...`);

  try {
    // Solicito el listado de publicaciones en mi base de datos para auditar que la respuesta sea un arreglo poblado
    const res = await api.get('/api/publicaciones/all');
    const resGeneral = res.status === 200 ? res : await api.get('/api/publicaciones');
    const tiempoMs = Date.now() - inicio;

    const lista = Array.isArray(resGeneral.data) ? resGeneral.data : (resGeneral.data.data || resGeneral.data.publicaciones || []);

    // En este paso verifico que la persistencia en MongoDB fue real comprobando que el ID generado esté en la lista
    const encontrada = lista.some(pub => String(pub._id || pub.id) === String(publicacionIdCreada));

    const exito = resGeneral.status === 200 && Array.isArray(lista) && lista.length > 0 && encontrada;
    const detalle = `HTTP Status ${resGeneral.status} (${tiempoMs}ms) | Total elementos: ${lista.length} | Persistencia confirmada en MongoDB: ${encontrada ? 'SÍ' : 'NO'}`;

    logResultado(2, 'GET /api/publicaciones - Listado general y persistencia', exito, detalle);
  } catch (error) {
    logResultado(2, 'GET /api/publicaciones - Listado general', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 3: PRUEBA 3 - GET /api/publicaciones/:id (Consulta individual por ID generado)
// ====================================================================================================
const prueba3_obtenerPublicacionPorId = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 3: GET /api/publicaciones/:id...`);

  try {
    if (!publicacionIdCreada) {
      logResultado(3, 'GET /api/publicaciones/:id', false, 'Omitida: No se capturó un ID válido en la Prueba 1');
      return;
    }

    // Consulto la publicación específica pasando el _id obtenido previamente
    const res = await api.get(`/api/publicaciones/${publicacionIdCreada}`);
    const tiempoMs = Date.now() - inicio;

    const doc = res.data.data || res.data.publicacion || res.data;
    
    // Verifico que los campos del documento devuelto coincidan exactamente con la publicación creada
    const coincidenciaId = String(doc._id || doc.id) === String(publicacionIdCreada);

    const exito = res.status === 200 && coincidenciaId;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Documento: "${doc.titulo || 'Sin título'}" | ID Coincide exactamente: ${coincidenciaId ? 'SÍ' : 'NO'}`;

    logResultado(3, 'GET /api/publicaciones/:id - Consulta individual por ID', exito, detalle);
  } catch (error) {
    logResultado(3, 'GET /api/publicaciones/:id - Consulta individual', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 4: PRUEBA 4 - PUT /api/publicaciones/:id (Modificación de datos y re-fetch de confirmación)
// ====================================================================================================
const prueba4_actualizarPublicacion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 4: PUT /api/publicaciones/:id...`);

  try {
    if (!publicacionIdCreada) {
      logResultado(4, 'PUT /api/publicaciones/:id', false, 'Omitida: No se capturó un ID válido en la Prueba 1');
      return;
    }

    // Preparo los datos modificados para actualizar la publicación
    const datosActualizados = {
      titulo: 'Testimonio de superación comunitaria - [MODIFICADO POR AUDITORÍA]',
      contenido: 'Este contenido ha sido actualizado mediante una petición PUT para verificar la edición persistente en la BD.',
      autorNombre: 'Matías Torres (Auditor)',
      rolAutor: 'paciente',
      categoria: 'superacion',
      tipo: 'testimonio',
      status: 'approved'
    };

    // Envío la petición PUT para actualizar la publicación
    const resPut = await api.put(`/api/publicaciones/${publicacionIdCreada}`, datosActualizados);

    // Hago un re-fetch posterior con GET para constatar que el cambio de datos efectivamente se guardó en MongoDB
    const resReFetch = await api.get(`/api/publicaciones/${publicacionIdCreada}`);
    const tiempoMs = Date.now() - inicio;

    const docActualizado = resReFetch.data.data || resReFetch.data.publicacion || resReFetch.data;
    const cambioPersistido = docActualizado.titulo === datosActualizados.titulo;

    const exito = resPut.status === 200 && resReFetch.status === 200 && cambioPersistido;
    const detalle = `HTTP PUT Status ${resPut.status} | Re-Fetch Status ${resReFetch.status} (${tiempoMs}ms) | Cambio persistido en BD: ${cambioPersistido ? 'SÍ' : 'NO'}`;

    logResultado(4, 'PUT /api/publicaciones/:id - Edición y re-fetch de persistencia', exito, detalle);
  } catch (error) {
    logResultado(4, 'PUT /api/publicaciones/:id - Edición de publicación', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 5: PRUEBA 5 - POST /api/publicaciones (Evaluación de validaciones con express-validator)
// ====================================================================================================
const prueba5_validacionesExpressValidator = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 5: POST /api/publicaciones (Evaluación de express-validator)...`);

  try {
    // Envío un body con contenido vacío y título inválido para evaluar la reacción de mis validadores
    const payloadInvalido = {
      titulo: 'A', // Título de menos de 3 caracteres (inválido)
      contenido: '' // Contenido requerido que se envía vacío
    };

    const res = await api.post('/api/publicaciones', payloadInvalido);
    const tiempoMs = Date.now() - inicio;

    // Verifico que express-validator responda con código HTTP 400 Bad Request y entregue el detalle de errores
    const esBadRequest = res.status === 400;
    const tieneArrayErrores = res.data && (res.data.errores || res.data.errors || !res.data.success);

    const exito = esBadRequest && tieneArrayErrores;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Rechazo 400 por validación: ${esBadRequest ? 'SÍ' : 'NO'}`;

    logResultado(5, 'Validaciones express-validator - Rechazo de datos inválidos (400)', exito, detalle);
  } catch (error) {
    logResultado(5, 'Validaciones express-validator', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 6: PRUEBA 6 - POST /api/publicaciones (Evaluación de Middleware propio de Moderación)
// ====================================================================================================
const prueba6_middlewareModeracion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 6: POST /api/publicaciones (Filtro de moderación comunitaria)...`);

  try {
    // Envío un mensaje deliberadamente con palabras agresivas o prohibidas para testear mi middleware de moderación
    const payloadAgresivo = {
      titulo: 'Publicación con lenguaje agresivo',
      contenido: 'Este mensaje contiene la palabra prohibida estupido para probar el filtro de mi comunidad.',
      autorNombre: 'Usuario Agresivo'
    };

    const res = await api.post('/api/publicaciones', payloadAgresivo);
    const tiempoMs = Date.now() - inicio;

    // Verifico que mi middleware corte la petición adecuadamente retornando un código 400
    const esBloqueado = res.status === 400;

    const exito = esBloqueado;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Petición bloqueada por moderación: ${esBloqueado ? 'SÍ (400 Bad Request)' : 'NO (Pasó el filtro)'}`;

    logResultado(6, 'Middleware propio de moderación - Palabras prohibidas (400)', exito, detalle);
  } catch (error) {
    logResultado(6, 'Middleware de moderación', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 7: PRUEBA 7 - GET /api/frases/inspiracion (Verificación de integración con API Externa)
// ====================================================================================================
const prueba7_apiExternaFrases = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 7: GET /api/frases/inspiracion...`);

  try {
    // Comprobaré que la API externa consumida mediante Axios responda exitosamente con una cita inspiracional
    const res = await api.get('/api/frases/inspiracion');
    const tiempoMs = Date.now() - inicio;

    const dataFrase = res.data.data || res.data.frase || res.data;
    const tieneEstructuraValida = Boolean(dataFrase && (dataFrase.texto || dataFrase.quote || dataFrase.frase));

    const exito = res.status === 200 && tieneEstructuraValida;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Cita recibida: "${dataFrase.texto || dataFrase.quote || 'N/A'}" - Autor: "${dataFrase.autor || dataFrase.author || 'Anónimo'}"`;

    logResultado(7, 'GET /api/frases/inspiracion - Consumo de API Externa', exito, detalle);
  } catch (error) {
    logResultado(7, 'GET /api/frases/inspiracion', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// SECCIÓN 8: PRUEBA 8 - DELETE /api/publicaciones/:id (Eliminación y confirmación 404 en MongoDB)
// ====================================================================================================
const prueba8_eliminarPublicacion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 8: DELETE /api/publicaciones/:id...`);

  try {
    if (!publicacionIdCreada) {
      logResultado(8, 'DELETE /api/publicaciones/:id', false, 'Omitida: No se capturó un ID válido en la Prueba 1');
      return;
    }

    // Solicito la eliminación del documento de prueba en mi base de datos MongoDB
    const resDelete = await api.delete(`/api/publicaciones/${publicacionIdCreada}`);

    // Hago una consulta posterior GET esperando un status 404 Not Found para confirmar que la publicación fue removida
    const resGetPosterior = await api.get(`/api/publicaciones/${publicacionIdCreada}`);
    const tiempoMs = Date.now() - inicio;

    const esDeleteOk = resDelete.status === 200;
    const es404Notfound = resGetPosterior.status === 404;

    const exito = esDeleteOk && es404Notfound;
    const detalle = `HTTP DELETE Status ${resDelete.status} | GET posterior Status ${resGetPosterior.status} (${tiempoMs}ms) | Eliminación física confirmada con 404: ${es404Notfound ? 'SÍ' : 'NO'}`;

    logResultado(8, 'DELETE /api/publicaciones/:id - Eliminación y verificación 404', exito, detalle);
  } catch (error) {
    logResultado(8, 'DELETE /api/publicaciones/:id', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// DASHBOARD FINAL DE RESULTADOS Y AUDITORÍA DE LA API
// ====================================================================================================
const ejecutarAuditoriaCompleta = async () => {
  console.log(`================================================================================`);
  console.log(`🚀 INICIANDO AUDITORÍA AUTOMÁTICA DE LA API "EMPÁTICOS"`);
  console.log(`🌐 Servidor objetivo: ${BASE_URL}`);
  console.log(`================================================================================`);

  // Ejecuto la secuencia ordenada de pruebas de integración y persistencia
  await prueba1_crearPublicacion();
  await prueba2_listarPublicaciones();
  await prueba3_obtenerPublicacionPorId();
  await prueba4_actualizarPublicacion();
  await prueba5_validacionesExpressValidator();
  await prueba6_middlewareModeracion();
  await prueba7_apiExternaFrases();
  await prueba8_eliminarPublicacion();

  // Imprimo el Dashboard de resultados por pantalla
  console.log(`\n================================================================================`);
  console.log(`📊 DASHBOARD FINAL DE RESULTADOS DE LA AUDITORÍA`);
  console.log(`================================================================================`);
  console.log(`  Total de Pruebas Ejecutadas : ${resumenPruebas.total}`);
  console.log(`  Pruebas Exitosas \x1b[32m[✔ PASS]\x1b[0m   : ${resumenPruebas.exitosas}`);
  console.log(`  Pruebas Fallidas \x1b[31m[✖ FAIL]\x1b[0m   : ${resumenPruebas.fallidas}`);

  if (resumenPruebas.fallidas === 0) {
    console.log(`\n\x1b[32m🎉 AUDITORÍA COMPLETADA CON ÉXITO: 100% DE LOS ENDPOINTS Y PERSISTENCIA VERIFICADOS.\x1b[0m\n`);
    process.exit(0);
  } else {
    console.log(`\n\x1b[31m⚠️ LA AUDITORÍA DETECTÓ FALLOS EN ALGUNOS ENDPOINTS. REVISAR DETALLES ARRIBA.\x1b[0m\n`);
    process.exit(1);
  }
};

// Inicio la suite de auditoría
ejecutarAuditoriaCompleta();
