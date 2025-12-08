# 🔄 Migración en 3 Pasos (Corregida)

## ❌ Problema Anterior
La tabla `ventas` tiene datos y necesita `usuario_id`, pero la tabla `usuarios` está vacía. No podemos agregar foreign key NOT NULL a una columna que no tiene datos válidos.

## ✅ Solución: Migración en 3 Pasos

### Paso 1: Crear Tablas Nuevas

```bash
node src/scripts/paso1_crear_tablas.js
```

Esto crea:
- `usuarios`
- `roles`
- `clientes`
- `auditoria_logs`
- `mov_inventarios`

### Paso 2: Crear Usuario Admin y Roles

```bash
node src/scripts/seed.js
```

Esto crea:
- 5 roles con permisos
- Usuario admin (admin/admin123)

### Paso 3: Actualizar Tablas Existentes

```bash
node src/scripts/paso2_actualizar_tablas.js
```

Esto:
- Agrega columnas nuevas a `productos`, `ventas`, `compras`, `detalle_venta`
- Asigna el usuario admin a todas las ventas existentes
- Agrega las foreign keys correctamente

### Paso 4: Iniciar Servidor

```bash
npm run dev
```

---

## 📋 Resumen de Comandos

```bash
# 1. Crear tablas nuevas
node src/scripts/paso1_crear_tablas.js

# 2. Crear usuario admin
node src/scripts/seed.js

# 3. Actualizar tablas existentes
node src/scripts/paso2_actualizar_tablas.js

# 4. Iniciar servidor
npm run dev
```

---

## ⚠️ Importante

- Los pasos DEBEN ejecutarse en orden
- NO saltar ningún paso
- Si un paso falla, revisar el error antes de continuar

---

## 🎯 ¿Qué hace cada script?

**paso1_crear_tablas.js:**
- Solo crea tablas que NO existen
- No toca datos existentes

**seed.js:**
- Crea roles
- Crea usuario admin con ID
- Usa findOrCreate (no duplica)

**paso2_actualizar_tablas.js:**
- Agrega columnas a tablas existentes
- Asigna admin a datos legacy
- Agrega foreign keys

¡Ejecuta los pasos en orden y todo funcionará! 🚀
