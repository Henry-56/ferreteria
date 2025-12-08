const { Ventas } = require('../models/ventas');
const { DetalleVenta } = require('../models/detalleVentas');
const Producto = require('../models/productos');
const { Rubros } = require('../models/rubros');
const { Compras } = require('../models/compras');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class ReporteService {

    async reporteVentasDiarias(fecha = new Date()) {
        try {
            const iniciodia = new Date(fecha.setHours(0, 0, 0, 0));
            const finDia = new Date(fecha.setHours(23, 59, 59, 999));

            const ventas = await Ventas.findAll({
                where: {
                    fecha: { [Op.between]: [iniciodia, finDia] },
                    status: 'completada'
                },
                include: [{ model: DetalleVenta, as: 'detalles' }]
            });

            const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
            const totalTransacciones = ventas.length;

            return {
                fecha,
                ventas,
                totalVentas,
                totalTransacciones,
                promedioTicket: totalTransacciones > 0 ? totalVentas / totalTransacciones : 0
            };

        } catch (error) {
            logger.error(`Error en reporte de ventas diarias: ${error.message}`);
            throw error;
        }
    }

    async reporteVentasPorPeriodo(fechaInicio, fechaFin) {
        try {
            const ventas = await Ventas.findAll({
                where: {
                    fecha: { [Op.between]: [fechaInicio, fechaFin] },
                    status: 'completada'
                },
                include: [{
                    model: DetalleVenta,
                    as: 'detalles',
                    include: [{
                        model: Producto,
                        as: 'producto',
                        include: [{ model: Rubros, as: 'rubro' }]
                    }]
                }]
            });

            const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
            const totalUtilidad = ventas.reduce((sum, v) => {
                return sum + v.detalles.reduce((s, d) => s + parseFloat(d.utilidad || 0), 0);
            }, 0);

            return {
                fechaInicio,
                fechaFin,
                ventas,
                totalVentas,
                totalUtilidad,
                cantidadVentas: ventas.length
            };

        } catch (error) {
            throw error;
        }
    }

    async reporteVentasPorRubro(fechaInicio, fechaFin) {
        try {
            const resultado = await DetalleVenta.findAll({
                attributes: [
                    [sequelize.fn('SUM', sequelize.col('detalle_ventas.subtotal')), 'total_ventas'],
                    [sequelize.fn('SUM', sequelize.col('detalle_ventas.cantidad')), 'cantidad_vendida'],
                    [sequelize.fn('SUM', sequelize.col('detalle_ventas.utilidad')), 'utilidad_total']
                ],
                include: [
                    {
                        model: Ventas,
                        as: 'venta',
                        where: {
                            fecha: { [Op.between]: [fechaInicio, fechaFin] },
                            status: 'completada'
                        },
                        attributes: []
                    },
                    {
                        model: Producto,
                        as: 'producto',
                        attributes: [],
                        include: [{
                            model: Rubros,
                            as: 'rubro',
                            attributes: ['id', 'nombre']
                        }]
                    }
                ],
                group: ['producto.rubro.id'],
                raw: true,
                nest: true
            });

            return resultado;

        } catch (error) {
            logger.error(`Error en reporte por rubro: ${error.message}`);
            throw error;
        }
    }

    async productosMasVendidos(fechaInicio, fechaFin, limit = 10) {
        try {
            const productos = await DetalleVenta.findAll({
                attributes: [
                    'producto_id',
                    [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_vendido'],
                    [sequelize.fn('SUM', sequelize.col('subtotal')), 'ingresos_totales'],
                    [sequelize.fn('COUNT', sequelize.col('detalle_ventas.id')), 'num_ventas']
                ],
                include: [
                    {
                        model: Ventas,
                        as: 'venta',
                        where: {
                            fecha: { [Op.between]: [fechaInicio, fechaFin] },
                            status: 'completada'
                        },
                        attributes: []
                    },
                    {
                        model: Producto,
                        as: 'producto',
                        attributes: ['id', 'nombre', 'codigo_barra'],
                        include: [{ model: Rubros, as: 'rubro', attributes: ['nombre'] }]
                    }
                ],
                group: ['producto_id'],
                order: [[sequelize.fn('SUM', sequelize.col('cantidad')), 'DESC']],
                limit,
                subQuery: false
            });

            return productos;

        } catch (error) {
            logger.error(`Error en productos más vendidos: ${error.message}`);
            throw error;
        }
    }

    async dashboardGeneral(fechaInicio, fechaFin) {
        try {
            const [ventasData, productosTop, ventasPorRubro] = await Promise.all([
                this.reporteVentasPorPeriodo(fechaInicio, fechaFin),
                this.productosMasVendidos(fechaInicio, fechaFin, 5),
                this.reporteVentasPorRubro(fechaInicio, fechaFin)
            ]);

            return {
                periodo: { fechaInicio, fechaFin },
                ventas: {
                    total: ventasData.totalVentas,
                    cantidad: ventasData.cantidadVentas,
                    utilidad: ventasData.totalUtilidad
                },
                productosTopVentas: productosTop,
                ventasPorRubro
            };

        } catch (error) {
            throw error;
        }
    }
}

module.exports = new ReporteService();
