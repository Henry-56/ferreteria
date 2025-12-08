# Fix Aplicado - Rutas de Config en Modelos

## Problema

Todos los modelos legacy estaban usando:
```javascript
const sequelize = require('../db/config');
```

Pero el archivo se movió a:
```javascript
const sequelize = require('../config/database');
```

## Archivos Corregidos

✅ `src/models/detalleCompras.js` - También removidas relaciones
✅ `src/models/detalleVentas.js` - También removidas relaciones y agregados campos nuevos
✅ `src/models/ventas.js`
✅ `src/models/compras.js`
✅ `src/models/rubros.js`
✅ `src/models/proveedores.js`
✅ `src/models/movInventarios.js`

## Campos Agregados a DetalleVenta

Para soportar el servicio de ventas mejorado:
- `precio_unitario` (antes `precio_unit`)
- `descuento_unitario` - nuevo
- `costo_unitario` - nuevo
- `utilidad` - nuevo

## Estado

El servidor debería estar corriendo correctamente ahora. Todas las relaciones entre modelos se manejan centralmente en `src/models/index.js`.
