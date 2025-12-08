const router = require('express').Router();
const ventaController = require('../../controllers/venta.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   POST /api/ventas
 * @desc    Crear nueva venta
 * @access  Private (ventas.crear)
 */
router.post('/',
    authorize('ventas.crear'),
    [
        body('detalles').isArray({ min: 1 }).withMessage('Debe incluir al menos un producto'),
        body('detalles.*.producto_id').isInt().withMessage('ID de producto inválido'),
        body('detalles.*.cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
        body('detalles.*.precio_unitario').isFloat({ min: 0 }).withMessage('Precio inválido'),
        body('metodo_pago').optional().isIn(['efectivo', 'tarjeta', 'transferencia', 'mixto']),
        body('tipo_comprobante').optional().isIn(['boleta', 'factura', 'ticket']),
        handleValidationErrors
    ],
    ventaController.crear
);

/**
 * @route   GET /api/ventas
 * @desc    Listar ventas
 * @access  Private (ventas.ver)
 */
router.get('/',
    authorize('ventas.ver'),
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('fecha_inicio').optional().isISO8601(),
        query('fecha_fin').optional().isISO8601(),
        handleValidationErrors
    ],
    ventaController.listar
);

/**
 * @route   GET /api/ventas/:id
 * @desc    Obtener venta por ID
 * @access  Private (ventas.ver)
 */
router.get('/:id',
    authorize('ventas.ver'),
    ventaController.obtenerPorId
);

/**
 * @route   POST /api/ventas/:id/anular
 * @desc    Anular una venta
 * @access  Private (ventas.anular)
 */
router.post('/:id/anular',
    authorize('ventas.anular'),
    [
        body('motivo').optional().isString().withMessage('Motivo debe ser texto'),
        handleValidationErrors
    ],
    ventaController.anular
);

module.exports = router;
