import axios from 'axios';

// En este script ejecuto una suite completa de pruebas sobre mi backend Express.
// Verifico que todos los endpoints del CRUD, las validaciones de express-validator, el middleware de moderación,
// y el consumo de la API externa de frases inspiradoras funcionen con precisión técnica y códigos HTTP correctos.

const BASE_URL = 'http://localhost:5000';

async function ejecutarPruebasCompleta() {
  console.log('=======================================================');
  console.log('INICIANDO SUITE DE PRUEBAS DE EXAMEN - BACKEND EMPÁTICOS');
  console.log('=======================================================\n');

  let pruebasPasadas = 0;
  let pruebasTotales = 0;

  function registrarResultado(nombrePrueba, exito, detalle = '') {
    pruebasTotales++;
    if (exito) {
      pruebasPasadas++;
      console.log(`[PASÓ ✔] ${nombrePrueba} ${detalle ? '- ' + detalle : ''}`);
    } else {
      console.error(`[FALLÓ ✖] ${nombrePrueba} ${detalle ? '- ' + detalle : ''}`);
    }
  }

  try {
    // 1. Prueba de Ruta Raíz (GET /)
    try {
      const res = await axios.get(`${BASE_URL}/`);
      registrarResultado('1. Estado de Servidor (GET /)', res.status === 200, `Respuesta 200 OK: ${res.data.mensaje}`);
    } catch (e) {
      registrarResultado('1. Estado de Servidor (GET /)', false, e.message);
    }

    // 2. Consumo de API Externa de Frases Motivacionales (GET /api/frases/inspiracion)
    try {
      const res = await axios.get(`${BASE_URL}/api/frases/inspiracion`);
      const frase = res.data.data;
      registrarResultado('2. API Externa de Frases (GET /api/frases/inspiracion)', res.status === 200 && Boolean(frase.texto), `Cita: "${frase.texto}" (${frase.origen})`);
    } catch (e) {
      registrarResultado('2. API Externa de Frases (GET /api/frases/inspiracion)', false, e.message);
    }

    // 3. Obtener Listado de Publicaciones (GET /api/publicaciones)
    try {
      const res = await axios.get(`${BASE_URL}/api/publicaciones`);
      registrarResultado('3. Listar Publicaciones (GET /api/publicaciones)', res.status === 200 && Array.isArray(res.data.data), `Total obtenidas: ${res.data.cantidad}`);
    } catch (e) {
      registrarResultado('3. Listar Publicaciones (GET /api/publicaciones)', false, e.message);
    }

    // 4. Crear Publicación Válida (POST /api/publicaciones)
    let idCreado = null;
    try {
      const nuevaPost = {
        titulo: 'Mensaje de fortaleza y superación',
        contenido: 'Comparto mi testimonio personal para acompañar a otros pacientes y sus familias.',
        tipo: 'testimonio',
        rolAutor: 'paciente',
        categoria: 'general',
        autorNombre: 'Ana M.'
      };
      const res = await axios.post(`${BASE_URL}/api/publicaciones`, nuevaPost);
      idCreado = res.data.data._id;
      registrarResultado('4. Crear Publicación Válida (POST /api/publicaciones)', res.status === 201 && Boolean(idCreado), `Creado con ID: ${idCreado}`);
    } catch (e) {
      registrarResultado('4. Crear Publicación Válida (POST /api/publicaciones)', false, e.message);
    }

    // 5. Consultar Publicación por ID (GET /api/publicaciones/:id)
    if (idCreado) {
      try {
        const res = await axios.get(`${BASE_URL}/api/publicaciones/${idCreado}`);
        registrarResultado('5. Consultar por ID (GET /api/publicaciones/:id)', res.status === 200 && res.data.data._id === idCreado, `Título: "${res.data.data.titulo}"`);
      } catch (e) {
        registrarResultado('5. Consultar por ID (GET /api/publicaciones/:id)', false, e.message);
      }
    }

    // 6. Actualizar Publicación (PUT /api/publicaciones/:id)
    if (idCreado) {
      try {
        const cambios = {
          titulo: 'Mensaje de fortaleza actualizado',
          contenido: 'Actualizo mi historia compartiendo nuevos avances en mi tratamiento.'
        };
        const res = await axios.put(`${BASE_URL}/api/publicaciones/${idCreado}`, cambios);
        registrarResultado('6. Actualizar Publicación (PUT /api/publicaciones/:id)', res.status === 200 && res.data.data.titulo === cambios.titulo, 'Actualización exitosa');
      } catch (e) {
        registrarResultado('6. Actualizar Publicación (PUT /api/publicaciones/:id)', false, e.message);
      }
    }

    // 7. Prueba Middleware de Moderación con término prohibido
    try {
      await axios.post(`${BASE_URL}/api/publicaciones`, {
        titulo: 'Publicación con lenguaje violento e insulto',
        contenido: 'Este texto contiene un insulto directo y debe ser bloqueado por moderación.',
        tipo: 'debate',
        rolAutor: 'paciente'
      });
      registrarResultado('7. Middleware de Moderación (Lenguaje Inapropiado)', false, 'No fue bloqueado');
    } catch (e) {
      const fueRechazado = e.response && e.response.status === 400;
      registrarResultado('7. Middleware de Moderación (Lenguaje Inapropiado)', fueRechazado, `Bloqueado correctamente con HTTP 400: ${e.response?.data?.motivo}`);
    }

    // 8. Prueba Validaciones express-validator (Campos inválidos)
    try {
      await axios.post(`${BASE_URL}/api/publicaciones`, {
        titulo: 'ab', // Título menor a 3 caracteres
        contenido: 'short' // Contenido muy corto
      });
      registrarResultado('8. Middleware Express-Validator (Campos Cortos)', false, 'No se rechazó');
    } catch (e) {
      const fueRechazado = e.response && e.response.status === 400;
      registrarResultado('8. Middleware Express-Validator (Campos Cortos)', fueRechazado, `Rechazado con HTTP 400 por validación`);
    }

    // 9. Consultar ID con formato inválido
    try {
      await axios.get(`${BASE_URL}/api/publicaciones/id-invalido-123`);
      registrarResultado('9. Validación de Formato de ID Inválido', false, 'Debió retornar 400');
    } catch (e) {
      const fueRechazado = e.response && e.response.status === 400;
      registrarResultado('9. Validación de Formato de ID Inválido', fueRechazado, 'Retornó HTTP 400 Correctamente');
    }

    // 10. Eliminar Publicación de Prueba (DELETE /api/publicaciones/:id)
    if (idCreado) {
      try {
        const res = await axios.delete(`${BASE_URL}/api/publicaciones/${idCreado}`);
        registrarResultado('10. Eliminar Publicación (DELETE /api/publicaciones/:id)', res.status === 200, `Mensaje: ${res.data.mensaje}`);
      } catch (e) {
        registrarResultado('10. Eliminar Publicación (DELETE /api/publicaciones/:id)', false, e.message);
      }
    }

    console.log('\n=======================================================');
    console.log(`RESUMEN FINAL: ${pruebasPasadas}/${pruebasTotales} PRUEBAS SUPERADAS CON ÉXITO`);
    console.log('=======================================================\n');

  } catch (errGeneral) {
    console.error('Error imprevisto en la ejecución de la suite de pruebas:', errGeneral.message);
  }
}

ejecutarPruebasCompleta();





