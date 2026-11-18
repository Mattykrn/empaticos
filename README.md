# Empáticos — Comunidad de Apoyo en Esclerosis Múltiple

Plataforma comunitaria e informativa para personas que conviven con Esclerosis Múltiple (EM), familiares, acompañantes y profesionales de la salud. Empáticos combina testimonios reales, anécdotas, divulgación científica de fuentes oficiales y adaptaciones de accesibilidad pensadas para fatiga visual, neuritis óptica, dificultades motoras y sobrecarga cognitiva.

## Misión

Reducir la sensación de aislamiento de quienes conviven con EM, facilitar el intercambio de experiencias y acercar información clara sobre avances, tratamientos y bienestar. El proyecto prioriza un espacio seguro, respetuoso y navegable con teclado, lectores de pantalla y síntesis de voz.

Identidad visual: el logotipo oficial se encuentra en `public/images/LogoEMpaticos2.png` y se copia en `frontend/public/images/` para que Vite lo incluya en el build. El encabezado usa ese archivo junto con la paleta cálida ámbar/naranja de la marca.

## Stack tecnológico

- React 18 y Vite 5 para la interfaz de usuario.
- Tailwind CSS 4 con `@tailwindcss/vite` para estilos utilitarios.
- Firebase Authentication con Google y Cloud Firestore para identidad y reacciones/comentarios.
- Axios para consumir la API REST de Express + Mongoose sobre MongoDB Atlas.
- Vercel para el despliegue continuo del frontend.

Nota de integración: en el repositorio no hay configuración de Supabase ni de FormSubmit. Las integraciones activas son Firebase/Firestore y la API Express/MongoDB descrita más abajo. La documentación refleja el código real para evitar supuestos de configuración.

## Arquitectura

```text
empaticos-master/
├── frontend/
│   ├── public/images/LogoEMpaticos2.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── AccessibilityToolbar.jsx
│   │   │   ├── ModalUnirme.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── TarjetaPublicacion.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SpeechContext.jsx
│   │   ├── config/firebase.js
│   │   ├── services/api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   └── vercel.json
├── backend/                 API Express, modelos y validadores
├── public/images/           Logotipo original de la marca
├── src/                     Servidor Express alternativo del monorepo
└── vercel.json              Configuración de build y rewrites en Vercel
```

La UI es una SPA con navegación por secciones controlada por estado (`inicio`, `historias`, `anecdotas`, `noticias`, `nosotros`). El contenido de noticias es estático y verificable, con enlaces a organismos oficiales. Las historias se cargan desde la API con un conjunto local de respaldo para que la comunidad nunca quede sin contenido.

## Puesta en marcha

Requisitos: Node.js 18 o superior y npm.

```bash
npm install
npm run frontend:dev
```

Para construir el frontend:

```bash
cd frontend
npm install
npm run build
```

También podés ejecutar solo el frontend con `npm run dev` dentro de `frontend/`, y la API con `npm run backend:dev` desde la raíz.

## Variables de entorno

Frontend (`frontend/.env.local`):

```text
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Backend (raíz del proyecto):

```text
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/empaticos_db?retryWrites=true&w=majority
```

Nunca subas archivos `.env` con credenciales reales al repositorio.

## Accesibilidad implementada

La interfaz busca cumplir WCAG 2.2 nivel AAA en los flujos principales, con foco especial en neurodiversidad y EM.

### Panel de accesibilidad integral

`AccessibilityToolbar.jsx` está disponible en todas las vistas desde el botón flotante «Accesibilidad» y persiste las preferencias en `localStorage` bajo la clave `empaticos-accesibilidad-v1`.

- Tamaño de texto: Normal 100%, Grande 115% y Extra Grande 130%. La escala se aplica modificando `font-size` del elemento `html`, de modo que las unidades `rem` de Tailwind escalen de forma consistente.
- Alto contraste / cuidado ocular: reemplaza fondos claros y degradados por tonos ámbar oscuros cálidos, evita el blanco puro, refuerza bordes y aumenta el contraste de enlaces y controles.
- Espaciado de lectura: incrementa `line-height` y `letter-spacing` en párrafos, listas, etiquetas, citas y controles para reducir fatiga cognitiva.
- Sin animaciones: desactiva transiciones y animaciones CSS. Además, el modo se activa automáticamente cuando el sistema opera con `prefers-reduced-motion: reduce`.
- Leer en voz alta: usa `window.speechSynthesis` con prioridad `es-AR`, luego `es-ES` y finalmente cualquier voz española. Permite reproducir, pausar, continuar y detener la lectura del contenido principal (`#main-content`).

El panel es un `dialog` no modal con `aria-labelledby`, atrapa el foco con `Tab`/`Shift+Tab`, se cierra con `Escape` y devuelve el foco al botón que lo abrió. Todos sus controles son botones reales con `aria-pressed` y estados deshabilitados comprensibles.

### Motor y teclado

- Enlace «Saltar al contenido principal» como primer elemento del documento, dirigido a `<main id="main-content">` con `tabIndex={-1}`.
- Área interactiva mínima de 48 × 48 px para botones, enlaces en línea/flex, selects, inputs y textareas.
- Indicador de foco visible de 3 px con offset en todos los controles interactivos.
- Cierre por `Escape` en el panel de accesibilidad y en los diálogos de acceso y edición.
- Botones de navegación con `aria-pressed`, diálogos con `role="dialog"` y `aria-modal`, etiquetas vinculadas mediante `htmlFor`, y `aria-live="polite"` para mensajes de estado y estado de voz.

### Semántica y contenido

- Estructura jerárquica: `header`, `nav`, `main`, `section`, `article` y `footer`.
- Un único `h1` descriptivo en el Hero; `h2` para secciones y `h3`/`h4` para tarjetas y publicaciones.
- `alt` descriptivo en el logotipo, avatares y todas las imágenes de noticias.
- `aria-label` en acciones con iconos, enlaces externos y controles de reacciones.

### Noticias y avances globales en EM

La sección «Noticias y Avances Globales en EM» incluye filtros por `Investigación`, `Tratamientos`, `Bienestar` y `Comunidad`, siempre con la opción `Todas`. Cada tarjeta muestra fecha, indicador de tiempo de lectura, resumen, cita de fuente oficial en `<cite>` y enlace al organismo correspondiente. Además, cada noticia tiene su propio botón «Escuchar» que utiliza el mismo proveedor de síntesis de voz que el panel de accesibilidad.

Fuentes utilizadas: ECTRIMS, NMSS Research, Multiple Sclerosis Journal, NIH/PubMed, EMSP y MSIF.

## Despliegue

El archivo `vercel.json` de la raíz define:

- `buildCommand`: `cd frontend && npm install && npm run build`
- `outputDirectory`: `frontend/dist`
- Rewrites de SPA hacia `/index.html`
- `Cache-Control: no-cache, no-store, must-revalidate` para `index.html`

## Verificación

```bash
cd frontend && npm run build
```

El build debe finalizar sin errores. No hay scripts de lint o typecheck configurados en este repositorio.
