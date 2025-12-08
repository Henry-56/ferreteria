// Configuración de la API
const API_CONFIG = {
    baseURL: window.location.origin,
    apiPrefix: '/api',
    endpoints: {
        // Auth
        login: '/auth/login',
        register: '/auth/register',
        me: '/auth/me',
        refreshToken: '/auth/refresh-token',
        logout: '/auth/logout',
        changePassword: '/auth/change-password',

        // Productos
        productos: '/productos',
        productoById: (id) => `/productos/${id}`,
        productoByBarcode: (codigo) => `/productos/barcode/${codigo}`,
        productoAjustarStock: (id) => `/productos/${id}/ajustar-stock`,
        productoSubirImagen: (id) => `/productos/${id}/imagen`,
        productoEliminarImagen: (id) => `/productos/${id}/imagen`,

        // Rubros y Proveedores (legacy routes)
        rubros: '/rubros',
        proveedores: '/proveedores',

        // Ventas (a implementar en backend)
        ventas: '/ventas',
        ventaById: (id) => `/ventas/${id}`,
        anularVenta: (id) => `/ventas/${id}/anular`,

        // Reportes (a implementar en backend)
        reporteVentas: '/reportes/ventas',
        reporteProductos: '/reportes/productos',
        dashboard: '/reportes/dashboard'
    }
};

// Tokens de almacenamiento
const STORAGE_KEYS = {
    token: 'pos_token',
    refreshToken: 'pos_refresh_token',
    user: 'pos_user'
};

// Mensajes de la aplicación
const MESSAGES = {
    error: {
        network: 'Error de conexión. Verifica tu red.',
        unauthorized: 'Sesión expirada. Por favor inicia sesión nuevamente.',
        forbidden: 'No tienes permisos para realizar esta acción.',
        notFound: 'Recurso no encontrado.',
        validation: 'Por favor revisa los datos ingresados.',
        server: 'Error del servidor. Intenta nuevamente.'
    },
    success: {
        login: 'Inicio de sesión exitoso',
        logout: 'Sesión cerrada correctamente',
        created: 'Registro creado exitosamente',
        updated: 'Registro actualizado exitosamente',
        deleted: 'Registro eliminado exitosamente'
    }
};

// Configuración de paginación
const PAGINATION = {
    defaultLimit: 20,
    limits: [10, 20, 50, 100]
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, STORAGE_KEYS, MESSAGES, PAGINATION };
}
