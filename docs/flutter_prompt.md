# 📱 Super Prompt: Generador de App Móvil (Flutter)

**Rol:** Eres un experto Desarrollador Senior en Flutter y Arquitectura de Software Móvil.

**Objetivo:** Crear una aplicación móvil de "Punto de Venta y Escáner" para una tienda, que consuma el backend existente en Node.js/Express.

**Funcionalidad Principal (Star Feature):**
"Escanear y Descubrir": El usuario usa la cámara del celular para escanear el código de barras de un producto. La app consulta el backend y, si encuentra coincidencia, muestra inmediatamente la **foto del producto** en alta calidad junto con su precio, stock y detalles.

---

## 🛠️ Especificaciones Técnicas

### 1. Stack Tecnológico
- **Framework:** Flutter (Última versión estable).
- **Gestión de Estado:** Provider o Riverpod (tu elección para simplicidad y escala).
- **HTTP Client:** Dio (para manejo robusto de interceptores y tokens).
- **Escáner:** `mobile_scanner` (para códigos de barras/QR).
- **Imágenes:** `cached_network_image` (CRÍTICO: para mostrar las URLs de Google Cloud Storage con caché).
- **Storage Seguro:** `flutter_secure_storage` (para guardar el JWT).
- **IA (Visual Search):** `google_generative_ai` (SDK de Gemini para Flutter).

### 2. Backend API (Contexto)
El backend ya existe y expone una API RESTful.
- **Base URL:** `http://10.114.71.21:3000/api` (Tu IP Local actual - IMPORTANTE: Usar esta IP, no localhost, para que el móvil conecte).
- **Autenticación:** Header `Authorization: Bearer <TOKEN>`.
- **Imágenes:** Las URLs vienen completas (ej: `https://storage.googleapis.com/...`).

### 3. Endpoints Clave

**A. Login (Credenciales de Prueba):**
- **User:** `admin`
- **Pass:** `admin123`
- `POST /auth/login`
- Body: `{ "username": "admin", "password": "admin123" }`
- Response: `{ "success": true, "token": "JWT...", "user": { ... } }`

**B. Escaneo (Búsqueda Exacta):**
- `GET /productos/barcode/{codigo}`
- Response (200): `{ "success": true, "data": { "id": 1, "nombre": "...", "precio_venta": 10.5, "stock": 50, "imagen_url": "https://..." } }`
- Response (404): Producto no encontrado.

**C. Búsqueda por Texto (Fallback usado por la IA):**
- `GET /productos?search={texto}`
- Response: Lista de productos.

---

## 📱 Flujos de Usuario (User Stories)

### Historia 1: Autenticación
1.  Usuario abre la app.
2.  Si no tiene token válido, ve pantalla de Login.
3.  Ingresa credenciales y "Ingresar".
4.  App guarda token y redirige a Home.

### Historia 2: "Magic Scan" (Código de Barras)
1.  En el Home, hay un botón flotante: **"Escanear Código"**.
2.  Al tocar, se abre la cámara.
3.  La app detecta un código de barras.
4.  **Consulta inmediata** al endpoint `/api/productos/barcode/{codigo}`.
5.  **Resultado:** Muestra la ficha del producto (Foto + Precio).

### Historia 3: 📸 Búsqueda Visual (Gemini AI)
*"Encuentra relación entre la imagen escaneada y la base de datos"*
1.  En el Home, hay otro botón: **"Identificar Producto (Foto)"**.
2.  Usuario toma una foto a un producto (ej: una lata de refresco, un paquete de galletas) que NO tiene código legible o es desconocido.
3.  **Análisis AI:** La app envía la foto a **Gemini Flash** prompt: *"Identifica este producto comercial. Devuelve solo el nombre genérico y la marca. Ej: Coca Cola 3L"*.
4.  **Búsqueda en BD:** Con el texto devuelto por Gemini, la app consulta automáticamente: `GET /api/productos?search={TextoGemini}`.
5.  **Resultados:** Muestra los productos de TIENDA que coinciden visualmente con lo que vio la IA.

---

## 🤖 Instrucciones para la IA Generadora (Tú)

1.  **Estructura de Proyecto:** Genera la estructura de carpetas (services, models, screens, widgets).
2.  **Modelo de Datos:** Crea la clase `Product` basada en este JSON:
    ```json
    {
      "id": 1,
      "nombre": "Producto Ejemplo",
      "precio_venta": 100.00,
      "imagen_url": "https://storage.googleapis.com/...",
      "codigo_barra": "123456"
    }
    ```
3.  **Servicio API:** Implementa `ApiService` con `Dio`. Configura un interceptor para inyectar el token automáticamente en cada request.
4.  **Servicio AI:** Implementa `GeminiService` que reciba un `File` (foto) y retorne un `String` (nombre probable) usando el modelo `gemini-1.5-flash` (es rápido y económico).
5.  **Pantallas:**
    - `ScanScreen`: Para código de barras.
    - `VisualSearchScreen`: Para tomar foto y mostrar loader "Analizando con IA...".
6.  **Manejo de Errores:** Asegúrate de manejar 401 (Token vencido) redirigiendo al Login.

**¡Sorpréndeme con una UI moderna, limpia y enfocada en la imagen del producto!**
