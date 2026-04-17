# Guía de inicio rápido

## Instalación rápida (5 minutos)

### 1. Asegurate de tener MongoDB corriendo

```bash
# Opción A: MongoDB local
mongod

# Opción B: MongoDB Atlas (crear cluster gratuito en https://www.mongodb.com/cloud/atlas)
# y actualizar MONGODB_URI en backend/.env
```

### 2. Instala el backend

```bash
cd backend
npm install
npm run dev
```

Verás: `✓ Backend escuchando en puerto 3000`

### 3. En otra terminal, instala el frontend

```bash
cd frontend
npm install
npm start
```

Se abrirá automáticamente `http://localhost:3001`

## Prueba rápida

### Control de presencia (pantalla principal)

1. Introduce código de empleado (ej: `E001`)
2. Presiona uno de los botones
3. Verás el resultado en la interfaz

### Panel de administración

1. Abre `http://localhost:3001/login`
2. Ingresa: `admin` / `admin123`
3. Verás todos los eventos registrados en MongoDB

## Troubleshooting

### Error: "MongoDB conectado"

- Verifica que MongoDB está corriendo: `mongo` o `mongosh`
- O usa MongoDB Atlas y actualiza `MONGODB_URI` en `.env`

### Error: CORS blo

- Verifica que `CORS_ORIGIN` en backend `.env` apunta a `http://localhost:3001`

### Errores del API externo

- Comprueba que la URL en `API_DEFAULT_URL` es accesible
- Los logs en MongoDB registrarán el error exacto

## Comandos útiles

### Backend

```bash
cd backend

npm run dev       # Iniciar con nodemon (recargar automático)
npm start         # Iniciar en producción
npm install       # Instalar dependencias
```

### Frontend

```bash
cd frontend

npm start         # Iniciar servidor de desarrollo
npm build         # Compilar para producción
npm test          # Ejecutar tests
```

### MongoDB

```bash
# Ver bases de datos
show dbs

# Usar base de datos
use socialerp

# Ver colecciones
show collections

# Ver logs recientes
db.logs.find().limit(5).sort({timestamp: -1})
```

## Variables de entorno importantes

### Backend (backend/.env)

```env
# La URL del API externo debe ser accesible desde tu máquina
API_DEFAULT_URL=https://fc.socialerp.net:8443

# Cambia credenciales de superusuario por seguridad
SUPERUSER_USERNAME=admin
SUPERUSER_PASSWORD=admin123
```

## Estructura de una petición

1. **Frontend** → Usuario escribe código de empleado y presiona botón
2. **React** → Prepara payload y envía `POST /api/control-presencia`
3. **Backend** → Resuelve config (subdominio o query param)
4. **Backend** → Reenvía a API externo (ej: `https://fc.socialerp.net:8443/apirest/controlpresencia`)
5. **Backend** → Registra evento en MongoDB
6. **Backend** → Devuelve respuesta a frontend
7. **Frontend** → Muestra resultado al usuario

## Integración con tu API

Si quieres cambiar el API externo:

1. Edita `backend/.env`:
   ```env
   API_DEFAULT_URL=https://tu-api.com
   ```

2. Si necesitas autenticación diferente, edita `backend/src/services/externalApiService.js`:
   ```javascript
   headers: {
     'X-API-KEY': 'tu-clave',
     // o
     'Authorization': 'Bearer ' + token,
   }
   ```

3. Reinicia el backend: `npm run dev`

## Soporte

- Revisa los **logs en MongoDB** para errores:
  - Panel admin: `http://localhost:3001/admin`
  - Terminal backend: stdout de Express
  - MongoDB: `db.logs.find().pretty()`

---

¡Listo! Ahora tienes el proyecto corriendo localmente.
