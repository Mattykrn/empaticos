# 🧡 Empáticos - Plataforma Comunitaria y Red de Apoyo

> **Proyecto Integrador Final Backend - Carrera Fullstack Web Developer**  
> Plataforma interactiva diseñada para la contención, acompañamiento e intercambio de historias, publicaciones comunitarias y mensajes de apoyo.

---

## 🚀 Tecnologías Principales

- **Frontend:** React, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Base de Datos:** MongoDB Atlas mediante ODM Mongoose.
- **Validación & Middlewares:** `express-validator`, Morgan, CORS, Middleware propio de auditoría.
- **Integraciones:** Axios / Fetch para consumo de APIs externas.

---

## 📋 Cumplimiento de Consignas del Examen Integrador

| # | Consigna | Implementación Técnica | Estado |
|---|---|---|:---:|
| **1** | **Base de Datos en Mongo Atlas** | Conexión remota mediante Mongoose (`src/config/db.js`) utilizando variables de entorno (`MONGO_URI`). | ✅ Aprobado |
| **2** | **Servidor Node & Métodos HTTP** | Endpoints REST estructurados bajo el estándar HTTP (`GET`, `POST`, `PUT`, `DELETE`) con respuestas JSON semánticas (200, 201, 400, 404, 500). | ✅ Aprobado |
| **3** | **Esquema Propio y Original** | Modelos Mongoose (`Publication.js`, `Story.js`, `Reaction.js`) con tipado estricto, enums, índices compuestos y timestamps. | ✅ Aprobado |
| **4** | **Validación con express-validator** | Validación de parámetros (`isMongoId`) y cuerpo de peticiones (`body`) con middleware centralizado `validateRequest`. | ✅ Aprobado |
| **5** | **Middleware Propio** | `auditLogger.js`: middleware personalizado de registro y auditoría de peticiones HTTP en tiempo real con marcas temporales. | ✅ Aprobado |
| **6** | **Consumo de API Externa** | Endpoint `/api/external/quote` que consume una API pública externa para brindar frases y recursos inspiradores. | ✅ Aprobado |

---

## 📚 Documentación de la API

### 🐾 Publicaciones (`/api/publications`)
- `GET /api/publications` - Obtener todas las publicaciones activas.
- `GET /api/publications/:id` - Obtener publicación específica por ID (valida MongoID).
- `POST /api/publications` - Crear una nueva publicación (valida campos obligatorios con `express-validator`).
- `PUT /api/publications/:id` - Actualizar publicación por ID.
- `DELETE /api/publications/:id` - Eliminar publicación por ID.

### 📖 Historias (`/api/stories`)
- `GET /api/stories` - Listar historias activas en orden cronológico.
- `POST /api/stories` - Crear una nueva historia con persistencia en MongoDB y TTL.

### 💬 Reacciones (`/api/reactions`)
- `GET /api/reactions/:targetId` - Obtener conteo y desglose de reacciones por elemento.
- `POST /api/reactions` - Alternar reacción (*toggle*): agrega, cambia tipo o elimina si se repite.

### 🌐 API Externa (`/api/external`)
- `GET /api/external/quote` - Consulta a servicio público externo con transformación de respuesta.

---

## 🛠️ Instalación y Ejecución Local

### 1. Clonar el repositorio
```bash
git clone [https://github.com/Mattykrn/empaticos.git](https://github.com/Mattykrn/empaticos.git)
cd empaticos