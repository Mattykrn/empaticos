'use strict';

// ─────────────────────────────────────────────────────────────
// Middleware que protege rutas del admin (TAREA 3 — Paso 3)
//
// Verifica el token JWT en el header Authorization: Bearer <token>.
// También acepta el header legacy x-admin-password, pero solo en
// modo desarrollo (cuando Firebase Auth no está habilitado).
// ─────────────────────────────────────────────────────────────

const auth = require('../auth');

async function adminAuth(req, res, next) {
  try {
    // Primero intentar con Bearer token (nuevo método)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      req.user = await auth.verifyToken(token);
      return next();
    }

    // Fallback legacy: header x-admin-password (solo desarrollo)
    if (!auth.isFirebaseAuthEnabled()) {
      const legacyPassword = req.headers['x-admin-password'];
      const adminPassword = process.env.ADMIN_PASSWORD || 'EMpaticos2025arg';

      if (legacyPassword === adminPassword) {
        req.user = { email: 'admin@legacy', uid: 'legacy-user' };
        return next();
      }
    }

    // Si nada funcionó
    return res.status(401).json({ error: 'No autorizado. Token o credenciales inválidas.' });
  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
}

module.exports = adminAuth;
