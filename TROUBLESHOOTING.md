# Troubleshooting

## Problemas comunes y soluciones

### 1. Error: "MongoDB connection error"

**Síntomas:**
```
✗ Error conectando a MongoDB: MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Soluciones:**

**Opción A: MongoDB local**
```bash
# Instalar MongoDB (macOS con Homebrew)
brew install mongodb-community
brew services start mongodb-community

# O iniciar manualmente
mongod --dbpath /usr/local/var/mongodb
```

**Opción B: MongoDB Atlas (recomendado)**
1. Crear cuenta gratuita en https://www.mongodb.com/cloud/atlas
2. Crear cluster gratuito
3. Obtener connection string
4. Actualizar `backend/.env`:
```env
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/socialerp?retryWrites=true&w=majority
```

### 2. Error: "CORS error" en navegador

**Síntomas:**
```
Access to XMLHttpRequest at 'http://localhost:3000/api/empresa' from origin 'http://localhost:3001' has been blocked by CORS policy
```

**Solución:**
Verificar que en `backend/.env` esté configurado:
```env
CORS_ORIGIN=http://localhost:3001
```

Si usas un puerto diferente, actualízalo.

### 3. Error: "Token inválido" en admin

**Síntomas:**
```
401 Unauthorized - Token inválido
```

**Soluciones:**
1. Verificar credenciales en `backend/.env`:
```env
SUPERUSER_USERNAME=admin
SUPERUSER_PASSWORD=admin123
```

2. Limpiar localStorage del navegador:
```javascript
// En consola del navegador
localStorage.removeItem('adminToken')
```

3. Reiniciar sesión en `/login`

### 4. Error: "External API error" al registrar presencia

**Síntomas:**
```
Error al registrar presencia: Request failed with status code 401
```

**Soluciones:**
1. Verificar que el API externo esté accesible:
```bash
curl https://fc.socialerp.net:8443/apirest/admrest/serverinfo
```

2. Verificar configuración en `backend/.env`:
```env
API_DEFAULT_URL=https://fc.socialerp.net:8443
```

3. Si el API requiere autenticación diferente, modificar `backend/src/services/externalApiService.js`:
```javascript
headers: {
  'X-API-KEY': 'tu-clave-real',
  // o
  'Authorization': 'Bearer ' + token,
}
```

### 5. Error: "Port already in use"

**Síntomas:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluciones:**
1. Cambiar puerto en `backend/.env`:
```env
PORT=3002
```

2. O matar proceso usando el puerto:
```bash
# Encontrar proceso
lsof -i :3000

# Matar proceso (reemplaza PID)
kill -9 <PID>
```

### 6. Error: "React app not loading"

**Síntomas:**
```
Cannot GET /
```

**Soluciones:**
1. Verificar que el frontend esté corriendo:
```bash
cd frontend
npm start
```

2. Verificar que el proxy esté configurado en `frontend/package.json`:
```json
{
  "proxy": "http://localhost:3000"
}
```

3. Si cambiaste el puerto del backend, actualizar el proxy.

### 7. Error: "Module not found" en npm install

**Síntomas:**
```
npm ERR! code ENOENT
npm ERR! syscall spawn git
```

**Soluciones:**
1. Limpiar cache de npm:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

2. Verificar que git esté instalado:
```bash
git --version
```

### 8. Error: "Logs no aparecen en admin"

**Síntomas:**
```
No hay registros en la tabla de logs
```

**Soluciones:**
1. Verificar que MongoDB esté corriendo y conectado
2. Verificar que se hayan hecho requests (cada request se loguea automáticamente)
3. Consultar directamente en MongoDB:
```bash
mongosh
use socialerp
db.logs.find().limit(5)
```

### 9. Error: "Config no funciona"

**Síntomas:**
```
Siempre usa la configuración por defecto
```

**Soluciones:**
1. Para query param: `http://localhost:3001/?config=cliente1`
2. Para subdominio: `http://cliente1.localhost:3001/`
3. Verificar que esté definido en `backend/.env`:
```env
API_CONFIG_MAP={"default":"https://fc.socialerp.net:8443","cliente1":"https://api.cliente1.com"}
```

### 10. Error: "Build fails" en producción

**Síntomas:**
```
Failed to compile
```

**Soluciones:**
1. Limpiar build:
```bash
cd frontend
rm -rf build node_modules
npm install
npm run build
```

2. Verificar variables de entorno en producción:
```env
REACT_APP_API_URL=https://tu-backend.com/api
```

---

## Comandos útiles para debugging

### Backend
```bash
# Ver logs del servidor
cd backend
npm run dev

# Verificar conexión MongoDB
mongosh
use socialerp
db.logs.countDocuments()
```

### Frontend
```bash
# Ver logs del navegador
# Abre DevTools (F12) → Console

# Verificar API calls
# DevTools → Network → XHR
```

### MongoDB
```bash
# Conectar
mongosh

# Ver bases de datos
show dbs

# Usar base de datos
use socialerp

# Ver colecciones
show collections

# Ver logs recientes
db.logs.find().sort({timestamp: -1}).limit(10).pretty()

# Contar logs
db.logs.countDocuments()

# Filtrar por config
db.logs.find({configName: "default"}).pretty()

# Limpiar logs (cuidado!)
db.logs.deleteMany({})
```

### Sistema
```bash
# Ver procesos usando puertos
lsof -i :3000
lsof -i :3001

# Verificar Node.js
node --version
npm --version

# Verificar MongoDB
mongod --version
```

---

## Contacto y soporte

Si encuentras un problema no listado aquí:

1. Revisa los logs del backend (terminal donde corre `npm run dev`)
2. Revisa los logs del frontend (DevTools Console)
3. Consulta la documentación:
   - `DEVELOPMENT.md` - Guía para desarrolladores
   - `ARCHITECTURE.md` - Diagramas de flujo
4. Verifica que todas las variables de entorno estén configuradas correctamente

---

**Última actualización:** 10 de abril de 2026
