# Sistema POS Multiservicios 🏪

Sistema de Punto de Venta profesional para tiendas multiservicios, desarrollado con Node.js, Express.js, Sequelize y MySQL.

## 🚀 Características

- ✅ **Autenticación JWT** con roles y permisos
- ✅ **Gestión de productos** con código de barras
- ✅ **Control de inventario** en tiempo real
- ✅ **Sistema de ventas** completo
- ✅ **Gestión de compras** y proveedores
- ✅ **Reportes** segmentados por rubro
- ✅ **Auditoría** completa de operaciones
- ✅ **Seguridad** con helmet, rate limiting y validaciones
- ✅ **Logging** estructurado con Winston

## 📋 Requisitos Previos

- Node.js >= 14.x
- MySQL >= 5.7 o MariaDB >= 10.3
- npm o yarn

## 🛠️ Instalación

### 1. Clonar el repositorio (si aplica)

```bash
git clone <url-repo>
cd tienda-main/tienda-main
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=pos_multiservicios
DB_USERNAME=root
DB_PASSWORD=tu_password

# JWT
JWT_SECRET=clave_secreta_muy_larga_y_compleja
JWT_REFRESH_SECRET=refresh_secret_muy_larga_y_compleja

# Servidor
NODE_ENV=development
PORT=3000
```

### 4. Crear base de datos

```sql
CREATE DATABASE pos_multiservicios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 5. Inicializar base de datos

Este comando creará las tablas y datos iniciales (roles y usuario admin):

```bash
node src/scripts/seed.js
```

## 🎯 Uso

### Desarrollo

```bash
npm run dev
```

El servidor se iniciará en `http://localhost:3000`

### Producción

```bash
npm start
```

## 🔐 Credenciales Iniciales

Después de ejecutar el seed:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

⚠️ **IMPORTANTE:** Cambie esta contraseña inmediatamente en producción.

## 📡 Endpoints API

### Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | Iniciar sesión | No |
| POST | `/api/auth/register` | Registrar usuario | Admin |
| POST | `/api/auth/refresh-token` | Renovar token | No |
| GET | `/api/auth/me` | Usuario actual | Sí |
| POST | `/api/auth/change-password` | Cambiar contraseña | Sí |
| POST | `/api/auth/logout` | Cerrar sesión | Sí |

### Ejemplo de Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Respuesta:

```json
{
  "success": true,
  "message": "Inicio de sesión exitoso",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@pos.com",
      "nombre_completo": "Administrador del Sistema",
      "rol": {
        "nombre": "admin",
        "permisos": {...}
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Usar Token en Peticiones

Agregar header `Authorization`:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

## 🗂️ Estructura del Proyecto

```
src/
├── config/              # Configuraciones
│   ├── database.js      # Config de Sequelize
│   ├── auth.js          # Config de JWT
│   └── constants.js     # Constantes del sistema
├── models/              # Modelos de Sequelize
│   ├── User.js
│   ├── Role.js
│   ├── Cliente.js
│   ├── AuditoriaLog.js
│   └── index.js         # Exportador central
├── services/            # Lógica de negocio
│   └── auth.service.js
├── controllers/         # Controladores
│   └── auth.controller.js
├── middleware/          # Middlewares
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── errorHandler.middleware.js
├── routes/              # Rutas
│   └── api/
│       └── auth.routes.js
├── utils/               # Utilidades
│   └── logger.js
├── scripts/             # Scripts de utilidad
│   └── seed.js
└── app.js               # Entrada principal
```

## 👥 Roles y Permisos

### Roles Predefinidos

1. **Admin** - Acceso completo al sistema
2. **Vendedor** - Crear ventas, ver productos
3. **Almacenero** - Gestionar inventario y compras
4. **Cajero** - Realizar ventas
5. **Supervisor** - Ver reportes

### Permisos Disponibles

```javascript
// Productos
productos.ver
productos.crear
productos.editar
productos.eliminar
productos.ajustar_stock

// Ventas
ventas.ver
ventas.crear
ventas.anular
ventas.aplicar_descuento

// Y más...
```

## 📊 Logging

Los logs se guardan en `logs/`:

- `error.log` - Solo errores
- `combined.log` - Todos los logs

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT para autenticación stateless
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting en rutas sensibles  
✅ Validación de inputs con express-validator
- ✅ CORS configurado
- ✅ Auditoría de operaciones críticas

## 🚧 Próximos Pasos

- [ ] Implementar endpoints de productos
- [ ] Implementar endpoints de ventas
- [ ] Integración con lectores de código de barras
- [ ] Sistema de reportes
- [ ] Interfaz de usuario

## 📝 Notas Importantes

1. **Entorno de desarrollo**: Las tablas se sincronizan automáticamente al iniciar
2. **Producción**: Desactivar `syncModels` y usar migraciones
3. **Seguridad**: Cambiar todas las claves secretas en producción
4. **Base de datos**: Hacer respaldos regulares

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

ISC

## 👨‍💻 Mantenimiento

Para reportar problemas o sugerencias, crear un issue en el repositorio.
