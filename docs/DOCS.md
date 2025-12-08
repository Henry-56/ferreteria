# Documentación API Backend Multiservicios

## Introducción
Este backend gestiona el inventario, productos y ventas de la tienda. Está construido con Node.js, Express y MySQL. Las imágenes de los productos se almacenan en **Google Cloud Storage** y se accede a ellas mediante URLs públicas.

## Autenticación
La API utiliza autenticación basada en **JWT (JSON Web Tokens)**.
Todas las peticiones a endpoints protegidos deben incluir el header:

`Authorization: Bearer <TU_TOKEN>`

## Endpoints Principales

### 📦 Gestión de Productos

#### 1. Listar / Buscar Productos
Obtiene la lista de productos. Este es el endpoint principal para la funcionalidad de **BÚSQUEDA**.

- **Método:** `GET`
- **URL:** `/api/productos`
- **Parámetros (Query):**
  - `page`: Número de página (default: 1)
  - `limit`: Items por página (default: 20)
  - `search`: Texto para buscar por **nombre**, **SKU** o **código de barras**.
  - `id_rubro`: Filtrar por categoría.

**Ejemplo de Request (Búsqueda):**
```http
GET /api/productos?search=Coca&page=1 HTTP/1.1
Authorization: Bearer <token>
```

**Ejemplo de Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Coca Cola 3L",
      "precio_venta": "15.00",
      "stock": 50,
      "imagen_url": "https://storage.googleapis.com/emagenes/productos/producto_123.jpg"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "pages": 1
  }
}
```

#### 2. Obtener Producto por ID
- **Método:** `GET`
- **URL:** `/api/productos/:id`

#### 3. Buscar por Código de Barras (Escáner)
Ideal para apps móviles con cámara.
- **Método:** `GET`
- **URL:** `/api/productos/barcode/:codigo`

---

### 📷 Imágenes (Google Cloud Storage)

Para mostrar imágenes en tu app móvil (Flutter + Gemini):

1.  Usa el campo `imagen_url` que viene en el objeto `Producto`.
2.  Si `imagen_url` es `null`, muestra un placeholder local.
3.  Las URLs son públicas, no requieren headers adicionales para descargarse.

**Subir una imagen:**
- **Método:** `POST`
- **URL:** `/api/productos/:id/imagen`
- **Body:** `multipart/form-data` con campo `imagen`.

---

## 📱 Guía para Integración Móvil (Flutter)

### Búsqueda de Productos
Para implementar la barra de búsqueda en la app:
1.  Escuchar el input del usuario.
2.  Hacer petición a `GET /api/productos?search={TERMINO}`.
3.  Mostrar resultados en lista/grid usando `imagen_url` para la miniatura.

### Escaneo de Códigos
1.  Escanear código con cámara.
2.  Llamar a `GET /api/productos/barcode/{CODIGO_ESCANEDADO}`.
3.  Si devuelve 404, prompt al usuario para crear producto.
