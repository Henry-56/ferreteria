# 🚀 Guía de Configuración Rápida

## 📋 Pasos para Iniciar el Sistema

### 1. Crear Base de Datos Local

Abre MySQL y ejecuta:

```sql
CREATE DATABASE pos_multiservicios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Opciones según tu instalación de MySQL:**

**Con MySQL Workbench:**
1. Abrir MySQL Workbench
2. Conectar a tu servidor local
3. Ejecutar el SQL arriba en una nueva query

**Con línea de comandos:**
```bash
mysql -u root -p
# Ingresar tu contraseña de MySQL
CREATE DATABASE pos_multiservicios;
exit
```

**Con XAMPP:**
1. Iniciar XAMPP
2. Iniciar MySQL
3. Ir a phpMyAdmin (http://localhost/phpmyadmin)
4. Crear nueva base de datos "pos_multiservicios"

### 2. Ajustar Configuración de MySQL en .env

Si tu MySQL tiene contraseña, edita el archivo `.env`:

```env
DB_PASSWORD=tu_password_de_mysql
```

### 3. Inicializar Datos (Crear Tablas y Usuario Admin)

```bash
node src/scripts/seed.js
```

Esto creará:
- ✅ Todas las tablas necesarias
- ✅ 5 roles con permisos
- ✅ Usuario administrador (admin/admin123)

### 4. Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✓ Conectado a la base de datos con éxito.
==============================================
🚀 Servidor iniciado en puerto 3000
📊 Entorno: development
🌐 URL: http://localhost:3000
==============================================
```

### 5. Probar el Sistema

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

---

## ⚠️ Solución de Problemas

### Error: "Access denied for user 'root'@'localhost'"
- Tu MySQL tiene contraseña
- Edita `.env` y agrega tu contraseña en `DB_PASSWORD`

### Error: "Unknown database 'pos_multiservicios'"
- La base de datos no existe
- Ejecuta: `CREATE DATABASE pos_multiservicios;` en MySQL

### Error: "MySQL is not running"
- MySQL no está iniciado
- Inicia MySQL desde XAMPP o servicios de Windows

### La ruta "/" muestra "Ruta no encontrada"
- **Es normal**, el sistema es una API REST
- Las rutas comienzan con `/api`
- Ejemplo: `http://localhost:3000/api/auth/login`

---

## 📌 Rutas Disponibles

Una vez iniciado el servidor:

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario (requiere admin)
- `GET /api/auth/me` - Usuario actual

### Productos
- `GET /api/productos` - Listar productos
- `POST /api/productos` - Crear producto
- `GET /api/productos/:id` - Ver producto
- `PUT /api/productos/:id` - Actualizar producto
- `DELETE /api/productos/:id` - Eliminar producto
- `GET /api/productos/barcode/:codigo` - Buscar por código de barras

---

## 🔑 Credenciales Iniciales

**Usuario:** admin  
**Contraseña:** admin123

⚠️ Cambiar en producción

---

## 📞 Si Sigues con Problemas

1. Verifica que MySQL esté corriendo
2. Revisa el archivo `.env`
3. Confirma que la base de datos exista
4. Revisa los logs en `logs/error.log`
