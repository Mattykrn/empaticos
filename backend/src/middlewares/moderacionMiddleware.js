// ==========================================
// PALABRAS PROHIBIDAS PARA LA COMUNIDAD
// ==========================================
const PALABRAS_PROHIBIDAS = [
  'estupido',
  'idiota',
  'imbecil',
  'inutil',
  'basura'
];

const normalizarTexto = (texto) =>
  String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

// ==========================================
// MIDDLEWARE DE FILTRADO Y MODERACION
// ==========================================
export const moderacionMiddleware = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
    const textoAnalizar = normalizarTexto([
      req.body.titulo || '',
      req.body.contenido || '',
      req.body.content || '',
      req.body.texto || '',
      req.body.comentario || ''
    ].join(' '));

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

export default moderacionMiddleware;
