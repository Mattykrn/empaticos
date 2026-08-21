import jwt from 'jsonwebtoken';

// En este middleware me encargo de proteger las rutas privadas extrayendo y verificando el token JWT de la sesión
export const verificarSesion = (req, res, next) => {
  // Extraigo el encabezado Authorization de la petición HTTP entrante
  const authHeader = req.headers.authorization;

  // Verifico que el encabezado esté presente y comience con el prefijo estándar 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      mensaje: 'Acceso no autorizado. Debe proporcionar un token de sesión en el encabezado Authorization'
    });
  }

  // Aíslo el token en texto plano removiendo la palabra 'Bearer '
  const token = authHeader.split(' ')[1];

  try {
    // Configuro el secreto utilizado para verificar la firma del token
    const secret = process.env.JWT_SECRET || 'super_secreto_empaticos_jwt_2026';

    // Desencripto y me aseguro de la validez del token JWT
    const decoded = jwt.verify(token, secret);

    // Inyecto la información descodificada del usuario en la propiedad req.usuario para que las siguientes funciones accedan a ella
    req.usuario = decoded;

    // Concedo el paso al siguiente middleware o controlador de la ruta
    return next();
  } catch (error) {
    console.error('Error al verificar el token JWT de sesión:', error.message);
    return res.status(401).json({
      success: false,
      mensaje: 'El token de sesión es inválido, ha sido alterado o ha expirado',
      error: error.message
    });
  }
};
