const { spawn } = require('child_process');
const fetch = global.fetch;
const path = require('path');

const serverPath = path.join(__dirname, '..', 'server.js');
const server = spawn('node', [serverPath], { stdio: ['ignore', 'pipe', 'pipe'] });

server.stdout.on('data', (chunk) => {
  process.stdout.write(chunk.toString());
});
server.stderr.on('data', (chunk) => {
  process.stderr.write(chunk.toString());
});

const BASE = 'http://127.0.0.1:4000/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'EMpaticos2025arg';
const VISITOR = 'visitor_qa_12345678';
const adminHeaders = { 'Content-Type': 'application/json', 'x-admin-password': ADMIN_PASSWORD };

let failures = 0;

function check(name, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ ${name}`);
  } else {
    failures++;
    console.log(`  ❌ ${name} ${detail}`);
  }
}

async function waitForServer() {
  const start = Date.now();
  while (Date.now() - start < 8000) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.ok) return;
    } catch (err) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw new Error('No se pudo conectar con el servidor en el puerto 4000');
}

async function runTests() {
  try {
    await waitForServer();
    console.log('✅ Servidor activo');

    // Health
    const health = await fetch(`${BASE}/health`);
    check('GET /api/health', health.status === 200, `(${health.status})`);

    // Stats
    const stats = await (await fetch(`${BASE}/stats`)).json();
    check('GET /api/stats', typeof stats.total === 'number', JSON.stringify(stats));

    // Entradas aprobadas
    const entries = await (await fetch(`${BASE}/entries`)).json();
    check('GET /api/entries', Array.isArray(entries.entries) && entries.entries.length > 0,
      `(${entries.entries?.length} entradas)`);

    // Filtro por tipo
    const anecdotas = await (await fetch(`${BASE}/entries?type=anecdota`)).json();
    check('GET /api/entries?type=anecdota', anecdotas.entries.every((e) => e.type === 'anecdota'));

    const videos = await (await fetch(`${BASE}/entries?type=video`)).json();
    check('GET /api/entries?type=video', videos.entries.every((e) => e.type === 'video'));

    // Crear entrada
    const create = await fetch(`${BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'anecdota',
        title: 'Test automatizado',
        content: 'Una anécdota creada por el script de pruebas.',
        emType: 'EMRR',
        tags: ['test', 'humor'],
        authorName: 'QA bot',
        isAnonymous: false,
      }),
    });
    const created = await create.json();
    const createdId = created.entry?.id;
    check('POST /api/entries', create.status === 201 && !!createdId, `(${create.status})`);
    check('POST /api/entries -> pending', created.entry?.status === 'pending');
    check('POST /api/entries -> tags limpias', Array.isArray(created.entry?.tags) && created.entry.tags.length === 2);

    // La entrada nueva no aparece en público todavía
    const publicAnecdotas = await (await fetch(`${BASE}/entries?type=anecdota`)).json();
    check('Entrada pendiente oculta al público',
      !publicAnecdotas.entries.some((e) => e.id === createdId));

    // Validación: contenido obligatorio
    const badCreate = await fetch(`${BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'historia', content: '' }),
    });
    check('POST /api/entries sin contenido -> 400', badCreate.status === 400, `(${badCreate.status})`);

    // Reacciones (sobre la entrada creada, para no alterar datos de ejemplo)
    const react = await fetch(`${BASE}/entries/${createdId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: 'hearts' }),
    });
    const reacted = await react.json();
    check('POST /api/entries/:id/react', react.status === 200 && reacted.entry.reactions.hearts === 1,
      `(${react.status})`);

    const badReact = await fetch(`${BASE}/entries/${createdId}/react`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: 'wat' }),
    });
    check('Reacción inválida -> 400', badReact.status === 400, `(${badReact.status})`);

    // Comentarios
    const targetEntry = entries.entries[0];
    const comment = await fetch(`${BASE}/entries/${targetEntry.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorName: 'QA',
        avatar: '🙂',
        visitorId: VISITOR,
        text: 'Un comentario de prueba <script>alert(1)</script>',
      }),
    });
    const commentData = await comment.json();
    const lastComment = commentData.entry.comments[commentData.entry.comments.length - 1];
    check('POST comentario', comment.status === 201 && !!lastComment.id, `(${comment.status})`);
    check('Comentario sanitizado', !lastComment.text.includes('<script>'));

    const pendComment = await fetch(`${BASE}/entries/${createdId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'no debería' }),
    });
    check('Comentar entrada pendiente -> 403', pendComment.status === 403, `(${pendComment.status})`);

    const emptyComment = await fetch(`${BASE}/entries/${targetEntry.id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ' }),
    });
    check('Comentario vacío -> 400', emptyComment.status === 400, `(${emptyComment.status})`);

    const delComment = await fetch(`${BASE}/entries/${targetEntry.id}/comments/${lastComment.id}`, {
      method: 'DELETE',
      headers: adminHeaders,
    });
    check('DELETE comentario (admin)', delComment.status === 200, `(${delComment.status})`);

    const delCommentUnauth = await fetch(`${BASE}/entries/${targetEntry.id}/comments/${lastComment.id}`, {
      method: 'DELETE',
    });
    check('DELETE comentario sin clave -> 401', delCommentUnauth.status === 401, `(${delCommentUnauth.status})`);

    // Favoritos
    const badFav = await fetch(`${BASE}/favorites/bad!!!`);
    check('Favoritos con visitante inválido -> 400', badFav.status === 400, `(${badFav.status})`);

    await fetch(`${BASE}/favorites/${VISITOR}/${targetEntry.id}`, { method: 'POST' });
    let favs = await (await fetch(`${BASE}/favorites/${VISITOR}`)).json();
    check('Favorito agregado', favs.entryIds.includes(targetEntry.id));

    await fetch(`${BASE}/favorites/${VISITOR}/${targetEntry.id}`, { method: 'DELETE' });
    favs = await (await fetch(`${BASE}/favorites/${VISITOR}`)).json();
    check('Favorito removido', !favs.entryIds.includes(targetEntry.id));

    // Autenticación del admin (login + JWT)
    const badLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@local', password: 'clave-incorrecta' }),
    });
    check('Login admin con clave incorrecta -> 401', badLogin.status === 401, `(${badLogin.status})`);

    const missingLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    check('Login admin sin credenciales -> 401', missingLogin.status === 401, `(${missingLogin.status})`);

    const goodLogin = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@local', password: ADMIN_PASSWORD }),
    });
    const loginData = await goodLogin.json();
    check('Login admin correcto -> 200 + token',
      goodLogin.status === 200 && typeof loginData.token === 'string',
      `(${goodLogin.status})`);

    const bearerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${loginData.token}` };

    const tokenAll = await fetch(`${BASE}/entries/all`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    check('GET /api/entries/all con Bearer JWT', tokenAll.status === 200, `(${tokenAll.status})`);

    const badTokenAll = await fetch(`${BASE}/entries/all`, {
      headers: { Authorization: 'Bearer token-invalido' },
    });
    check('GET /api/entries/all con JWT inválido -> 401', badTokenAll.status === 401, `(${badTokenAll.status})`);

    const verifyOk = await fetch(`${BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    const verifyData = await verifyOk.json();
    check('GET /api/auth/verify con token válido', verifyOk.status === 200 && verifyData.valid === true,
      `(${verifyOk.status})`);

    const verifyNoToken = await fetch(`${BASE}/auth/verify`);
    check('GET /api/auth/verify sin token -> 401', verifyNoToken.status === 401, `(${verifyNoToken.status})`);

    const verifyBad = await fetch(`${BASE}/auth/verify`, {
      headers: { Authorization: 'Bearer token-invalido' },
    });
    check('GET /api/auth/verify con token inválido -> 401', verifyBad.status === 401, `(${verifyBad.status})`);

    // Upload de imagen
    const pngB64 = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    ).toString('base64');
    const upload = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: 'image/png', data: pngB64, filename: 'test.png' }),
    });
    const uploadData = await upload.json();
    const isCloudUpload = uploadData.url.startsWith('https://res.cloudinary.com/');
    check('POST /api/upload',
      upload.status === 201 && (uploadData.url.startsWith('/uploads/') || isCloudUpload),
      `(${upload.status})`);

    const badUpload = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mimeType: 'text/html', data: 'x' }),
    });
    check('Upload mime no permitido -> 400', badUpload.status === 400, `(${badUpload.status})`);

    // Galería: solo se permiten /uploads o Cloudinary en mediaUrls
    const galeria = await fetch(`${BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'galeria',
        content: 'Galería de prueba',
        mediaUrls: ['https://evil.com/a.jpg', uploadData.url],
      }),
    });
    const galeriaData = await galeria.json();
    check('Galería filtra mediaUrls', galeria.status === 201 && galeriaData.entry.mediaUrls.length === 1,
      `(${galeria.status})`);

    // Audio
    const audio = await fetch(`${BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'anecdota', content: 'con audio', mediaType: 'audio', mediaUrl: 'https://open.spotify.com/embed/episode/x' }),
    });
    const audioData = await audio.json();
    check('Entrada con mediaType audio', audio.status === 201 && audioData.entry.mediaType === 'audio', `(${audio.status})`);

    // Entradas propias
    const mineBad = await fetch(`${BASE}/entries/mine?visitorId=nope`);
    check('entries/mine con visitante inválido -> 400', mineBad.status === 400, `(${mineBad.status})`);
    const mine = await (await fetch(`${BASE}/entries/mine?visitorId=${VISITOR}`)).json();
    check('entries/mine devuelve array', Array.isArray(mine.entries));

    // Admin: sin clave
    const unauthAll = await fetch(`${BASE}/entries/all`);
    check('GET /api/entries/all sin clave -> 401', unauthAll.status === 401, `(${unauthAll.status})`);

    const unauthStatus = await fetch(`${BASE}/entries/${createdId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    check('PATCH status sin clave -> 401', unauthStatus.status === 401, `(${unauthStatus.status})`);

    // Admin: con token Bearer
    const all = await (await fetch(`${BASE}/entries/all`, { headers: bearerHeaders })).json();
    check('GET /api/entries/all con token', Array.isArray(all.entries) && all.entries.some((e) => e.id === createdId));

    const approve = await fetch(`${BASE}/entries/${createdId}/status`, {
      method: 'PATCH',
      headers: bearerHeaders,
      body: JSON.stringify({ status: 'approved' }),
    });
    const approved = await approve.json();
    check('PATCH status con token -> approved', approve.status === 200 && approved.entry.status === 'approved');

    // Legacy: el header x-admin-password sigue funcionando (compatibilidad en modo dev)
    const badStatus = await fetch(`${BASE}/entries/${createdId}/status`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ status: 'nope' }),
    });
    check('PATCH status inválido (legacy) -> 400', badStatus.status === 400, `(${badStatus.status})`);

    // La entrada aprobada ahora aparece en público
    const publicAfter = await (await fetch(`${BASE}/entries?type=anecdota`)).json();
    check('Entrada aprobada visible al público',
      publicAfter.entries.some((e) => e.id === createdId));

    // Eliminar
    const remove = await fetch(`${BASE}/entries/${createdId}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    check('DELETE /api/entries/:id', remove.status === 200, `(${remove.status})`);

    const missing = await fetch(`${BASE}/entries/${createdId}`, {
      method: 'DELETE',
      headers: bearerHeaders,
    });
    check('DELETE de entrada inexistente -> 404', missing.status === 404, `(${missing.status})`);

    // Legacy /api/stories
    const legacy = await (await fetch(`${BASE}/stories`)).json();
    check('GET /api/stories (legacy)', Array.isArray(legacy.stories) && legacy.stories.length > 0,
      `(${legacy.stories?.length} historias)`);

    // Limpieza de entradas y archivos de prueba
    await fetch(`${BASE}/entries/${galeriaData.entry.id}`, { method: 'DELETE', headers: bearerHeaders });
    await fetch(`${BASE}/entries/${audioData.entry.id}`, { method: 'DELETE', headers: bearerHeaders });
    if (uploadData.url.startsWith('/uploads/')) {
      const uploadName = uploadData.url.split('/').pop();
      const fs = require('fs');
      fs.rmSync(path.join(__dirname, '..', 'uploads', uploadName), { force: true });
    }
    console.log('  ✅ Limpieza de datos de prueba');

    if (failures > 0) {
      console.log(`\n${failures} prueba(s) fallaron.`);
      process.exit(1);
    }
    console.log('\n🎉 Todas las pruebas pasaron.');
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
    process.exit(1);
  } finally {
    server.kill();
  }
}

runTests();
