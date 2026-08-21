import axios from 'axios';

// En este script de auditoría automatizada configuro el cliente HTTP Axios para conectarme a mi servidor de Empáticos.
// Utilizo la URL enviada por variable de entorno o por defecto la instancia en producción/local.
const BASE_URL = process.env.API_URL || 'https://empaticos.vercel.app';
const api = axios.create({
  baseURL: BASE_URL,
  validateStatus: () => true // Permito capturar respuestas 4xx y 5xx sin lanzar excepciones para evaluar los códigos HTTP
});

// Variable global donde almacenaré el _id generado por MongoDB durante la prueba de creación
let publicacionIdCreada = null;

// Objeto para llevar la cuenta global de mis resultados de auditoría
const resumenPruebas = {
  exitosas: 0,
  fallidas: 0,
  total: 8
};

// Función auxiliar para imprimir resultados formateados en mi dashboard por consola
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
// PRUEBA 1: POST /api/publicaciones (Creación de un nuevo testimonio comunitario)
// ====================================================================================================
const prueba1_crearPublicacion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 1: POST /api/publicaciones...`);
  
  try {
    // Aquí preparo el payload del testimonio completo para enviar a mi API con estado 'approved' para visibilidad en consultas
    const nuevoTestimonio = {
      titulo: 'Testimonio de superación comunitaria - Auditoría Automatizada',
      contenido: 'Comparto mi experiencia de superación para brindar contención y fuerza a toda la comunidad de Empáticos.',
      autorNombre: 'Matías Torres (Auditor Backend)',
      rolAutor: 'paciente',
      categoria: 'superacion',
      tipo: 'testimonio',
      status: 'approved'
    };

    // Envío la petición HTTP POST hacia mi servidor Express
    const res = await api.post('/api/publicaciones', nuevoTestimonio);
    const tiempoMs = Date.now() - inicio;

    // Verifico que el código de respuesta HTTP sea 201 (Created) o 200 (OK)
    const esStatusValido = res.status === 201 || res.status === 200;
    const bodyData = res.data.data || res.data.publicacion || res.data;

    // En este paso capturo el _id único asignado por MongoDB Atlas o el servicio
    publicacionIdCreada = bodyData._id || bodyData.id;

    const exito = esStatusValido && Boolean(publicacionIdCreada);
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | ID MongoDB Asignado: ${publicacionIdCreada || 'Ninguno'}`;

    logResultado(1, 'POST /api/publicaciones - Creación de testimonio', exito, detalle);
  } catch (error) {
    logResultado(1, 'POST /api/publicaciones - Creación de testimonio', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 2: GET /api/publicaciones (Verificación de listado y persistencia en MongoDB Atlas)
// ====================================================================================================
const prueba2_listarPublicaciones = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 2: GET /api/publicaciones...`);

  try {
    // Solicito el listado completo de publicaciones desde mi base de datos MongoDB Atlas o endpoint general
    const res = await api.get('/api/publicaciones/all');
    const resGeneral = res.status === 200 ? res : await api.get('/api/publicaciones');
    const tiempoMs = Date.now() - inicio;

    const lista = Array.isArray(resGeneral.data) ? resGeneral.data : (resGeneral.data.data || resGeneral.data.publicaciones || []);
    
    // Verifico que la publicación creada en la Prueba 1 figure efectivamente en el arreglo retornado
    const encontrada = lista.some(pub => String(pub._id || pub.id) === String(publicacionIdCreada));

    const exito = resGeneral.status === 200 && Array.isArray(lista) && lista.length > 0 && encontrada;
    const detalle = `HTTP Status ${resGeneral.status} (${tiempoMs}ms) | Total elementos: ${lista.length} | Persistencia confirmada en MongoDB: ${encontrada ? 'SÍ' : 'NO'}`;

    logResultado(2, 'GET /api/publicaciones - Listado general y persistencia', exito, detalle);
  } catch (error) {
    logResultado(2, 'GET /api/publicaciones - Listado general', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 3: GET /api/publicaciones/:id (Consulta de un documento específico por su ID)
// ====================================================================================================
const prueba3_obtenerPublicacionPorId = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 3: GET /api/publicaciones/:id...`);

  try {
    if (!publicacionIdCreada) {
      logResultado(3, 'GET /api/publicaciones/:id', false, 'Omitida: No se generó ID en la Prueba 1');
      return;
    }

    // Consulto a mi API el elemento específico pasando el _id capturado previamente
    const res = await api.get(`/api/publicaciones/${publicacionIdCreada}`);
    const tiempoMs = Date.now() - inicio;

    const doc = res.data.data || res.data.publicacion || res.data;
    const coincidenciaId = String(doc._id || doc.id) === String(publicacionIdCreada);

    const exito = res.status === 200 && coincidenciaId;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Documento recuperado: "${doc.titulo || 'Sin título'}" | ID Coincide: ${coincidenciaId ? 'SÍ' : 'NO'}`;

    logResultado(3, 'GET /api/publicaciones/:id - Consulta individual por ID', exito, detalle);
  } catch (error) {
    logResultado(3, 'GET /api/publicaciones/:id - Consulta individual', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 4: PUT /api/publicaciones/:id (Edición de datos y re-fetch de comprobación de cambios)
// ====================================================================================================
const prueba4_actualizarPublicacion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 4: PUT /api/publicaciones/:id...`);

  try {
    if (!publicacionIdCreada) {
      logResultado(4, 'PUT /api/publicaciones/:id', false, 'Omitida: No se generó ID en la Prueba 1');
      return;
    }

    const datosActualizados = {
      titulo: 'Testimonio de superación comunitaria - [MODIFICADO POR AUDITORÍA]',
      contenido: 'Este contenido ha sido actualizado mediante una petición PUT para verificar la edición persistente en la BD.',
      autorNombre: 'Matías Torres (Auditor)',
      rolAutor: 'paciente',
      categoria: 'superacion',
      tipo: 'testimonio',
      status: 'approved'
    };

    // Envío la solicitud PUT para modificar los datos del documento
    const resPut = await api.put(`/api/publicaciones/${publicacionIdCreada}`, datosActualizados);
    
    // Realizo un re-fetch inmediato mediante GET para verificar que el cambio persistió en MongoDB Atlas
    const resReFetch = await api.get(`/api/publicaciones/${publicacionIdCreada}`);
    const tiempoMs = Date.now() - inicio;

    const docActualizado = resReFetch.data.data || resReFetch.data.publicacion || resReFetch.data;
    const cambioPersistido = docActualizado.titulo === datosActualizados.titulo;

    const exito = resPut.status === 200 && resReFetch.status === 200 && cambioPersistido;
    const detalle = `HTTP PUT Status ${resPut.status} | HTTP Re-Fetch Status ${resReFetch.status} (${tiempoMs}ms) | Título persistido: "${docActualizado.titulo}"`;

    logResultado(4, 'PUT /api/publicaciones/:id - Edición y verificación de persistencia', exito, detalle);
  } catch (error) {
    logResultado(4, 'PUT /api/publicaciones/:id - Edición de publicación', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 5: POST /api/publicaciones (Prueba de Validaciones express-validator con datos inválidos)
// ====================================================================================================
const prueba5_validacionesExpressValidator = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 5: POST /api/publicaciones (Validación de cuerpo/título inválido)...`);

  try {
    // Envío un payload deliberadamente inválido (contenido vacío) para forzar el fallo de validación
    const payloadInvalido = {
      titulo: 'A', // Título de 1 carácter (el mínimo es 3)
      contenido: '' // Contenido totalmente vacío
    };

    const res = await api.post('/api/publicaciones', payloadInvalido);
    const tiempoMs = Date.now() - inicio;

    // Verifico que mi middleware express-validator corte la petición y responda con HTTP 400 Bad Request
    const esBadRequest = res.status === 400;
    const tieneArrayErrores = res.data && (res.data.errores || res.data.errors || !res.data.success);

    const exito = esBadRequest && tieneArrayErrores;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Rechazo correcto por validación 400: ${esBadRequest ? 'SÍ' : 'NO'}`;

    logResultado(5, 'Validaciones express-validator - Rechazo de datos inválidos', exito, detalle);
  } catch (error) {
    logResultado(5, 'Validaciones express-validator', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 6: POST /api/publicaciones (Prueba del Middleware propio de moderación de contenido)
// ====================================================================================================
const prueba6_middlewareModeracion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 6: POST /api/publicaciones (Moderación de palabras agresiivas/prohibidas)...`);

  try {
    // Envío un testimonio que contiene una palabra prohibida para poner a prueba mi middleware de moderación
    const payloadAgresivo = {
      titulo: 'Publicación con lenguaje agresivo',
      contenido: 'Este mensaje contiene la palabra prohibida estupido para probar el filtro de mi comunidad.',
      autorNombre: 'Usuario Agresivo'
    };

    const res = await api.post('/api/publicaciones', payloadAgresivo);
    const tiempoMs = Date.now() - inicio;

    // Verifico que el middleware detecte el término y corte la ejecución retornando código HTTP 400
    const esBloqueado = res.status === 400;

    const exito = esBloqueado;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Filtro de moderación activado: ${esBloqueado ? 'SÍ (Bloqueado correctamente)' : 'NO (Atravesó el filtro)'}`;

    logResultado(6, 'Middleware propio de moderación - Filtro de palabras prohibidas', exito, detalle);
  } catch (error) {
    logResultado(6, 'Middleware de moderación', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 7: GET /api/frases/inspiracion (Consumo y verificación de API Externa de Frases)
// ====================================================================================================
const prueba7_apiExternaFrases = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 7: GET /api/frases/inspiracion (Integración API Externa)...`);

  try {
    // Invoco mi endpoint que consume la API externa con Axios para obtener citas motivacionales
    const res = await api.get('/api/frases/inspiracion');
    const tiempoMs = Date.now() - inicio;

    const dataFrase = res.data.data || res.data.frase || res.data;
    const tieneTextoYAutor = Boolean(dataFrase && (dataFrase.texto || dataFrase.quote || dataFrase.frase));

    const exito = res.status === 200 && tieneTextoYAutor;
    const detalle = `HTTP Status ${res.status} (${tiempoMs}ms) | Cita recibida: "${dataFrase.texto || dataFrase.quote || 'N/A'}" - Autor: "${dataFrase.autor || dataFrase.author || 'Anónimo'}"`;

    logResultado(7, 'GET /api/frases/inspiracion - Consumo de API Externa', exito, detalle);
  } catch (error) {
    logResultado(7, 'GET /api/frases/inspiracion', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// PRUEBA 8: DELETE /api/publicaciones/:id (Eliminación de documento y verificación 404 en BD)
// ====================================================================================================
const prueba8_eliminarPublicacion = async () => {
  const inicio = Date.now();
  console.log(`\n▶ Iniciando Prueba 8: DELETE /api/publicaciones/:id...`);

  try {
    if (!publicacionIdCreada) {
      logResultado(8, 'DELETE /api/publicaciones/:id', false, 'Omitida: No se generó ID en la Prueba 1');
      return;
    }

    // Solicito la eliminación física del documento en mi base de datos MongoDB Atlas
    const resDelete = await api.delete(`/api/publicaciones/${publicacionIdCreada}`);
    
    // Intento recuperar el elemento eliminado para comprobar que la API responda con 404 (Not Found)
    const resGetPosterior = await api.get(`/api/publicaciones/${publicacionIdCreada}`);
    const tiempoMs = Date.now() - inicio;

    const esDeleteOk = resDelete.status === 200;
    const es404Notfound = resGetPosterior.status === 404;

    const exito = esDeleteOk && es404Notfound;
    const detalle = `HTTP DELETE Status ${resDelete.status} | GET posterior Status ${resGetPosterior.status} (${tiempoMs}ms) | Confirmación 404 tras eliminación: ${es404Notfound ? 'SÍ' : 'NO'}`;

    logResultado(8, 'DELETE /api/publicaciones/:id - Eliminación y verificación 404', exito, detalle);
  } catch (error) {
    logResultado(8, 'DELETE /api/publicaciones/:id', false, `Error de conexión: ${error.message}`);
  }
};





// ====================================================================================================
// EJECUCIÓN PRINCIPAL Y DASHBOARD FINAL DE AUDITORÍA
// ====================================================================================================
const ejecutarAuditoriaCompleta = async () => {
  console.log(`================================================================================`);
  console.log(`🚀 INICIANDO AUDITORÍA AUTOMÁTICA DE LA API "EMPÁTICOS"`);
  console.log(`🌐 Servidor de pruebas: ${BASE_URL}`);
  console.log(`================================================================================`);

  // Secuencia lineal de pruebas de integración y persistencia
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

// Inicio la auditoría
ejecutarAuditoriaCompleta();
