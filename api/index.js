'use strict';

// ─────────────────────────────────────────────────────────────
// Entry point para Vercel (serverless function).
// El server expone la app Express; Vercel la invoca por request.
// Las rutas /api/* se sirven acá (ver vercel.json → rewrites).
// ─────────────────────────────────────────────────────────────

const app = require('../server');

module.exports = app;
