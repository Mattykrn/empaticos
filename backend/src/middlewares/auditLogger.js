// ==========================================
// MIDDLEWARE PROPIO DE AUDITORIA HTTP
// ==========================================
// En este middleware anoto cada petición que llega al servidor:
// fecha, hora, método HTTP, la URL pedida, la IP y cuánto tardó en responder.
export const auditLogger = (req, res, next) => {
  const tiempoInicio = Date.now();
  const timestamp = new Date().toISOString();
  const { method, originalUrl } = req;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Meto una cabecera para saber qué versión de backend está respondiendo
  res.setHeader('X-Powered-By-Empaticos', 'backend-v1');
  res.setHeader('X-Audit-Timestamp', timestamp);

  // Espero a que termine de responder para medir el tiempo total en milisegundos
  res.on('finish', () => {
    const duracionMs = Date.now() - tiempoInicio;
    console.log(`📡 [AUDITORÍA HTTP ${timestamp}] ${method} ${originalUrl} | Status: ${res.statusCode} | IP: ${ip} | ${duracionMs}ms`);
  });

  // Continúo con el siguiente middleware o controlador
  next();
};





// ==========================================
// EXPORTACION DEL MIDDLEWARE
// ==========================================
export default auditLogger;
