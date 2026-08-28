// Middleware calculo el tiempo de ejecución y audito cada petición HTTP
export const auditLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  const { method, originalUrl, ip } = req;

  // Escucho el evento finish de la respuesta Express para registrar el estado y la duración
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[AUDITORÍA ${timestamp}] ${method} ${originalUrl} | Status: ${res.statusCode} | IP: ${ip} | Duración: ${duration}ms`);
  });

  next();
};

export default auditLogger;
