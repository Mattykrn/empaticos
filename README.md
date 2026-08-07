# EMpaticos – Comunidad de Apoyo en Esclerosis Múltiple

Un sitio web moderno en **React (Vite)** con un backend **Node.js** donde la comunidad comparte historias de vida, anécdotas divertidas, videos, podcasts y galerías de fotos. Cada publicación recibe reacciones de apoyo (corazones, abrazos y risas), comentarios, y se puede compartir en redes sociales o guardar en favoritos. Los miembros pueden crear un perfil simple con avatar y sus publicaciones pasan por un panel de moderación antes de publicarse.

## 🚀 Estructura del Proyecto

```
empaticos/
├── index.html              # SPA React entry point
├── src/
│   ├── main.jsx            # Punto de entrada React + HashRouter + Providers
│   ├── App.jsx             # Rutas de la aplicación
│   ├── api.js              # Cliente del backend (endpoints /api)
│   ├── components/         # Header, Footer, EntradaCard, Reactions, Comments, ...
│   ├── context/            # ProfileContext (perfil del visitante) y FavoritesContext
│   ├── hooks/useEntries.js # Hook para cargar entradas por tipo
│   └── pages/              # Home, Historias, Anecdotas, Videos, Galeria, Unirme, Perfil, Admin
├── css/
│   └── styles.css          # Estilos con theme naranja y dark mode
├── scripts/
│   └── create-admin.js     # Crea el usuario admin en Firebase Auth (custom claim)
├── server.js              # Backend Express
├── server/
│   ├── store.js           # Capa de persistencia (Firestore + fallback JSON)
│   ├── firebase.js        # Inicialización única de firebase-admin
│   ├── auth.js            # Autenticación del admin (Firebase Auth + JWT)
│   ├── middleware/adminAuth.js # Protección de rutas admin (Bearer JWT / legacy)
│   ├── cloudinary.js      # Subida de imágenes (Cloudinary + fallback local)
│   ├── migrate-firestore.js # Migración única de db.json → Firestore
│   └── test-api.js        # Script de pruebas del API (npm test)
├── data/
│   └── db.json            # Base de datos JSON con entradas
├── uploads/               # Imágenes subidas por la comunidad (no versionado)
├── .env.example           # Variables de entorno documentadas (backend + frontend)
└── dist/                  # Build de producción (vite build)
```

## 🧩 Schema de Datos

Cada publicación es una **entrada** dentro de `data/db.json`:

```json
{
  "entries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "historia" | "anecdota" | "video" | "diagnostico" | "galeria",
      "title": "Título de la entrada",
      "content": "Texto principal del contenido",
      "mediaType": "none" | "youtube" | "image" | "audio",
      "mediaUrl": "https://www.youtube.com/embed/xxx",
      "mediaUrls": ["/uploads/foto-1.jpg", "/uploads/foto-2.jpg"],
      "emType": "EMRR" | "EMSP" | "EMPP" | "SCA" | "Otro" | null,
      "tags": ["humor", "familia", "trabajo"],
      "authorName": "Nombre del autor",
      "isAnonymous": false,
      "visitorId": "identificador-del-visitante",
      "status": "approved" | "pending",
      "reactions": { "hearts": 0, "laughs": 0, "hugs": 0 },
      "comments": [
        {
          "id": "c1",
          "authorName": "Nombre",
          "avatar": "😊",
          "visitorId": "identificador-del-visitante",
          "text": "Qué linda historia",
          "createdAt": "2026-08-07T11:00:00Z"
        }
      ],
      "createdAt": "2026-08-07T10:00:00Z"
    }
  ],
  "favorites": {
    "identificador-del-visitante": ["entry-id-1", "entry-id-2"]
  }
}
```

Los tipos `galeria` usan el campo `mediaUrls[]` (solo URLs de `/uploads/...`); los de tipo `audio` embeben un reproductor de podcast.

## 🔧 Backend Node.js

El backend está construido con **Express** y usa una base de datos JSON simple (`data/db.json`). Los cambios se guardan automáticamente.

### APIs Disponibles

#### Públicas

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Estadísticas (total, pendientes, reacciones, comentarios, favoritos, por tipo) |
| GET | `/api/entries?type=historia` | Entradas aprobadas (filtro opcional por tipo) |
| GET | `/api/entries/mine?visitorId=xxx` | Entradas del visitante (incluye las pendientes) |
| POST | `/api/entries` | Crear entrada (queda en estado `pending`) |
| POST | `/api/entries/:id/react` | Reaccionar: `{ "reaction": "hearts" \| "laughs" \| "hugs" }` |
| POST | `/api/entries/:id/comments` | Comentar: `{ "authorName", "avatar", "visitorId", "text" }` |
| DELETE | `/api/entries/:id/comments/:commentId` | Eliminar un comentario (requiere `x-admin-password`) |
| GET | `/api/favorites/:visitorId` | Lista de entradas favoritas del visitante |
| POST | `/api/favorites/:visitorId/:entryId` | Agregar a favoritos |
| DELETE | `/api/favorites/:visitorId/:entryId` | Quitar de favoritos |
| POST | `/api/upload` | Subir imagen (base64, máx. 8 MB) → Cloudinary o `/uploads/xxx.jpg` |

Ejemplo de POST `/api/entries`:

```json
{
  "type": "anecdota",
  "title": "El día que confundí el termostato",
  "content": "Con la niebla mental de un brote...",
  "mediaType": "youtube",
  "mediaUrl": "https://www.youtube.com/watch?v=_MENjcGp9Ng",
  "emType": "EMRR",
  "tags": ["humor", "niebla-mental"],
  "authorName": "María",
  "isAnonymous": false
}
```

Los links de YouTube se normalizan automáticamente a formato embed seguro.

#### Administración (requieren header `x-admin-password`)

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/entries/all` | Todas las entradas (para moderar) |
| PATCH | `/api/entries/:id/status` | `{ "status": "approved" \| "pending" }` |
| DELETE | `/api/entries/:id` | Eliminar una entrada |

#### Compatibilidad (legacy)

`/api/stories`, `/api/stories/all`, `POST /api/stories`, `PATCH /api/stories/:id/approve` y `DELETE /api/stories/:id` siguen funcionando y operan sobre entradas de tipo `historia`.

## 👥 Funciones de Comunidad (Paso 2)

- **Perfil simple**: al entrar, el visitante puede elegir un nombre y avatar (emoji) que se guardan en su navegador (`localStorage`). Botón "Editar perfil" en el header.
- **Comentarios**: cualquier visitante puede comentar las entradas públicas. El texto se sanitiza y los comentarios de entradas pendientes están bloqueados.
- **Favoritos**: cada visitante guarda sus entradas favoritas con un solo clic (guardados por `visitorId`).
- **Compartir**: botones para WhatsApp, X (Twitter), Facebook y copiar enlace.
- **Perfil público** (`#/perfil`): pestañas con *Mis publicaciones*, *Mis favoritos* y *Mis comentarios*.
- **Galería** (`#/galeria`): entradas de tipo `galeria` con grid de fotos y lightbox (navegación con teclado).
- **Audio / Podcasts**: entradas con `mediaType: audio` que embeben un reproductor (Spotify/YouTube/Podcast) o un `<audio>` directo.
- **Subida de imágenes**: en el formulario de "Compartir", se puede subir una imagen (JPEG/PNG/WebP/GIF, máx. 8 MB) que se guarda en **Cloudinary** (en desarrollo, en `uploads/` local).

## 🔥 Paso 3 — Persistencia con Firebase Firestore

La capa de datos vive en `server/store.js` y reemplaza la lectura/escritura directa de `db.json`:

- **Producción**: usa **Firebase Firestore** cuando hay credenciales configuradas.
- **Desarrollo / tests**: cae automáticamente al archivo `data/db.json` (los 35 tests siguen pasando sin Firebase).

### Configuración de Firestore

Definí **una** de estas variables de entorno:

| Variable | Descripción |
|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT` | JSON de la cuenta de servicio de Firebase, codificado en base64 |
| `GOOGLE_APPLICATION_CREDENTIALS` | Ruta al archivo JSON de la cuenta de servicio |

Colecciones en Firestore:

```
entries/                  → una entrada por documento (id = entry.id)
entries/{id}/comments/    → subcolección de comentarios
favorites/                → un documento por visitorId → { entryIds: [...] }
```

### Migrar los datos actuales (una sola vez)

```bash
FIREBASE_SERVICE_ACCOUNT="$(base64 -w0 service-account.json)" \
  node server/migrate-firestore.js
```

El script copia `data/db.json` (entradas, comentarios y favoritos) a Firestore y aborta si ya hay entradas cargadas (usar `--force` solo para re-ejecutar).

Al arrancar, el server loguea qué backend de datos usa: `Base de datos: Firebase Firestore` o `JSON local (data/db.json)`.

## ☁️ Paso 3 — Almacenamiento de imágenes con Cloudinary

Las imágenes subidas (galerías y `mediaType: image`) se guardan en **Cloudinary** en producción, con fallback al filesystem local `uploads/` en desarrollo.

Configuración (las tres variables son necesarias para activar Cloudinary):

| Variable | Descripción |
|----------|-------------|
| `CLOUDINARY_CLOUD_NAME` | Nombre del cloud |
| `CLOUDINARY_API_KEY` | API Key |
| `CLOUDINARY_API_SECRET` | API Secret |

- Las imágenes se suben a la carpeta `empaticos/` del cloud y se devuelven como URL segura (`https://res.cloudinary.com/...`).
- `sanitizeMediaUrls` acepta tanto `/uploads/...` (local) como `https://res.cloudinary.com/...` para galerías.
- Al arrancar, el server loguea `Imágenes: Cloudinary` o `Imágenes: Filesystem local (uploads/)`.

## 🔐 Paso 3 — Autenticación del Admin

### Modo Desarrollo (default)

Por defecto, el admin usa una contraseña simple definida en `ADMIN_PASSWORD`:

1. Usá la contraseña `EMpaticos2025arg` (o la que configures en `.env`)
2. Iniciá sesión con cualquier email + la contraseña correcta
3. El sistema genera un JWT local firmado con `JWT_SECRET`, válido por 24 horas

### Modo Producción (Firebase Auth)

Para producción, activá Firebase Auth:

1. En **Firebase Console → Authentication → Sign-in method**, habilitá *Email/Password*
2. Crear el primer admin:
   ```bash
   npm run create-admin admin@empaticos.com TuPasswordSegura123
   ```
   Esto crea el usuario con `emailVerified` y le asigna el custom claim `admin: true`.
3. Configurá las variables: `FIREBASE_AUTH_ENABLED=true`, `FIREBASE_SERVICE_ACCOUNT` (o `GOOGLE_APPLICATION_CREDENTIALS`), y en el frontend `VITE_FIREBASE_AUTH_ENABLED=true` + `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`
4. El frontend inicia sesión con el SDK de Firebase Auth (`signInWithEmailAndPassword`) y envía el **ID token** como `Authorization: Bearer <token>`; el backend lo verifica con `firebase-admin` y exige el custom claim `admin`

### Variables

| Variable | Descripción |
|----------|-------------|
| `ADMIN_PASSWORD` | Contraseña admin en modo desarrollo (default `EMpaticos2025arg`) |
| `JWT_SECRET` | Secreto para firmar JWTs en desarrollo |
| `FIREBASE_AUTH_ENABLED` | `true` para activar Firebase Auth en producción |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` | Config del SDK de cliente (frontend) |
| `VITE_FIREBASE_AUTH_ENABLED` | `true` para que el frontend use el SDK de Firebase Auth |

### Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | `{ email, password }` → `{ token, user }` (JWT en dev, custom token con Firebase) |
| GET | `/api/auth/verify` | Verifica `Authorization: Bearer <token>` → `{ valid, user }` |

### Rutas protegidas

`/api/entries/all`, `PATCH /api/entries/:id/status`, `DELETE /api/entries/:id` y el borrado de comentarios aceptan:
- `Authorization: Bearer <JWT|ID token>` (recomendado), o
- `x-admin-password` (compatibilidad con modo desarrollo).

## 📦 Cómo Levantar el Proyecto

### 1. Instalar dependencias

```bash
npm install
```

### 2. Iniciar el backend

```bash
npm start
# o con recarga automática en desarrollo:
npm run dev
```

El servidor estará disponible en `http://localhost:4000`.

### 3. Iniciar el frontend (Vite)

```bash
npm run client:dev
```

La app React estará en `http://localhost:3000`. El proxy de Vite redirige `/api` al backend.

### 4. Build de producción

```bash
npm run client:build
```

## ✅ Probar el API

```bash
npm test
```

Esto arranca el servidor automáticamente, ejecuta las pruebas (entradas, reacciones, comentarios, favoritos, subida de imágenes, galería, moderación, seguridad) y lo detiene. Las entradas y archivos de prueba se limpian al final.

## 🔐 Panel de Administración

- Ruta: `#/admin`
- En desarrollo: contraseña por defecto `EMpaticos2025arg` (configurable con `ADMIN_PASSWORD`) o cualquier usuario marcado como admin en Firebase Auth en producción.
- En producción: login con email/password de Firebase Auth (requiere `VITE_FIREBASE_AUTH_ENABLED=true`).

El panel permite aprobar, despublicar y eliminar entradas, moderar comentarios y ver estadísticas de la comunidad.

## ☁️ Deploy en Vercel (frontend + API serverless)

El repo está preparado para subirse completo a Vercel:

- **Frontend**: build estático (`npm run client:build`, `outputDirectory: dist`). En producción el frontend llama a la misma URL (`/api`, ver `.env.production` → `VITE_API_URL=/api`).
- **Backend**: la app Express se expone como serverless function en `api/index.js` (rewrites `/api/*` → función). La data se lee de `data/db.json` si no hay Firestore (ver `functions.includeFiles` en `vercel.json`).

### Variables de entorno a configurar en Vercel

| Variable | Obligatoria | Notas |
|----------|-------------|-------|
| `VITE_API_URL` | ✅ (build) | `=/api` (ya en `.env.production`) |
| `FIREBASE_SERVICE_ACCOUNT` | ⚠️ recomendada | JSON de cuenta de servicio en base64 → Firestore persistente |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | ⚠️ recomendadas | Subidas de imágenes persistentes |
| `FIREBASE_AUTH_ENABLED` | ⚠️ recomendada | `true` para auth real con Firebase |
| `ADMIN_PASSWORD` / `JWT_SECRET` | para dev | Modo contraseña simple (no recomendado en prod) |

> ⚠️ Sin Firestore, las escrituras (comentarios, reacciones, favoritos) se guardan en el filesystem efímero del serverless y pueden perderse entre cold starts. Para producción real configurá Firestore y Cloudinary, migrá los datos (`server/migrate-firestore.js`) y creá el admin (`npm run create-admin`).

## 📝 Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + React Router DOM 6 + Vite |
| Backend | Express.js |
| Database | Firebase Firestore (producción) / JSON file (`data/db.json`) |
| Imágenes | Cloudinary (producción) / `uploads/` local |
| UI Framework | Bootstrap 5 |
| Fonts | Google Fonts (Inter) |
| Hosting | Vercel (frontend + API serverless) |

## 🆘 Troubleshooting

### Error: "No se pudo conectar al backend"

- ¿El servidor Node está corriendo en `localhost:4000`?
- ¿Ejecutaste `npm start` o `npm run dev`?
- Revisa la consola del navegador (F12) para errores de CORS

### Error: "Origen no permitido por CORS"

- En desarrollo el backend permite orígenes de `localhost:3000`, `localhost:4000` y `localhost:5173`.
- En producción se permiten todos los orígenes.

## 📬 Contacto

Email: matii.toorres.06@gmail.com
