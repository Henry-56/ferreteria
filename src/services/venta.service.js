const sequelize = require('../config/database');
const { Ventas } = require('../models/ventas');
const { DetalleVenta } = require('../models/detalleVentas');
const Producto = require('../models/productos');
const Cliente = require('../models/Cliente');
const MovInventario = require('../models/MovInventario');
const { TIPO_MOVIMIENTO, TIPO_COMPROBANTE, COMPANY } = require('../config/constants');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class VentaService {

    async crearVenta(ventaData, detalles, usuario_id) {
        const t = await sequelize.transaction();

        try {
            // 1. Validar stock
            for (const detalle of detalles) {
                const producto = await Producto.findByPk(detalle.producto_id);

                if (!producto) {
                    throw new Error(`Producto ${detalle.producto_id} no encontrado`);
                }

                if (!producto.hasStock(detalle.cantidad)) {
                    throw new Error(`Stock insuficiente para ${producto.nombre}. Disponible: ${producto.stock}`);
                }
            }

            // 2. Calcular totales
            let subtotal = 0;
            const detallesConCalculo = [];

            for (const detalle of detalles) {
                const producto = await Producto.findByPk(detalle.producto_id);
                const precioUnit = detalle.precio_unitario || producto.precio_venta;
                const descuentoUnit = detalle.descuento_unitario || 0;
                const subtotalDetalle = (precioUnit - descuentoUnit) * detalle.cantidad;
                const costoUnit = producto.costo_promedio || producto.precio_compra || 0;
                const utilidad = (precioUnit - costoUnit) * detalle.cantidad;

                detallesConCalculo.push({
                    ...detalle,
                    precio_unitario: precioUnit,
                    descuento_unitario: descuentoUnit,
                    subtotal: subtotalDetalle,
                    costo_unitario: costoUnit,
                    utilidad
                });

                subtotal += subtotalDetalle;
            }

            const descuento = ventaData.descuento || 0;
            const impuesto = (subtotal - descuento) * COMPANY.TAX_RATE;
            const total = subtotal - descuento + impuesto;

            // 3. Generar número de comprobante
            const numeroComprobante = await this.generarNumeroComprobante(ventaData.tipo_comprobante || 'ticket', t);

            // 4. Crear venta
            const venta = await Ventas.create({
                ...ventaData,
                usuario_id,
                subtotal,
                impuesto,
                total,
                numero_comprobante: numeroComprobante,
                fecha: new Date()
            }, { transaction: t });

            // 5. Crear detalles y actualizar stock
            for (const detalle of detallesConCalculo) {
                await DetalleVenta.create({
                    venta_id: venta.id,
                    ...detalle
                }, { transaction: t });

                const producto = await Producto.findByPk(detalle.producto_id, { transaction: t });
                const stockAnterior = producto.stock;
                const stockNuevo = stockAnterior - detalle.cantidad;

                await producto.update({ stock: stockNuevo }, { transaction: t });

                await MovInventario.create({
                    producto_id: detalle.producto_id,
                    usuario_id,
                    tipo_movimiento: TIPO_MOVIMIENTO.SALIDA,
                    cantidad: detalle.cantidad,
                    stock_anterior: stockAnterior,
                    stock_nuevo: stockNuevo,
                    referencia: 'venta',
                    referencia_id: venta.id,
                    motivo: `Venta #${venta.id}`,
                    fecha: new Date()
                }, { transaction: t });
            }

            await t.commit();

            logger.info(`Venta #${venta.id} creada. Total: ${total}`);

            return await Ventas.findByPk(venta.id, {
                include: [{
                    model: DetalleVenta,
                    as: 'detalles',
                    include: [{ model: Producto, as: 'producto' }]
                }]
            });

        } catch (error) {
            await t.rollback();
            logger.error(`Error al crear venta: ${error.message}`);
            throw error;
        }
    }

    async generarNumeroComprobante(tipoComprobante, transaction) {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');

        const ultimaVenta = await Ventas.findOne({
            where: { tipo_comprobante: tipoComprobante },
            order: [['id', 'DESC']],
            transaction
        });

        let numero = 1;
        if (ultimaVenta && ultimaVenta.numero_comprobante) {
            const partes = ultimaVenta.numero_comprobante.split('-');
            numero = parseInt(partes[partes.length - 1]) + 1;
        }

        const prefijo = tipoComprobante === 'boleta' ? 'B' : tipoComprobante === 'factura' ? 'F' : 'T';
        return `${prefijo}-${año}${mes}-${String(numero).padStart(6, '0')}`;
    }

    async anularVenta(ventaId, usuario_id, motivo) {
        const t = await sequelize.transaction();

        try {
            const venta = await Ventas.findByPk(ventaId, {
                include: [{ model: DetalleVenta, as: 'detalles' }],
                transaction: t
            });

            if (!venta) {
                throw new Error('Venta no encontrada');
            }

            if (venta.status === 'cancelada') {
                throw new Error('La venta ya está cancelada');
            }

            // Devolver stock
            for (const detalle of venta.detalles) {
                const producto = await Producto.findByPk(detalle.producto_id, { transaction: t });
                const stockAnterior = producto.stock;
                const stockNuevo = stockAnterior + detalle.cantidad;

                await producto.update({ stock: stockNuevo }, { transaction: t });

                await MovInventario.create({
                    producto_id: detalle.producto_id,
                    usuario_id,
                    tipo_movimiento: TIPO_MOVIMIENTO.ENTRADA,
                    cantidad: detalle.cantidad,
                    stock_anterior: stockAnterior,
                    stock_nuevo: stockNuevo,
                    referencia: 'anulacion_venta',
                    referencia_id: venta.id,
                    motivo: `Anulación venta #${venta.id}: ${motivo}`,
                    fecha: new Date()
                }, { transaction: t });
            }

            await venta.update({
                status: 'cancelada',
                notas: `${venta.notas || ''}\nAnulada: ${motivo}`
            }, { transaction: t });

            await t.commit();
            logger.info(`Venta #${ventaId} anulada`);

            return venta;

        } catch (error) {
            await t.rollback();
            throw error;
        }
    }

    async getVentasPorPeriodo(fechaInicio, fechaFin) {
        try {
            const ventas = await Ventas.findAll({
                where: {
                    fecha: {
                        [Op.between]: [fechaInicio, fechaFin]
                    },
                    status: 'completada'
                },
                include: [{ model: DetalleVenta, as: 'detalles' }],
                order: [['fecha', 'DESC']]
            });

            const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);

            return {
                ventas,
                totalVentas,
                cantidadVentas: ventas.length
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = new VentaService();
