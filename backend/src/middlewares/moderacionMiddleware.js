// ==========================================
// PALABRAS PROHIBIDAS PARA LA COMUNIDAD
// ==========================================
// Listado sencillo de términos que queremos bloquear para cuidar el respeto en la comunidad
const PALABRAS_PROHIBIDAS = [
  'estupido',
  'estúpido',
  'idiota',
  'imbecil',
  'imbécil',
  'inutil',
  'inútil',
  'basura'
];





// ==========================================
// MIDDLEWARE DE FILTRADO Y MODERACION
// ==========================================
// Acá chequeo si mandan palabras agresivas en el título o contenido de las publicaciones
export const moderacionMiddleware = (req, res, next) => {
  // Reviso peticiones que lleven body (POST, PUT, PATCH)
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const textoAnalizar = [
      req.body.titulo || '',
      req.body.contenido || '',
      req.body.texto || '',
      req.body.comentario || ''
    ].join(' ').toLowerCase();

    // Me fijo si alguna palabra prohibida coincide
    const palabraDetectada = PALABRAS_PROHIBIDAS.find((palabra) => {
      const regex = new RegExp(`\\b${palabra}\\b`, 'i');
      return regex.test(textoAnalizar);
    });

    if (palabraDetectada) {
      console.warn(`🛡️ [Moderación] Se frenó una petición por contener la palabra: "${palabraDetectada}"`);
      return res.status(400).json({
        ok: false,
        success: false,
        mensaje: `La publicación contiene lenguaje no permitido o contrario a las normas de respeto ('${palabraDetectada}')`,
        error: 'Violación de normas de moderación comunitaria'
      });
    }
  }

  next();
};





// ==========================================
// EXPORTACION DEL MIDDLEWARE
// ==========================================
export default moderacionMiddleware;
