/**
 * Middleware personalizado de registro de peticiones (requestLogger).
 * Registra en consola el método HTTP, la URL solicitada, la fecha/hora exacta en ISO
 * e inyecta/evalúa cabeceras de auditoría y trazabilidad en la petición y respuesta.
 */
export const requestLogger = (req, res, next) => {
  // Fecha y hora exacta de la solicitud
  const timestamp = new Date().toISOString();
  const { method, originalUrl, headers } = req;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Inyección de cabeceras personalizadas en la respuesta para auditoría y trazabilidad
  res.setHeader('X-Powered-By-Empaticos', 'backend-v1');
  res.setHeader('X-Request-Timestamp', timestamp);

  // Registro en consola del método, URL y fecha/hora exacta
  console.log(`[LOG ${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);

  // Auditoría para métodos de modificación de estado (POST y PUT)
  if (method === 'POST' || method === 'PUT') {
    const auditHeader = headers['x-audit-client'] || headers['x-api-key'] || 'No especificado';
    console.log(`[AUDITORÍA HTTP ${method}] Cabecera Cliente/Origen: ${auditHeader}`);
  }

  next();
};

export default requestLogger;
