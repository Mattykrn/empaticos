# Guía de inicio para Empaticos con SQLite

## 📋 Requisitos previos

- Node.js instalado en tu computadora
- npm (gestor de paquetes de Node.js)

## 🚀 Pasos para ejecutar el servidor

### 1. Abrir una terminal en la carpeta del proyecto

```bash
cd /home/mati/Descargas/empaticos-master\ \(1\)/empaticos-master
```

### 2. Instalar dependencias (si no se hizo ya)

```bash
npm install
```

### 3. Ejecutar el servidor

```bash
npm start
```

O si quieres usar nodemon (recarga automática):

```bash
npm run dev
```

### 4. Verificar que el servidor está corriendo

El servidor debería mostrar en la terminal:
```
Servidor ejecutándose en http://localhost:3000
```

## 📁 Estructura de archivos

- `server.js` - Servidor Node.js con Express
- `js/main.js` - Código del frontend actualizado
- `index.html` - Página principal
- `uploads/` - Carpeta donde se guardan las fotos (se crea automáticamente)
- `testimonios.db` - Base de datos SQLite (se crea automáticamente)
- `package.json` - Dependencias del proyecto

## 🎯 Cómo funciona

1. **Cuando el usuario carga la página**:
   - Se carga el formulario para compartir testimonios
   - Se cargan automáticamente todos los testimonios guardados de la base de datos
   - Se muestran en el mapa con marcadores

2. **Cuando el usuario envía un testimonio**:
   - El formulario envía los datos (nombre, testimonio, ubicación) y la foto al servidor
   - La foto se guarda en la carpeta `uploads/`
   - Los datos se guardan en la base de datos SQLite
   - El mapa se actualiza automáticamente con el nuevo marcador
   - El testimonio se muestra en la lista

3. **Base de datos**:
   - Todos los testimonios se guardan en `testimonios.db`
   - La URL de la foto se guarda junto con los datos del testimonio

## 🔧 Rutas del servidor

- `POST /api/testimonios` - Guardar un nuevo testimonio con foto
- `GET /api/testimonios` - Obtener todos los testimonios
- `GET /api/testimonios/:id` - Obtener un testimonio específico
- `DELETE /api/testimonios/:id` - Eliminar un testimonio
- `GET /uploads/:filename` - Acceder a las fotos guardadas

## ⚠️ Importante

- El servidor debe estar corriendo en todo momento para que funcione la aplicación
- Asegúrate de que el puerto 3000 esté disponible
- Las fotos se guardan localmente en la carpeta `uploads/`

## 🎓 Para Vercel (despliegue)

Para desplegar en Vercel, necesitarás hacer algunos cambios adicionales porque Vercel no soporta almacenamiento local persistente de archivos. Te asesoraré cuando sea necesario.

---

¡Ahora puedes ejecutar `npm start` para poner el servidor en funcionamiento! 🎉
