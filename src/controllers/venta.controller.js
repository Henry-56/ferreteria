const ventaService = require('../services/venta.service');
const logger = require('../utils/logger');

class VentaController {
    // Crear nueva venta
    async crear(req, res, next) {
        try {
            const { cliente_id, tipo_comprobante, metodo_pago, detalles, notas } = req.body;
            const usuario_id = req.user.id;

            // Validar que haya detalles
            if (!detalles || detalles.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Debe incluir al menos un producto'
                });
            }

            // Crear venta
            const venta = await ventaService.crearVenta(
                {
                    usuario_id,
                    cliente_id,
                    tipo_comprobante: tipo_comprobante || 'ticket',
                    metodo_pago: metodo_pago || 'efectivo',
                    detalles,
                    notas
                },
                usuario_id
            );

            logger.info(`Venta #${venta.id} creada por usuario ${usuario_id}`);

            res.status(201).json({
                success: true,
                message: 'Venta creada exitosamente',
                data: venta
            });

        } catch (error) {
            logger.error('Error al crear venta:', error);
            next(error);
        }
    }

    // Listar ventas
    async listar(req, res, next) {
        try {
            const {
                page = 1,
                limit = 20,
                fecha_inicio,
                fecha_fin,
                status
            } = req.query;

            const opciones = {
                page: parseInt(page),
                limit: parseInt(limit),
                fecha_inicio,
                fecha_fin,
                status
            };

            // Aquí iría la lógica de listado (simplificada)
            const { Ventas, DetalleVenta, User, Cliente } = require('../models');
            const { Op } = require('sequelize');

            const where = {};

            if (fecha_inicio && fecha_fin) {
                where.fecha = {
                    [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
                };
            }

            if (status) {
                where.status = status;
            }

            const ventas = await Ventas.findAll({
                where,
                include: [
                    { model: User, as: 'usuario', attributes: ['id', 'username'] },
                    { model: Cliente, as: 'cliente', attributes: ['id', 'nombre'] },
                    { model: DetalleVenta, as: 'detalles' }
                ],
                order: [['fecha', 'DESC']],
                limit: opciones.limit,
                offset: (opciones.page - 1) * opciones.limit
            });

            res.json({
                success: true,
                data: ventas,
                pagination: {
                    page: opciones.page,
                    limit: opciones.limit,
                    total: ventas.length
                }
            });

        } catch (error) {
            logger.error('Error al listar ventas:', error);
            next(error);
        }
    }

    // Obtener venta por ID
    async obtenerPorId(req, res, next) {
        try {
            const { id } = req.params;
            const { Ventas, DetalleVenta, User, Cliente, Producto } = require('../models');

            const venta = await Ventas.findByPk(id, {
                include: [
                    { model: User, as: 'usuario', attributes: ['id', 'username'] },
                    { model: Cliente, as: 'cliente' },
                    {
                        model: DetalleVenta,
                        as: 'detalles',
                        include: [{ model: Producto, as: 'producto' }]
                    }
                ]
            });

            if (!venta) {
                return res.status(404).json({
                    success: false,
                    message: 'Venta no encontrada'
                });
            }

            res.json({
                success: true,
                data: venta
            });

        } catch (error) {
            logger.error('Error al obtener venta:', error);
            next(error);
        }
    }

    // Anular venta
    async anular(req, res, next) {
        try {
            const { id } = req.params;
            const { motivo } = req.body;
            const usuario_id = req.user.id;

            const venta = await ventaService.anularVenta(id, usuario_id, motivo);

            logger.info(`Venta #${id} anulada por usuario ${usuario_id}`);

            res.json({
                success: true,
                message: 'Venta anulada exitosamente',
                data: venta
            });

        } catch (error) {
            logger.error('Error al anular venta:', error);
            next(error);
        }
    }
}

module.exports = new VentaController();
