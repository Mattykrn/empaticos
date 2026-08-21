// En este script de pruebas me encargo de verificar de forma automatizada los endpoints de mi API REST.
// Me sirve para comprobar el funcionamiento del CRUD, las validaciones, la moderación y el consumo de la API externa.

import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

async function probarBackend() {
  console.log('=== INICIANDO VERIFICACIÓN DE ENDPOINTS DEL BACKEND ===\n');

  try {
    // 1. Probar ruta raíz de bienvenida
    console.log('1. Verificando GET / ...');
    const resRaiz = await axios.get(`${BASE_URL}/`);
    console.log('✔ Respuesta raíz:', resRaiz.data.mensaje);

    // 2. Probar API externa de frases motivacionales
    console.log('\n2. Verificando GET /api/frases/inspiracion ...');
    const resFrase = await axios.get(`${BASE_URL}/api/frases/inspiracion`);
    console.log('✔ Frase recibida:', `"${resFrase.data.data.texto}" - ${resFrase.data.data.autor}`);

    // 3. Crear una publicación válida (POST)
    console.log('\n3. Verificando POST /api/publicaciones (Publicación válida) ...');
    const nuevaPost = {
      titulo: 'Mi testimonio sobre la superación diaria',
      contenido: 'Comparto mi experiencia de acompañamiento familiar en este proceso de recuperación. La empatía nos fortalece.',
      tipo: 'testimonio',
      rolAutor: 'familiar',
      categoria: 'apoyo_emocional',
      autorNombre: 'María G.'
    };
    const resCrear = await axios.post(`${BASE_URL}/api/publicaciones`, nuevaPost);
    console.log('✔ Publicación creada con ID:', resCrear.data.data._id);
    const idCreado = resCrear.data.data._id;

    // 4. Probar middleware de moderación de contenido (Debe fallar con 400)
    console.log('\n4. Verificando Middleware de Moderación con contenido prohibido ...');
    try {
      await axios.post(`${BASE_URL}/api/publicaciones`, {
        titulo: 'Un mensaje con violencia e insultos',
        contenido: 'Este texto contiene un insulto directo y no cumple las normas comunitarias.',
        tipo: 'debate',
        rolAutor: 'paciente'
      });
    } catch (errModeracion) {
      if (errModeracion.response && errModeracion.response.status === 400) {
        console.log('✔ Moderación funcionando correctamente (Rechazado con 400):', errModeracion.response.data.motivo);
      } else {
        throw errModeracion;
      }
    }

    // 5. Probar express-validator (Debe fallar con 400 por campos incompletos)
    console.log('\n5. Verificando Validaciones de express-validator ...');
    try {
      await axios.post(`${BASE_URL}/api/publicaciones`, {
        titulo: 'Corto',
        contenido: ''
      });
    } catch (errValidacion) {
      if (errValidacion.response && errValidacion.response.status === 400) {
        console.log('✔ Validaciones funcionando correctamente (Rechazado con 400):', errValidacion.response.data.mensaje);
      } else {
        throw errValidacion;
      }
    }

    // 6. Consultar listado completo de publicaciones (GET)
    console.log('\n6. Verificando GET /api/publicaciones ...');
    const resListado = await axios.get(`${BASE_URL}/api/publicaciones`);
    console.log(`✔ Listado obtenido: ${resListado.data.cantidad} publicaciones encontradas.`);

    // 7. Eliminar la publicación de prueba (DELETE)
    console.log(`\n7. Verificando DELETE /api/publicaciones/${idCreado} ...`);
    const resBorrar = await axios.delete(`${BASE_URL}/api/publicaciones/${idCreado}`);
    console.log('✔ Resultado de eliminación:', resBorrar.data.mensaje);

    console.log('\n=== TODAS LAS PRUEBAS DEL BACKEND SE COMPLETARON CON ÉXITO ===');
  } catch (error) {
    console.error('✖ Error durante las pruebas del backend:', error.message);
    if (error.response) {
      console.error('Detalles de la respuesta:', error.response.data);
    }
  }
}

probarBackend();





