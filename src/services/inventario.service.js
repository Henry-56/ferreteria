const sequelize = require('../config/database');
const Producto = require('../models/productos');
const MovInventario = require('../models/MovInventario');
const { TIPO_MOVIMIENTO } = require('../config/constants');
const logger = require('../utils/logger');

class InventarioService {

    /**
     * Registrar movimiento de inventario
     */
    async registrarMovimiento(movimientoData) {
        const t = await sequelize.transaction();

        try {
            const { producto_id, cantidad, tipo_movimiento, usuario_id, referencia, referencia_id, motivo } = movimientoData;

            // Obtener producto
            const producto = await Producto.findByPk(producto_id, { transaction: t });

            if (!producto) {
                throw new Error('Producto no encontrado');
            }

            const stockAnterior = producto.stock;
            let stockNuevo = stockAnterior;

            // Calcular nuevo stock según tipo de movimiento
            if (tipo_movimiento === TIPO_MOVIMIENTO.ENTRADA) {
                stockNuevo = stockAnterior + cantidad;
            } else if (tipo_movimiento === TIPO_MOVIMIENTO.SALIDA) {
                if (cantidad > stockAnterior) {
                    throw new Error(`Stock insuficiente. Disponible: ${stockAnterior}, Solicitado: ${cantidad}`);
                }
                stockNuevo = stockAnterior - cantidad;
            } else if (tipo_movimiento === TIPO_MOVIMIENTO.AJUSTE) {
                stockNuevo = cantidad; // El ajuste establece el stock directamente
            }

            // Actualizar stock del producto
            await producto.update({ stock: stockNuevo }, { transaction: t });

            // Registrar movimiento
            const movimiento = await MovInventario.create({
                producto_id,
                usuario_id,
                tipo_movimiento,
                cantidad: tipo_movimiento === TIPO_MOVIMIENTO.AJUSTE ? Math.abs(stockNuevo - stockAnterior) : cantidad,
                stock_anterior: stockAnterior,
                stock_nuevo: stockNuevo,
                referencia,
                referencia_id,
                motivo,
                fecha: new Date()
            }, { transaction: t });

            await t.commit();

            logger.info(`Movimiento de inventario registrado: Producto #${producto_id}, Tipo: ${tipo_movimiento}, Stock: ${stockAnterior} -> ${stockNuevo}`);

            return movimiento;

        } catch (error) {
            await t.rollback();
            logger.error(`Error al registrar movimiento de inventario: ${error.message}`);
            throw error;
        }
    }

    /**
     * Ajustar stock manualmente
     */
    async ajustarStock(producto_id, nuevoStock, usuario_id, motivo) {
        try {
            if (nuevoStock < 0) {
                throw new Error('El stock no puede ser negativo');
            }

            return await this.registrarMovimiento({
                producto_id,
                cantidad: nuevoStock,
                tipo_movimiento: TIPO_MOVIMIENTO.AJUSTE,
                usuario_id,
                referencia: 'ajuste_manual',
                motivo
            });

        } catch (error) {
            throw error;
        }
    }

    /**
     * Obtener productos con stock bajo
     */
    async getProductosBajoStock() {
        try {
            const productos = await Producto.findAll({
                where: sequelize.where(
                    sequelize.col('stock'),
                    '<=',
                    sequelize.col('stock_minimo')
                ),
                include: [{
                    model: require('./rubros').Rubros,
                    as: 'rubro',
                    attributes: ['id', 'nombre']
                }],
                order: [['stock', 'ASC']]
            });

            return productos;

        } catch (error) {
            logger.error(`Error al obtener productos con stock bajo: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener productos agotados
     */
    async getProductosAgotados() {
        try {
            const productos = await Producto.findAll({
                where: { stock: 0 },
                include: [{
                    model: require('./rubros').Rubros,
                    as: 'rubro',
                    attributes: ['id', 'nombre']
                }]
            });

            return productos;

        } catch (error) {
            logger.error(`Error al obtener productos agotados: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener historial de movimientos de un producto
     */
    async getHistorialMovimientos(producto_id, opciones = {}) {
        try {
            const { limit = 50, offset = 0, fechaInicio, fechaFin } = opciones;

            const where = { producto_id };

            if (fechaInicio && fechaFin) {
                where.fecha = {
                    [sequelize.Sequelize.Op.between]: [fechaInicio, fechaFin]
                };
            }

            const movimientos = await MovInventario.findAndCountAll({
                where,
                include: [{
                    model: require('./User'),
                    as: 'usuario',
                    attributes: ['id', 'username', 'nombre_completo']
                }],
                limit,
                offset,
                order: [['fecha', 'DESC']]
            });

            return movimientos;

        } catch (error) {
            logger.error(`Error al obtener historial de movimientos: ${error.message}`);
            throw error;
        }
    }

    /**
     * Calcular inventario valorizado
     */
    async getInventarioValorizado() {
        try {
            const productos = await Producto.findAll({
                where: { status: 1 },
                attributes: [
                    'id',
                    'nombre',
                    'stock',
                    'precio_compra',
                    'costo_promedio',
                    'precio_venta',
                    [sequelize.literal('stock * COALESCE(costo_promedio, precio_compra, 0)'), 'valor_inventario']
                ],
                include: [{
                    model: require('./rubros').Rubros,
                    as: 'rubro',
                    attributes: ['id', 'nombre']
                }]
            });

            const valorTotal = productos.reduce((sum, p) => {
                const valor = p.stock * (p.costo_promedio || p.precio_compra || 0);
                return sum + parseFloat(valor);
            }, 0);

            return {
                productos,
                valorTotal,
                totalProductos: productos.length
            };

        } catch (error) {
            logger.error(`Error al calcular inventario valorizado: ${error.message}`);
            throw error;
        }
    }

    /**
     * Obtener resumen de inventario
     */
    async getResumenInventario() {
        try {
            const [totalProductos, productosBajoStock, productosAgotados, inventarioValorizado] = await Promise.all([
                Producto.count({ where: { status: 1 } }),
                Producto.count({
                    where: sequelize.where(
                        sequelize.literal('stock <= stock_minimo AND stock > 0'),
                        true
                    )
                }),
                Producto.count({ where: { stock: 0 } }),
                this.getInventarioValorizado()
            ]);

            return {
                totalProductos,
                productosBajoStock,
                productosAgotados,
                valorTotal: inventarioValorizado.valorTotal
            };

        } catch (error) {
            logger.error(`Error al obtener resumen de inventario: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new InventarioService();
