// Controlador para la comunicación e integración con API pública externa
// En este controlador consumo una API externa mediante el cliente HTTP fetch nativo de Node.js para obtener y formatear frases de apoyo emocional.

/**
 * GET /api/externa/frase-apoyo
 * En este controlador obtengo y entrego una frase diaria de aliento o contención emocional.
 */
export const obtenerFraseApoyo = async (req, res) => {
  try {
    // En este bloque realizo la petición HTTP GET a la API externa de frases inspiradoras
    // Utilizo fetch nativo incorporado desde Node.js v18+
    const respuesta = await fetch('https://dummyjson.com/quotes/random');

    if (!respuesta.ok) {
      throw new Error(`La API externa devolvió un estatus HTTP: ${respuesta.status}`);
    }

    // Aquí transformo el cuerpo de la respuesta a un objeto JSON
    const datos = await respuesta.json();

    // En esta sección formateo mi respuesta propia agregando valor y contención emocional
    const fraseFormateada = {
      frase: datos.quote || 'Cada paso en tu proceso cuenta, no estás solo en este camino.',
      autor: datos.author || 'Equipo Empáticos',
      categoria: 'Contención Emocional y Empatía',
      origen: 'API Externa de Salud y Bienestar',
      fecha: new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    // Respondo al cliente con un objeto claro y código HTTP 200 OK
    res.status(200).json({
      ok: true,
      mensaje: 'Frase de apoyo diaria obtenida exitosamente desde la API externa',
      data: fraseFormateada
    });
  } catch (error) {
    // En este bloque proveo un fallback seguro de contención en caso de falla de conectividad externa
    console.error(`[Error API Externa] Falló el consumo con fetch: ${error.message}`);
    
    res.status(200).json({
      ok: true,
      mensaje: 'Frase diaria de apoyo (modo contención local por respaldo)',
      data: {
        frase: 'La empatía transforma las dificultades en lazos de fortaleza y superación mutua.',
        autor: 'Comunidad Empáticos',
        categoria: 'Contención Emocional Local',
        fecha: new Date().toLocaleDateString('es-ES')
      }
    });
  }
};
