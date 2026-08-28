// Middleware personalizado de auditoría, trazabilidad y registro de peticiones HTTP
// Middleware propio registro cada petición entrante con su timestamp, método, IP y URL, e inyecto una cabecera personalizada de trazabilidad.

export const auditoriaMiddleware = (req, res, next) => {
  // Capturo la fecha y hora exacta en formato ISO
  const timestamp = new Date().toISOString();

  // Obtener método HTTP y URL
  const { method, originalUrl } = req;

  // Determino la IP del cliente realizando la petición
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Inserto mi cabecera de trazabilidad personalizada exigida en las consignas
  res.setHeader('X-Powered-By-Empaticos', 'backend-v1');

  // Log muestro por consola los detalles de la auditoría en tiempo real
  console.log(`[AUDITORÍA ${timestamp}] ${method} ${originalUrl} - IP: ${ip}`);

  // Finalmente doy paso al siguiente middleware o controlador en la cadena
  next();
};

export default auditoriaMiddleware;
