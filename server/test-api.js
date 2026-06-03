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

    const health = await fetch(`${BASE}/health`);
    console.log('Health status:', health.status);

    const stories = await fetch(`${BASE}/stories`);
    const storiesData = await stories.json();
    console.log('Stories loaded:', Array.isArray(storiesData.stories) ? storiesData.stories.length : 'n/a');

    const create = await fetch(`${BASE}/stories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', type: 'EMRR', story: 'Prueba de envío desde test.', anonymous: false })
    });

    console.log('POST /stories status:', create.status);

    const createdData = await create.json();
    console.log('Created story id:', createdData.story?.id || 'no se creó');
  } catch (error) {
    console.error('❌ Error en pruebas:', error.message);
    process.exit(1);
  } finally {
    server.kill();
  }
}

runTests();
