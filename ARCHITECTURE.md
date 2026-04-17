# Arquitectura y Flujos

## 🏗️ Arquitectura general

```
┌─────────────────────────────────────────────────────────────────┐
│                         USUARIO FINAL                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ NAVEGADOR
                         │
         ┌───────────────▼──────────────────┐
         │                                  │
         │      FRONTEND - REACT            │
         │                                  │
         │  ├─ RelojPage (/)               │
         │  ├─ LoginPage (/login)          │
         │  └─ AdminPage (/admin)          │
         │                                  │
         │  Services:                       │
         │  └─ api.js (axios calls)        │
         │                                  │
         └───────────────┬──────────────────┘
                         │
                         │ HTTP/REST
         ┌───────────────▼──────────────────────────┐
         │                                          │
         │      BACKEND - NODE.JS/EXPRESS           │
         │                                          │
         │  ├─ Rutas públicas                      │
         │  │  ├─ GET /api/empresa                │
         │  │  ├─ POST /api/control-presencia    │
         │  │  └─ GET /api/server-info           │
         │  │                                      │
         │  ├─ Rutas protegidas (JWT)             │
         │  │  ├─ POST /api/auth/login           │
         │  │  └─ GET /api/auth/logs             │
         │  │                                      │
         │  ├─ Middleware                         │
         │  │  ├─ logRequest (logging)           │
         │  │  └─ authMiddleware (JWT)           │
         │  │                                      │
         │  └─ Services                           │
         │     ├─ configResolver                  │
         │     ├─ externalApiService             │
         │     └─ loggingService                 │
         │                                          │
         └───────┬───────────────┬────────────────┘
                 │               │
    ┌────────────▼────┐  ┌──────▼────────────────┐
    │                 │  │                      │
    │  API EXTERNO    │  │  MONGODB             │
    │  (SocialERP)    │  │                      │
    │                 │  │  Collections:        │
    │ POST /apirest/  │  │  └─ logs            │
    │ controlpresencia│  │                      │
    │                 │  │  Registra:          │
    │ GET /apirest/   │  │  ├─ Requests        │
    │ admrest         │  │  ├─ Responses       │
    │                 │  │  ├─ Errors          │
    │                 │  │  └─ Auditoría       │
    └─────────────────┘  └──────────────────────┘
```

## 🔄 Flujo 1: Registrar Presencia

```
1. USUARIO EN FRONTEND
   └─► Introduce código de empleado: "E001"
       Presiona botón "Entrada"
       
2. FRONTEND REACT
   └─► RelojPage.handlePresencia('entrada')
       └─► apiService.submitPresencia(payload)
           └─► POST /api/control-presencia
               {
                 "Funcion": "CrearParte",
                 "Tipo": "entrada",
                 "UUIDCentral": "...",
                 "ClaveEmpleado": "E001",
                 "GPS": "n/d",
                 "userAgent": "Mozilla/...",
                 "Hora": "2024-01-01T10:30:00Z"
               }

3. BACKEND - EXPRESS
   └─► POST /api/control-presencia
       ├─► Middleware logRequest captura request
       │
       ├─► Middleware configResolver
       │   └─► req.configName = "default"
       │
       ├─► Controller presenciaController.registrarPresencia()
       │   └─► req.configName = "default"
       │       apiUrl = "https://fc.socialerp.net:8443"
       │
       └─► Service externalApiService.callExternalApi()
           └─► POST https://fc.socialerp.net:8443/apirest/controlpresencia
               {payload}

4. API EXTERNO (SocialERP)
   └─► Procesa la petición
       └─► Responde con resultado
           {
             "status": "ok",
             "message": "Parte registrado",
             "data": {...}
           }

5. BACKEND - LOGGING
   └─► Middleware logRequest guarda en MongoDB
       {
         "route": "POST /api/control-presencia",
         "configName": "default",
         "externalApiUrl": "https://fc.socialerp.net:8443",
         "statusCode": 200,
         "requestBody": {...},
         "responseBody": {...},
         "timestamp": "2024-01-01T10:30:00Z"
       }

6. BACKEND - RESPONSE
   └─► Devuelve respuesta al frontend
       {
         "status": "ok",
         "message": "Parte registrado"
       }

7. FRONTEND
   └─► RelojPage recibe respuesta
       └─► Actualiza estado
           └─► Muestra mensaje: "✓ entrada: Parte registrado"
               Limpia campo de código
```

## 🔄 Flujo 2: Ver Logs (Superusuario)

```
1. USUARIO ADMIN
   └─► Abre http://localhost:3001/login
       Ingresa: admin / admin123

2. FRONTEND - LOGIN
   └─► LoginPage.handleLogin()
       └─► apiService.login("admin", "admin123")
           └─► POST /api/auth/login

3. BACKEND - LOGIN
   └─► POST /api/auth/login
       ├─► Valida credenciales
       │   └─► admin === admin ✓
       │   └─► admin123 === admin123 ✓
       └─► Genera JWT
           {
             "status": "ok",
             "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
           }

4. FRONTEND - ALMACENA TOKEN
   └─► localStorage.setItem('adminToken', token)

5. USUARIO NAVEGA A /admin
   └─► AdminPage monta
       └─► useEffect llama loadLogs()
           └─► apiService.fetchLogs()
               └─► GET /api/auth/logs
                   Headers: Authorization: Bearer <TOKEN>

6. BACKEND - LOGS PROTEGIDO
   └─► GET /api/auth/logs
       ├─► Middleware authMiddleware
       │   ├─► Extrae token del header
       │   ├─► Valida JWT
       │   └─► req.user = {username: "admin", role: "superuser"}
       │
       └─► Controller logsController.getEventLogs()
           └─► Service loggingService.getLogs()
               └─► MongoDB query
                   db.logs.find()
                   .sort({timestamp: -1})
                   .limit(50)

7. MONGODB
   └─► Devuelve últimos 50 logs
       [
         {
           _id: ObjectId(...),
           timestamp: "2024-01-01T10:30:00Z",
           route: "POST /api/control-presencia",
           configName: "default",
           statusCode: 200,
           ...
         },
         ...
       ]

8. FRONTEND - ADMIN PAGE
   └─► AdminPage recibe logs
       └─► Renderiza tabla
           ├─ Timestamp
           ├─ Ruta
           ├─ Config
           ├─ Método
           ├─ Status
           └─ IP
```

## 🎯 Flujo 3: Resolución de Configuración Multi-cliente

```
OPCIÓN A: Query Parameter
──────────────────────────

URL: http://localhost:3001/?config=cliente1

┌─────────────────────┐
│ Frontend request    │
│ query: {"config":   │
│ "cliente1"}         │
└──────────┬──────────┘
           │
    POST /api/control-presencia?config=cliente1
           │
┌──────────▼──────────────────────────────────┐
│ Backend - configResolver.getConfigNameFromRequest() │
│ ├─ Busca en req.query.config               │
│ ├─ Obtiene: "cliente1"                    │
│ └─ Busca en API_CONFIG_MAP                │
│    {"default": "...", "cliente1": "..."}   │
└──────────┬──────────────────────────────────┘
           │
    configName = "cliente1"
    apiUrl = "https://api.cliente1.com"
           │
┌──────────▼──────────────────────────────────┐
│ callExternalApi(                             │
│   "https://api.cliente1.com",               │
│   "/apirest/controlpresencia",              │
│   "POST",                                    │
│   payload                                   │
│ )                                           │
└─────────────────────────────────────────────┘


OPCIÓN B: Subdominio
────────────────────

URL: http://cliente1.localhost:3001/

┌──────────────────────────┐
│ Frontend request         │
│ Host: cliente1.localhost │
└──────────┬───────────────┘
           │
    POST /api/control-presencia
           │
┌──────────▼──────────────────────────────────┐
│ Backend - configResolver.getConfigNameFromRequest() │
│ ├─ Extrae host: "cliente1.localhost"       │
│ ├─ Divide por ".": ["cliente1", "localhost"]│
│ ├─ Subdominio: "cliente1"                  │
│ └─ Busca en API_CONFIG_MAP                │
└──────────┬──────────────────────────────────┘
           │
    configName = "cliente1"
    apiUrl = "https://api.cliente1.com"
```

## 📊 Estructura de datos MongoDB

### Colección: logs

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "timestamp": ISODate("2024-01-10T10:30:00.000Z"),
  "createdAt": ISODate("2024-01-10T10:30:00.000Z"),
  "updatedAt": ISODate("2024-01-10T10:30:00.000Z"),
  
  // Información de la request
  "route": "POST /api/control-presencia",
  "method": "POST",
  "configName": "default",
  
  // Integración externa
  "externalApiUrl": "https://fc.socialerp.net:8443",
  
  // Datos enviados/recibidos
  "requestBody": {
    "Funcion": "CrearParte",
    "Tipo": "entrada",
    "UUIDCentral": "3-DFECFF7FCE50474EB27D0A2003AD58A9",
    "ClaveEmpleado": "E001",
    "GPS": "40.4168, -3.7038",
    "userAgent": "Mozilla/5.0...",
    "Hora": "2024-01-10T10:30:00Z"
  },
  
  "responseBody": {
    "status": "ok",
    "message": "Parte registrado",
    "data": {
      "id": "...",
      "timestamp": "..."
    }
  },
  
  // Metadata de la conexión
  "statusCode": 200,
  "userAgent": "Mozilla/5.0...",
  "ip": "127.0.0.1",
  "username": null,      // null si request pública, "admin" si autenticada
  "error": null          // null si OK, descripción del error si falla
}
```

## 🔐 Flujo de seguridad con JWT

```
LOGIN
────

POST /api/auth/login
{username: "admin", password: "admin123"}
       │
       ├─► Backend valida credenciales
       │   ├─ Compara con SUPERUSER_USERNAME
       │   └─ Compara con SUPERUSER_PASSWORD
       │
       └─► Si valida:
           └─► jwt.sign({username, role}, JWT_SECRET, {expiresIn: '24h'})
               └─► Token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."


ACCESO A RUTA PROTEGIDA
──────────────────────

GET /api/auth/logs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
       │
       └─► Middleware authMiddleware
           ├─ Extrae token del header
           ├─ Valida JWT con JWT_SECRET
           ├─ Si es válido: next()
           └─ Si no: return 401 Unauthorized


LOGOUT
──────

Cliente:
localStorage.removeItem('adminToken')
       │
       └─► Token descartado
           └─► Próximas requests sin Authorization header
               └─► 401 Unauthorized
```

## 🚦 Estados y transiciones de la UI

```
STATE DIAGRAM - RelojPage

    ┌─────────────────────────┐
    │   ESTADO INICIAL        │
    │ - Empresa: null         │
    │ - Loading: true         │
    │ - Mensaje: ""           │
    └────────────┬────────────┘
                 │
         Carga datos de empresa
                 │
    ┌────────────▼────────────┐
    │   LISTO PARA USAR       │
    │ - Empresa: {...}        │
    │ - Loading: false        │
    │ - Mensaje: ""           │
    └────────────┬────────────┘
                 │
         Usuario ingresa código
                 │
    ┌────────────▼────────────┐
    │   PROCESANDO            │
    │ - Loading: true         │
    │ - Botones: disabled     │
    └────────────┬────────────┘
                 │
      ┌──────────┴──────────┐
      │                     │
      ▼                     ▼
   ERROR                  ÉXITO
   ├─ Estado:error        ├─ Mensaje: "" (vacío)
   ├─ Error: "msg"        ├─ Código: (vacío)
   │ └─━─ 3s después      │ └─━─ Listo de nuevo
   │    vuelve a LISTO         vuelve a LISTO
   │
   └─► ESTADO INICIAL
```

---

**Diagrama actualizado:** 10 de abril de 2026
