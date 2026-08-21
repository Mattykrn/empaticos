// En este middleware personalizado me encargo de moderar el lenguaje utilizado en las publicaciones.
// Al tratarse de una comunidad de salud y contención ("Empáticos"), necesito asegurar un espacio libre de agresiones,
// insultos o expresiones hostiles hacia los pacientes, familiares o profesionales.

const palabrasProhibidas = [
  'insulto',
  'estupido',
  'estúpido',
  'idiota',
  'imbecil',
  'imbécil',
  'tarado',
  'basura',
  'odio',
  'odioso',
  'inútil',
  'inutil',
  'maldito',
  'violencia'
];

export const moderarContenido = (req, res, next) => {
  try {
    // Aplico programación defensiva asegurando que req.body exista antes de desestructurar
    const body = req.body || {};
    const { titulo = '', contenido = '' } = body;

    // Concateno y convierto todo el texto a minúsculas para realizar una búsqueda uniforme sin importar mayúsculas
    const textoCompleto = `${titulo} ${contenido}`.toLowerCase();

    // Reviso si alguna de las palabras prohibidas está presente dentro del texto enviado
    const palabraInapropiadaEncontrada = palabrasProhibidas.find(palabra =>
      textoCompleto.includes(palabra)
    );

    // Si detecto contenido o lenguaje inapropiado, detengo la solicitud con código 400 Bad Request
    if (palabraInapropiadaEncontrada) {
      return res.status(400).json({
        success: false,
        mensaje: 'La publicación no cumple con nuestras normas de respeto y contención comunitaria',
        motivo: `Se detectaron términos o lenguaje potencialmente agresivo u ofensivo ('${palabraInapropiadaEncontrada}'). Por favor, mantén un tono empático y constructivo.`
      });
    }

    // Si el mensaje respeta los principios de convivencia de mi plataforma, continúo la ejecución
    next();
  } catch (error) {
    // Si sucede alguna excepción imprevista durante el análisis de moderación, respondo con error 500
    return res.status(500).json({
      success: false,
      mensaje: 'Error interno en mi middleware de moderación de contenidos',
      error: error.message
    });
  }
};





