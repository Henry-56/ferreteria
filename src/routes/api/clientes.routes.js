const router = require('express').Router();
const clienteController = require('../../controllers/cliente.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { body, query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/clientes
 * @desc    Listar clientes
 * @access  Private (clientes.ver)
 */
router.get('/',
    authorize('clientes.ver'),
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('search').optional().isString(),
        query('tipo_cliente').optional().isIn(['minorista', 'mayorista', 'corporativo']),
        handleValidationErrors
    ],
    clienteController.listar
);

/**
 * @route   GET /api/clientes/:id
 * @desc    Obtener cliente por ID
 * @access  Private (clientes.ver)
 */
router.get('/:id',
    authorize('clientes.ver'),
    clienteController.obtenerPorId
);

/**
 * @route   POST /api/clientes
 * @desc    Crear nuevo cliente
 * @access  Private (clientes.crear)
 */
router.post('/',
    authorize('clientes.crear'),
    [
        body('nombre').notEmpty().withMessage('El nombre es requerido'),
        body('ruc_dni').optional().isString(),
        body('direccion').optional().isString(),
        body('telefono').optional().isString(),
        body('email').optional().isEmail().withMessage('Email inválido'),
        body('tipo_cliente').optional().isIn(['minorista', 'mayorista', 'corporativo']),
        body('credito_disponible').optional().isFloat({ min: 0 }),
        handleValidationErrors
    ],
    clienteController.crear
);

/**
 * @route   PUT /api/clientes/:id
 * @desc    Actualizar cliente
 * @access  Private (clientes.editar)
 */
router.put('/:id',
    authorize('clientes.editar'),
    [
        body('nombre').optional().notEmpty(),
        body('email').optional().isEmail(),
        body('credito_disponible').optional().isFloat({ min: 0 }),
        handleValidationErrors
    ],
    clienteController.actualizar
);

/**
 * @route   DELETE /api/clientes/:id
 * @desc    Eliminar cliente (soft delete)
 * @access  Private (clientes.eliminar)
 */
router.delete('/:id',
    authorize('clientes.eliminar'),
    clienteController.eliminar
);

module.exports = router;
