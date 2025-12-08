const { Cliente } = require('../models');
const logger = require('../utils/logger');

class ClienteController {
    // Listar clientes
    async listar(req, res, next) {
        try {
            const { search, tipo_cliente, activo, page = 1, limit = 50 } = req.query;
            const { Op } = require('sequelize');

            const where = {};

            if (search) {
                where[Op.or] = [
                    { nombre: { [Op.like]: `%${search}%` } },
                    { ruc_dni: { [Op.like]: `%${search}%` } }
                ];
            }

            if (tipo_cliente) {
                where.tipo_cliente = tipo_cliente;
            }

            if (activo !== undefined) {
                where.activo = activo === 'true' || activo === '1';
            }

            const clientes = await Cliente.findAll({
                where,
                order: [['nombre', 'ASC']],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit)
            });

            const total = await Cliente.count({ where });

            res.json({
                success: true,
                data: clientes,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total
                }
            });

        } catch (error) {
            logger.error('Error al listar clientes:', error);
            next(error);
        }
    }

    // Obtener cliente por ID
    async obtenerPorId(req, res, next) {
        try {
            const { id } = req.params;

            const cliente = await Cliente.findByPk(id);

            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            res.json({
                success: true,
                data: cliente
            });

        } catch (error) {
            logger.error('Error al obtener cliente:', error);
            next(error);
        }
    }

    // Crear cliente
    async crear(req, res, next) {
        try {
            const {
                nombre,
                ruc_dni,
                direccion,
                telefono,
                email,
                tipo_cliente,
                credito_disponible
            } = req.body;

            const cliente = await Cliente.create({
                nombre,
                ruc_dni,
                direccion,
                telefono,
                email,
                tipo_cliente: tipo_cliente || 'minorista',
                credito_disponible: credito_disponible || 0
            });

            logger.info(`Cliente #${cliente.id} creado: ${cliente.nombre}`);

            res.status(201).json({
                success: true,
                message: 'Cliente creado exitosamente',
                data: cliente
            });

        } catch (error) {
            logger.error('Error al crear cliente:', error);
            next(error);
        }
    }

    // Actualizar cliente
    async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const {
                nombre,
                ruc_dni,
                direccion,
                telefono,
                email,
                tipo_cliente,
                credito_disponible,
                activo
            } = req.body;

            const cliente = await Cliente.findByPk(id);

            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            await cliente.update({
                nombre: nombre || cliente.nombre,
                ruc_dni: ruc_dni !== undefined ? ruc_dni : cliente.ruc_dni,
                direccion: direccion !== undefined ? direccion : cliente.direccion,
                telefono: telefono !== undefined ? telefono : cliente.telefono,
                email: email !== undefined ? email : cliente.email,
                tipo_cliente: tipo_cliente || cliente.tipo_cliente,
                credito_disponible: credito_disponible !== undefined ? credito_disponible : cliente.credito_disponible,
                activo: activo !== undefined ? activo : cliente.activo
            });

            logger.info(`Cliente #${id} actualizado`);

            res.json({
                success: true,
                message: 'Cliente actualizado exitosamente',
                data: cliente
            });

        } catch (error) {
            logger.error('Error al actualizar cliente:', error);
            next(error);
        }
    }

    // Eliminar cliente (soft delete)
    async eliminar(req, res, next) {
        try {
            const { id } = req.params;

            const cliente = await Cliente.findByPk(id);

            if (!cliente) {
                return res.status(404).json({
                    success: false,
                    message: 'Cliente no encontrado'
                });
            }

            await cliente.update({ activo: false });

            logger.info(`Cliente #${id} desactivado`);

            res.json({
                success: true,
                message: 'Cliente eliminado exitosamente'
            });

        } catch (error) {
            logger.error('Error al eliminar cliente:', error);
            next(error);
        }
    }
}

module.exports = new ClienteController();
