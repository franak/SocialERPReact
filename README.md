# SocialERP - Control de Presencia (Fullstack Node.js + React)

Aplicación de control de presencia con backend Node.js/Express y frontend React. Integración con API externa configurable por cliente.

## Arquitectura

```
SocialERPWeb/
├── backend/                    # Backend Node.js/Express
│   ├── src/
│   │   ├── server.js          # Punto de entrada
│   │   ├── config/            # Configuración
│   │   ├── controllers/       # Controladores de rutas
│   │   ├── middleware/        # Middleware (logging, auth)
│   │   ├── models/            # Esquemas de MongoDB
│   │   ├── routes/            # Rutas Express
│   │   └── services/          # Servicios (API externo, logs)
│   ├── package.json
│   ├── .env
│   └── .gitignore
├── frontend/                  # Frontend React
│   ├── src/
│   │   ├── pages/            # Componentes de página
│   │   ├── components/       # Componentes reutilizables
│   │   ├── services/         # API client
│   │   ├── styles/           # Estilos CSS
│   │   ├── App.js            # Componente raíz
│   │   └── index.js          # Punto de entrada
│   ├── public/
│   ├── package.json
│   └── .gitignore
└── README.md
```

## Requisitos previos

- Node.js 14+ 
- npm o yarn
- MongoDB local o MongoDB Atlas

## Instalación

### Backend

```bash
cd backend
npm install
```

Configura las variables de entorno en `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/socialerp
API_DEFAULT_URL=https://fc.socialerp.net:8443
API_CONFIG_MAP={"default":"https://fc.socialerp.net:8443","cliente1":"https://api.cliente1.com"}
SUPERUSER_USERNAME=admin
SUPERUSER_PASSWORD=admin123
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3001
```

Inicia el backend:

```bash
npm run dev       # Desarrollo con nodemon
npm start         # Producción
```

El backend estará disponible en `http://localhost:3000`.

### Frontend

```bash
cd frontend
npm install
```

Inicia el frontend:

```bash
npm start
```

La aplicación se abrirá en `http://localhost:3001`.

## Uso

### Control de Presencia

1. Abre `http://localhost:3001`
2. Introduce tu código de empleado
3. Presiona uno de los botones:
   - **Entrada**: Marca tu entrada
   - **Salida**: Marca tu salida
   - **Último parte**: Consulta tu registro anterior

### Panel de Administración

1. Abre `http://localhost:3001/login`
2. Ingresa credenciales (por defecto: `admin` / `admin123`)
3. Accede al panel en `/admin` para ver los registros de eventos en tiempo real

## API Endpoints

### Rutas públicas

- `GET /api/empresa` - Obtiene datos de la empresa
- `GET /api/server-info` - Obtiene info del servidor
- `POST /api/control-presencia` - Registra entrada/salida
- `POST /api/auth/login` - Login de superusuario

### Rutas protegidas

- `GET /api/auth/logs` - Obtiene registros de eventos (requiere autenticación)

## Configuración por cliente

La aplicación soporta múltiples clientes con diferentes APIs externas.

### Mediante parámetro query

```
http://localhost:3001/?config=cliente1
```

### Mediante subdominio

```
http://cliente1.localhost:3001/
```

La configuración se define en `.env`:

```env
API_CONFIG_MAP={"default":"...","cliente1":"...","cliente2":"..."}
```

## Características

✓ **Control de presencia**: Entrada, salida, último parte
✓ **Integración con API externo**: Proxy configurable
✓ **Logging de eventos**: Registra todas las interacciones en MongoDB
✓ **Panel de administración**: Visualización de logs con filtros
✓ **Autenticación superusuario**: JWT tokens
✓ **Multi-cliente**: Selección por query o subdominio
✓ **Responsive**: Funciona en desktop y móvil

## Tecnologías

**Backend:**
- Express.js
- MongoDB + Mongoose
- Axios (llamadas HTTP)
- JSON Web Tokens (JWT)

**Frontend:**
- React 18
- React Router
- Axios
- CSS Grid

## Variables de entorno

### Backend

| Variable           | Descripción                        | Valor por defecto                    |
| ------------------ | ---------------------------------- | ------------------------------------ |
| PORT               | Puerto del backend                 | 3000                                 |
| NODE_ENV           | Entorno (development/production)   | development                          |
| MONGODB_URI        | Conexión a MongoDB                 | mongodb://localhost:27017/socialerp  |
| API_DEFAULT_URL    | URL API externo por defecto        | https://fc.socialerp.net:8443        |
| API_CONFIG_MAP     | Mapa de configs de clientes (JSON) | {"default":"..."}                    |
| SUPERUSER_USERNAME | Username de superusuario           | admin                                |
| SUPERUSER_PASSWORD | Password de superusuario           | admin123                             |
| JWT_SECRET         | Clave secreta JWT                  | your-secret-key-change-in-production |
| CORS_ORIGIN        | Origen permitido CORS              | http://localhost:3001                |

### Frontend

| Variable          | Descripción           | Valor por defecto         |
| ----------------- | --------------------- | ------------------------- |
| REACT_APP_API_URL | URL de la API backend | http://localhost:3000/api |

## Estructura de logs en MongoDB

```javascript
{
  _id: ObjectId,
  timestamp: Date,
  route: String,              // "GET /api/empresa"
  method: String,             // "GET", "POST"
  configName: String,         // "default", "cliente1"
  externalApiUrl: String,     // URL del API externo usado
  requestBody: Object,        // Payload del request
  responseBody: Object,       // Respuesta
  statusCode: Number,         // 200, 400, 500, etc.
  userAgent: String,
  ip: String,
  username: String,           // Usuario (si autenticado)
  error: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Siguientes pasos

- [ ] Implementar geolocalización real en el frontend
- [ ] Añadir validaciones más estrictas en el backend
- [ ] Crear dashboard de estadísticas
- [ ] Implementar exportación de logs (CSV, PDF)
- [ ] Mejorar autenticación (OAuth2, LDAP)
- [ ] Tests automatizados (Jest, Supertest)
- [ ] Documentación de API (Swagger/OpenAPI)

## Licencia

Privada - Proyecto interno de SocialERP
