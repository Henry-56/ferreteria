const reporteService = require('../services/reporte.service');
const logger = require('../utils/logger');

class ReporteController {
    // Dashboard - KPIs generales
    async dashboard(req, res, next) {
        try {
            const { Ventas, Producto } = require('../models');
            const { Op } = require('sequelize');
            const sequelize = require('../config/database');

            // Ventas de hoy
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            const ventasHoy = await Ventas.findAll({
                where: {
                    fecha: {
                        [Op.gte]: hoy
                    },
                    status: 'completada'
                },
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'cantidad'],
                    [sequelize.fn('SUM', sequelize.col('total')), 'total']
                ],
                raw: true
            });

            // Productos
            const productosStats = await Producto.findAll({
                attributes: [
                    [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN stock <= stock_minimo AND stock > 0 THEN 1 END')), 'stockBajo'],
                    [sequelize.fn('COUNT', sequelize.literal('CASE WHEN stock = 0 THEN 1 END')), 'agotados']
                ],
                raw: true
            });

            const dashboard = {
                ventasHoy: {
                    total: parseFloat(ventasHoy[0]?.total || 0),
                    cantidad: parseInt(ventasHoy[0]?.cantidad || 0)
                },
                productos: {
                    total: parseInt(productosStats[0]?.total || 0),
                    stockBajo: parseInt(productosStats[0]?.stockBajo || 0),
                    agotados: parseInt(productosStats[0]?.agotados || 0)
                }
            };

            res.json({
                success: true,
                data: dashboard
            });

        } catch (error) {
            logger.error('Error al obtener dashboard:', error);
            next(error);
        }
    }

    // Reporte de ventas
    async ventas(req, res, next) {
        try {
            const { fecha_inicio, fecha_fin, agrupar_por } = req.query;

            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe proporcionar fecha_inicio y fecha_fin'
                });
            }

            const reporte = await reporteService.ventasPorPeriodo(
                new Date(fecha_inicio),
                new Date(fecha_fin),
                agrupar_por
            );

            res.json({
                success: true,
                data: reporte
            });

        } catch (error) {
            logger.error('Error al generar reporte de ventas:', error);
            next(error);
        }
    }

    // Productos más vendidos
    async productosMasVendidos(req, res, next) {
        try {
            const { limit = 10, fecha_inicio, fecha_fin } = req.query;

            const productos = await reporteService.productosMasVendidos(
                parseInt(limit),
                fecha_inicio ? new Date(fecha_inicio) : null,
                fecha_fin ? new Date(fecha_fin) : null
            );

            res.json({
                success: true,
                data: productos
            });

        } catch (error) {
            logger.error('Error al obtener productos más vendidos:', error);
            next(error);
        }
    }

    // Ventas por rubro
    async ventasPorRubro(req, res, next) {
        try {
            const { fecha_inicio, fecha_fin } = req.query;

            const reporte = await reporteService.ventasPorRubro(
                fecha_inicio ? new Date(fecha_inicio) : null,
                fecha_fin ? new Date(fecha_fin) : null
            );

            res.json({
                success: true,
                data: reporte
            });

        } catch (error) {
            logger.error('Error al obtener ventas por rubro:', error);
            next(error);
        }
    }
}

module.exports = new ReporteController();
