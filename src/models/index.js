const sequelize = require('../config/database');

// Importar modelos
const User = require('./User');
const Role = require('./Role');
const Cliente = require('./Cliente');
const Producto = require('./productos');
const { Rubros } = require('./rubros');
const { Proveedores } = require('./proveedores');
const { Ventas } = require('./ventas');
const { Compras } = require('./compras');
const { DetalleVenta } = require('./detalleVentas');
const { DetalleCompra } = require('./detalleCompras');
const MovInventario = require('./MovInventario');
const AuditoriaLog = require('./AuditoriaLog');

// Definir relaciones

// Usuario - Rol
User.belongsTo(Role, { foreignKey: 'rol_id', as: 'rol' });
Role.hasMany(User, { foreignKey: 'rol_id' });

// Venta - Usuario
Ventas.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
User.hasMany(Ventas, { foreignKey: 'usuario_id' });

// Venta - Cliente
Ventas.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Cliente.hasMany(Ventas, { foreignKey: 'cliente_id' });

// Venta - DetalleVenta
Ventas.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });
DetalleVenta.belongsTo(Ventas, { foreignKey: 'venta_id', as: 'venta' });

// DetalleVenta - Producto
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id' });

// Compra - Usuario
Compras.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
User.hasMany(Compras, { foreignKey: 'usuario_id' });

// Compra - Proveedor
Compras.belongsTo(Proveedores, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedores.hasMany(Compras, { foreignKey: 'proveedor_id' });

// Compra - DetalleCompra
Compras.hasMany(DetalleCompra, { foreignKey: 'compra_id', as: 'detalles' });
DetalleCompra.belongsTo(Compras, { foreignKey: 'compra_id' });

// DetalleCompra - Producto
DetalleCompra.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleCompra, { foreignKey: 'producto_id' });

// Producto - Categoria/Rubro
Producto.belongsTo(Rubros, { foreignKey: 'id_rubro', as: 'rubro' });
Rubros.hasMany(Producto, { foreignKey: 'id_rubro' });

// Producto - Proveedor
Producto.belongsTo(Proveedores, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedores.hasMany(Producto, { foreignKey: 'proveedor_id' });

// MovimientoInventario - Producto
MovInventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(MovInventario, { foreignKey: 'producto_id' });

// MovimientoInventario - Usuario
MovInventario.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
User.hasMany(MovInventario, { foreignKey: 'usuario_id' });

// Auditoría - Usuario
AuditoriaLog.belongsTo(User, { foreignKey: 'usuario_id', as: 'usuario' });
User.hasMany(AuditoriaLog, { foreignKey: 'usuario_id' });

// Función para sincronizar modelos
const syncModels = async (options = {}) => {
    try {
        await sequelize.sync(options);
        console.log('✓ Modelos sincronizados correctamente');
    } catch (error) {
        console.error('✗ Error al sincronizar modelos:', error);
    }
};

module.exports = {
    sequelize,
    User,
    Role,
    Cliente,
    Producto,
    Rubros,
    Proveedores,
    Ventas,
    Compras,
    DetalleVenta,
    DetalleCompra,
    MovInventario,
    AuditoriaLog,
    syncModels
};
