# EMpaticos – Comunidad de Apoyo en Esclerosis Múltiple

Un sitio web moderno migrado a **React** con un backend **Node.js** que permite a los usuarios compartir sus historias de vida.

## 🚀 Estructura del Proyecto

```
empaticos/
├── index.html              # SPA React entry point
├── js/
│   ├── app.jsx            # Componentes y rutas React (comentado)
│   └── (otros archivos legacy)
├── css/
│   └── styles.css         # Estilos con theme naranja
├── server.js              # Backend Express
├── package.json           # Dependencias Node
├── data/
│   └── db.json            # Base de datos JSON con historias
├── server/
│   └── test-api.js        # Script de pruebas del API
└── src/pages/             # Páginas legacy (redirigen a React)
```

## 🔧 Backend Node.js

El backend está construido con **Express** y usa una base de datos JSON simple (`data/db.json`).

### Dependencias

```json
{
  "cors": "^2.8.5",
  "express": "^4.18.4"
}
```

### APIs Disponibles

#### 1. Health Check
```
GET http://localhost:4000/api/health
```
Devuelve: `{ "status": "ok", "message": "Backend Node.js funcionando" }`

#### 2. Obtener Historias
```
GET http://localhost:4000/api/stories
```
Devuelve:
```json
{
  "stories": [
    {
      "id": 1234567890,
      "name": "Matías",
      "type": "EMRR",
      "story": "Mi experiencia con EM...",
      "anonymous": false,
      "createdAt": "2026-03-26T00:00:00Z"
    }
  ]
}
```

#### 3. Crear Nueva Historia
```
POST http://localhost:4000/api/stories
Content-Type: application/json

{
  "name": "Tu Nombre",
  "type": "EMRR",
  "story": "Mi historia...",
  "anonymous": false
}
```

Devuelve:
```json
{
  "story": {
    "id": 1686835200000,
    "name": "Tu Nombre",
    "type": "EMRR",
    "story": "Mi historia...",
    "anonymous": false,
    "createdAt": "2026-06-03T12:00:00Z"
  }
}
```

## 📦 Cómo Levantar el Proyecto

### 1. Instalar Dependencias

```bash
cd /home/mati/Documentos/empaticos
npm install
```

Si no tienes `npm` instalado, descarga Node.js desde https://nodejs.org/

### 2. Iniciar el Backend

```bash
npm start
# o con nodemon en desarrollo:
npm run dev
```

El servidor estará disponible en `http://localhost:4000`

Deberías ver:
```
Servidor Node.js arrancado en http://localhost:4000
```

### 3. Abrir la App React

Una vez que el backend está corriendo, abre en el navegador:

**Opción A:** Archivo local
```
file:///home/mati/Documentos/empaticos/index.html
```

**Opción B:** Servir con un servidor local (si tienes Python)
```bash
# En la carpeta del proyecto
python3 -m http.server 8000
# Abre http://localhost:8000
```

## ✅ Probar el API

### Con curl

```bash
# Verificar que el servidor está vivo
curl http://localhost:4000/api/health

# Obtener historias
curl http://localhost:4000/api/stories

# Crear una historia
curl -X POST http://localhost:4000/api/stories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test",
    "type": "EMRR",
    "story": "Esto es una prueba",
    "anonymous": false
  }'
```

### Con el script de pruebas (requiere Node.js)

```bash
npm test
```

Esto arranca automáticamente el servidor, ejecuta tests y lo detiene.

## 🗄️ Base de Datos (JSON)

La base de datos está en `data/db.json`:

```json
{
  "stories": [
    {
      "id": 1,
      "name": "Matías",
      "type": "EMRR",
      "story": "Bienvenido a la sección de Historias...",
      "anonymous": false,
      "createdAt": "2026-03-26T00:00:00Z"
    }
  ]
}
```

**Nota:** Los cambios se guardan automáticamente en este archivo.

## 🎨 Frontend React

La app React está en `js/app.jsx` y tiene:

- **Home**: Página de bienvenida con video
- **Noticias**: Feed de noticias sobre EM (datos estáticos)
- **Historias**: Carga historias del backend
- **Unirme**: Formulario para enviar nuevas historias al backend
- **Nosotros**: Misión y visión
- **Admin**: Panel protegido con contraseña

### Características

✅ SPA sin build tools (React + Babel en navegador)
✅ Routing con HashRouter (para archivos locales)
✅ CORS habilitado (comunica con backend)
✅ Responsive con Bootstrap 5
✅ Tema naranja personalizado
✅ Modal de donaciones

## 🚢 Deploy del Frontend a Vercel

El proyecto está listo para deployar el frontend a **Vercel**.

```bash
# 1. Instala Vercel CLI
npm install -g vercel

# 2. Deploy
vercel
```

Cuando el frontend esté en Vercel, necesitás un backend Node.js separado.

### 📡 Deploy del Backend

Como la aplicación usa un backend Express + JSON file, te recomiendo usar:

- **Railway**
- **Render**
- **Heroku**

Estas plataformas soportan un servidor Node.js en ejecución continua.

### Opción A: Deploy en Railway

1. Crea una cuenta en https://railway.app/
2. Conecta tu repositorio `Mattykrn/empaticos`
3. Selecciona el root del proyecto como directorio
4. Configura el comando de build:
   ```bash
   npm install
   ```
5. Configura el comando de start:
   ```bash
   npm start
   ```
6. Despliega el proyecto

Railway te dará una URL tipo `https://mi-backend.up.railway.app`.

### Opción B: Deploy en Render

1. Crea una cuenta en https://render.com/
2. Crea un nuevo **Web Service**
3. Conecta tu repositorio `Mattykrn/empaticos`
4. Elige Node.js y el root del proyecto
5. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Despliega el servicio

Render te dará una URL tipo `https://mi-backend.onrender.com`.

### Configurar la URL del backend en el frontend

En `index.html` hay un script que define:

```html
<script>
  window.EMPATICOS_API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://TU_BACKEND_URL/api';
</script>
```

Cuando tengas la URL real del backend, reemplazá `https://TU_BACKEND_URL/api` con la URL de tu servicio en Railway o Render.

### Ejemplo final

Si tu backend queda en `https://backend-empaticos.up.railway.app`, el script debe quedar así:

```html
<script>
  window.EMPATICOS_API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:4000/api'
    : 'https://backend-empaticos.up.railway.app/api';
</script>
```

## 🔐 Credenciales

**Admin Panel:**
- Contraseña: `EMpaticos2025arg`

## 📝 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + React Router DOM 6 |
| Transpiler | Babel (in-browser) |
| Backend | Express.js |
| Database | JSON file |
| UI Framework | Bootstrap 5 |
| Fonts | Google Fonts (Inter) |
| Hosting | Vercel (frontend) + Node.js (backend) |

## 🆘 Troubleshooting

### Error: "No se pudo conectar al backend"

- ¿El servidor Node está corriendo en `localhost:4000`?
- ¿Ejecutaste `npm start` o `npm run dev`?
- Revisa la consola del navegador (F12) para errores de CORS

### Error: "CORS policy blocked request"

- El backend tiene CORS habilitado para todos los orígenes
- Si aún así falla, intenta desde `http://localhost:8000` en lugar de `file://`

### Error: "npm no encontrado"

- Instala Node.js desde https://nodejs.org/
- Reinicia tu terminal después de instalar

### La app está en blanco

- Abre la consola (F12)
- Busca errores de carga de scripts
- Verifica que todos los CDN de React se cargaron (sin status 404)

## 📬 Contacto

Email: matii.toorres.06@gmail.com

---

**Última actualización:** 3 de junio de 2026
