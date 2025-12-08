require('dotenv').config();

module.exports = {
    // Configuración de empresa
    COMPANY: {
        NAME: process.env.COMPANY_NAME || 'Tienda Multiservicios',
        RUC: process.env.COMPANY_RUC || '',
        TAX_RATE: parseFloat(process.env.TAX_RATE) || 0.18
    },

    // Roles del sistema
    ROLES: {
        ADMIN: 'admin',
        VENDEDOR: 'vendedor',
        ALMACENERO: 'almacenero',
        CAJERO: 'cajero',
        SUPERVISOR: 'supervisor'
    },

    // Permisos
    PERMISSIONS: {
        // Productos
        PRODUCTOS_VER: 'productos.ver',
        PRODUCTOS_CREAR: 'productos.crear',
        PRODUCTOS_EDITAR: 'productos.editar',
        PRODUCTOS_ELIMINAR: 'productos.eliminar',
        PRODUCTOS_AJUSTAR_STOCK: 'productos.ajustar_stock',

        // Ventas
        VENTAS_VER: 'ventas.ver',
        VENTAS_CREAR: 'ventas.crear',
        VENTAS_ANULAR: 'ventas.anular',
        VENTAS_APLICAR_DESCUENTO: 'ventas.aplicar_descuento',

        // Compras
        COMPRAS_VER: 'compras.ver',
        COMPRAS_CREAR: 'compras.crear',
        COMPRAS_EDITAR: 'compras.editar',

        // Reportes
        REPORTES_VENTAS: 'reportes.ventas',
        REPORTES_FINANCIEROS: 'reportes.financieros',
        REPORTES_INVENTARIO: 'reportes.inventario',

        // Usuarios
        USUARIOS_VER: 'usuarios.ver',
        USUARIOS_CREAR: 'usuarios.crear',
        USUARIOS_EDITAR: 'usuarios.editar',
        USUARIOS_ELIMINAR: 'usuarios.eliminar',

        // Configuración
        CONFIG_GENERAL: 'config.general',
        CONFIG_ROLES: 'config.roles'
    },

    // Estados
    STATUS: {
        ACTIVO: 1,
        INACTIVO: 0
    },

    // Tipos de movimiento de inventario
    TIPO_MOVIMIENTO: {
        ENTRADA: 'entrada',
        SALIDA: 'salida',
        AJUSTE: 'ajuste'
    },

    // Tipos de comprobante
    TIPO_COMPROBANTE: {
        BOLETA: 'boleta',
        FACTURA: 'factura',
        TICKET: 'ticket'
    },

    // Métodos de pago
    METODO_PAGO: {
        EFECTIVO: 'efectivo',
        TARJETA: 'tarjeta',
        TRANSFERENCIA: 'transferencia',
        MIXTO: 'mixto'
    },

    // Estados de venta/compra
    ESTADO_OPERACION: {
        COMPLETADA: 'completada',
        CANCELADA: 'cancelada',
        PENDIENTE: 'pendiente'
    }
};
