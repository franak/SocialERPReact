# Guía de desarrollo

## Estructura del Backend

### Carpetas principales

- **`src/server.js`** — Punto de entrada, configuración de Express y MongoDB
- **`src/config/index.js`** — Variables de entorno y configuración global
- **`src/routes/`** — Definición de rutas Express
  - `api.js` — Rutas públicas (/api/empresa, /api/control-presencia, etc.)
  - `auth.js` — Rutas de autenticación (/api/auth/login, /api/auth/logs)
- **`src/controllers/`** — Lógica de negocios por ruta
  - `empresaController.js` — Manejo de `/api/empresa` y `/api/server-info`
  - `presenciaController.js` — Manejo de `/api/control-presencia`
  - `authController.js` — Manejo de `/api/auth/login`
  - `logsController.js` — Manejo de `/api/auth/logs`
- **`src/services/`** — Servicios reutilizables
  - `configResolver.js` — Resuelve API URL por config/subdominio
  - `externalApiService.js` — Proxy al API externo
  - `loggingService.js` — Crear y leer logs en MongoDB
- **`src/middleware/`** — Middleware de Express
  - `logRequest.js` — Registra cada request/response en MongoDB
  - `authMiddleware.js` — Protege rutas con JWT
- **`src/models/`** — Esquemas Mongoose
  - `Log.js` — Estructura de registros de eventos

### Flujo típico de una petición

1. **Request llega a Express** → se ejecutan middlewares globales (CORS, JSON parsing, logging)
2. **Middleware `logRequest`** → captura datos de la petición
3. **Router** → busca la ruta coincidente en `src/routes/`
4. **Middleware de config** → resuelve `configName` y URL del API externo
5. **Controller** → ejecuta la lógica (llamada a servicio externo)
6. **Response** → se devuelve al cliente
7. **Middleware `logRequest`** → guarda el evento en MongoDB

### Agregar un nuevo endpoint

**Ejemplo: Crear `GET /api/test`**

1. **Crea controlador** en `src/controllers/testController.js`:

   ```javascript
   const getTest = async (req, res) => {
     try {
       return res.status(200).json({ msg: 'Test OK' });
     } catch (error) {
       return res.status(500).json({ error: error.message });
     }
   };
   
   module.exports = { getTest };
   ```

2. **Agrega ruta** en `src/routes/api.js`:

   ```javascript
   const { getTest } = require('../controllers/testController');
   router.get('/test', getTest);
   ```

3. **Prueba**: `curl http://localhost:3000/api/test`

## Estructura del Frontend

### Carpetas principales

- **`public/`** — Archivos estáticos (index.html)
- **`src/`** — Código fuente
  - `App.js` — Componente raíz, rutas principales
  - `index.js` — Punto de entrada React
  - **`pages/`** — Componentes de página (pantallas completas)
    - `RelojPage.js` — Control de presencia
    - `LoginPage.js` — Login de superusuario
    - `AdminPage.js` — Visor de logs
  - **`services/`** — Servicios (llamadas HTTP)
    - `api.js` — Cliente Axios, funciones para cada endpoint
  - **`styles/`** — Archivos CSS
    - `index.css` — Global
    - `RelojPage.css` — Estilos del reloj
    - `LoginPage.css` — Estilos del login
    - `AdminPage.css` — Estilos del admin

### Flujo de datos

1. **Componente monta** → `useEffect` ejecuta lógica inicial
2. **Usuario interactúa** → evento (click, input)
3. **Handler ejecuta** → llama a `apiService.submitPresencia()` etc.
4. **Axios hace request** → `POST /api/control-presencia`
5. **Backend procesa** → llama API externo, loguea
6. **Response devuelve** → componente actualiza estado
7. **Componente re-renderiza** → muestra resultado

### Agregar un nuevo componente

**Ejemplo: Crear nueva página `/hello`**

1. **Crea componente** en `src/pages/HelloPage.js`:

   ```javascript
   export default function HelloPage() {
     return <div><h1>Hola</h1></div>;
   }
   ```

2. **Añade ruta** en `App.js`:

   ```javascript
   import HelloPage from './pages/HelloPage';
   
   <Route path="/hello" element={<HelloPage />} />
   ```

3. **Accede**: `http://localhost:3001/hello`

## Testing local

### Probar backend con curl

```bash
# GET empresa
curl http://localhost:3000/api/empresa

# POST presencia
curl -X POST http://localhost:3000/api/control-presencia \
  -H "Content-Type: application/json" \
  -d '{
    "Funcion":"CrearParte",
    "Tipo":"entrada",
    "UUIDCentral":"test",
    "ClaveEmpleado":"E001",
    "userAgent":"curl",
    "Hora":"2024-01-01T10:00:00Z"
  }'

# LOGIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# LOGS (con token)
curl http://localhost:3000/api/auth/logs \
  -H "Authorization: Bearer <TOKEN>"
```

### Consultar MongoDB

```bash
# Conectar
mongosh

# Ver base de datos
use socialerp

# Ver logs últimos 5
db.logs.find().sort({ timestamp: -1 }).limit(5).pretty()

# Contar logs
db.logs.countDocuments()

# Filtrar por config
db.logs.find({ configName: "default" }).pretty()
```

## Debugging

### Logs en terminal backend

- Todos los logs van a stdout
- Usa `console.log()`, `console.error()` en código
- Con `nodemon`, verás cambios automáticos

### Logs en MongoDB

- Cada request/response se registra automáticamente
- Accede vía panel admin (`http://localhost:3001/admin`)
- O consulta directamente en MongoDB

### React DevTools

- Instala extensión en navegador
- Inspecciona componentes, props, estado
- Pestaña "Console" para errores

## Variables de entorno por entorno

### Desarrollo

```env
NODE_ENV=development
API_DEFAULT_URL=https://test-api.example.com
CORS_ORIGIN=http://localhost:3001
```

### Producción

```env
NODE_ENV=production
API_DEFAULT_URL=https://api.example.com
CORS_ORIGIN=https://app.example.com
JWT_SECRET=<> # cambiar por valor seguro
```

## Próximas funcionalidades

- [ ] Integrar geolocalización real en frontend
- [ ] Validación más estricta de inputs
- [ ] Caché de datos de empresa
- [ ] Compresión de respuestas
- [ ] Rate limiting en backend
- [ ] Tests automatizados
- [ ] CI/CD pipeline
- [ ] Documentación Swagger
