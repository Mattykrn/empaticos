/**
 * Middleware propio de auditoría / logger.
 * Registra el método HTTP, la ruta solicitada, el timestamp exacto y calcula el tiempo de respuesta en milisegundos.
 */
export const auditLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;

  // Intercepto la finalización de la petición HTTP para calcular la duración total
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[AUDITORÍA ${timestamp}] ${method} ${originalUrl} | Status: ${res.statusCode} | IP: ${ip} | Duración: ${duration}ms`);
  });

  next();
};

export default auditLogger;
