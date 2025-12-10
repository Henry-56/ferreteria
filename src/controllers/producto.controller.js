const Producto = require('../models/productos');
const { Rubros } = require('../models/rubros');
const { Proveedores } = require('../models/proveedores');
const inventarioService = require('../services/inventario.service');
const storageService = require('../services/storage.service');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

class ProductoController {

    async listar(req, res, next) {
        try {
            const { page = 1, limit = 20, search, id_rubro, bajo_stock } = req.query;

            const where = { status: 1 };

            if (search) {
                where[Op.or] = [
                    { nombre: { [Op.like]: `%${search}%` } },
                    { codigo_barra: { [Op.like]: `%${search}%` } },
                    { sku: { [Op.like]: `%${search}%` } }
                ];
            }

            if (id_rubro) {
                where.id_rubro = id_rubro;
            }

            let productos;

            if (bajo_stock === 'true') {
                productos = await inventarioService.getProductosBajoStock();
                return res.json({
                    success: true,
                    data: productos,
                    total: productos.length
                });
            }

            const result = await Producto.findAndCountAll({
                where,
                include: [
                    { model: Rubros, as: 'rubro', attributes: ['id', 'nombre'] },
                    { model: Proveedores, as: 'proveedor', attributes: ['id', 'nombre'] }
                ],
                limit: parseInt(limit),
                offset: (parseInt(page) - 1) * parseInt(limit),
                order: [['nombre', 'ASC']]
            });

            res.json({
                success: true,
                data: result.rows,
                pagination: {
                    total: result.count,
                    page: parseInt(page),
                    pages: Math.ceil(result.count / parseInt(limit))
                }
            });

        } catch (error) {
            next(error);
        }
    }

    async obtener(req, res, next) {
        try {
            const { id } = req.params;

            const producto = await Producto.findByPk(id, {
                include: [
                    { model: Rubros, as: 'rubro' },
                    { model: Proveedores, as: 'proveedor' }
                ]
            });

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });

        } catch (error) {
            next(error);
        }
    }

    async buscarPorCodigoBarras(req, res, next) {
        try {
            const { codigo } = req.params;

            const producto = await Producto.findOne({
                where: { codigo_barra: codigo, status: 1 },
                include: [
                    { model: Rubros, as: 'rubro' },
                    { model: Proveedores, as: 'proveedor' }
                ]
            });

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            res.json({
                success: true,
                data: producto
            });

        } catch (error) {
            next(error);
        }
    }

    async crear(req, res, next) {
        try {
            const productoData = req.body;

            const producto = await Producto.create(productoData);

            logger.info(`Producto creado: ${producto.nombre} (ID: ${producto.id})`);

            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: producto
            });

        } catch (error) {
            next(error);
        }
    }

    async actualizar(req, res, next) {
        try {
            const { id } = req.params;
            const productoData = req.body;

            const producto = await Producto.findByPk(id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            await producto.update(productoData);

            logger.info(`Producto actualizado: ${producto.nombre} (ID: ${producto.id})`);

            res.json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: producto
            });

        } catch (error) {
            next(error);
        }
    }

    async eliminar(req, res, next) {
        try {
            const { id } = req.params;

            const producto = await Producto.findByPk(id);

            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            await producto.update({ status: 0 });

            logger.info(`Producto eliminado (soft delete): ${producto.nombre} (ID: ${producto.id})`);

            res.json({
                success: true,
                message: 'Producto eliminado exitosamente'
            });

        } catch (error) {
            next(error);
        }
    }

    async ajustarStock(req, res, next) {
        try {
            const { id } = req.params;
            const { nuevoStock, motivo } = req.body;
            const usuario_id = req.user.id;

            if (nuevoStock === undefined || nuevoStock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El nuevo stock debe ser un número válido mayor o igual a 0'
                });
            }

            const movimiento = await inventarioService.ajustarStock(
                id,
                nuevoStock,
                usuario_id,
                motivo || 'Ajuste manual'
            );

            res.json({
                success: true,
                message: 'Stock ajustado exitosamente',
                data: movimiento
            });

        } catch (error) {
            next(error);
        }
    }

    async subirImagen(req, res, next) {
        try {
            const { id } = req.params;

            // Verificar que el producto existe
            const producto = await Producto.findByPk(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            // Verificar que se subió un archivo
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se proporcionó ningún archivo'
                });
            }

            // Si el producto ya tiene una imagen, eliminar la anterior
            if (producto.imagen_url) {
                await storageService.deleteProductImage(producto.imagen_url);
            }

            // Subir nueva imagen a GCS
            const imageUrl = await storageService.uploadProductImage(req.file);

            // Actualizar producto con nueva URL
            await producto.update({ imagen_url: imageUrl });

            logger.info(`Imagen subida para producto #${id}: ${imageUrl}`);

            res.json({
                success: true,
                message: 'Imagen subida exitosamente',
                data: {
                    id: producto.id,
                    imagen_url: imageUrl
                }
            });

        } catch (error) {
            logger.error(`Error al subir imagen: ${error.message}`);
            next(error);
        }
    }

    async eliminarImagen(req, res, next) {
        try {
            const { id } = req.params;

            // Verificar que el producto existe
            const producto = await Producto.findByPk(id);
            if (!producto) {
                return res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado'
                });
            }

            if (!producto.imagen_url) {
                return res.status(400).json({
                    success: false,
                    message: 'El producto no tiene imagen'
                });
            }

            // Eliminar imagen de GCS
            await storageService.deleteProductImage(producto.imagen_url);

            // Actualizar producto (remover URL)
            await producto.update({ imagen_url: null });

            logger.info(`Imagen eliminada del producto #${id}`);

            res.json({
                success: true,
                message: 'Imagen eliminada exitosamente'
            });

        } catch (error) {
            logger.error(`Error al eliminar imagen: ${error.message}`);
            next(error);
        }
    }

    /**
     * POST /api/productos/identificar
     * Identificar producto usando IA
     */
    async identificar(req, res, next) {
        try {
            const { imageBase64 } = req.body;

            // 1. Identificar con Gemini
            const aiService = require('../services/ai.service');
            const aiResult = await aiService.identifyProduct(imageBase64);

            if (aiResult.error) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pudo identificar un producto claro en la imagen'
                });
            }

            return res.json({
                success: true,
                data: {
                    identification: aiResult,
                    // Devolvemos searchQuery para que el frontend lo use si quiere
                    searchQuery: aiResult.searchQuery
                }
            });

        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductoController();
