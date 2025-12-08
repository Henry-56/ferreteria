const express = require('express');
const router = express.Router();
const productoController = require('../../controllers/producto.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { upload, handleMulterError } = require('../../middleware/upload.middleware');
const { PERMISSIONS } = require('../../config/constants');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

// Validaciones
const productoValidation = [
    body('nombre').trim().notEmpty().withMessage('El nombre es requerido').isLength({ min: 2, max: 200 }),
    body('id_rubro').isInt({ min: 1 }).withMessage('Rubro inválido'),
    body('precio_venta').isDecimal().withMessage('Precio de venta inválido').custom(v => v > 0),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock inválido'),
    handleValidationErrors
];

//GET /api/productos - Listar productos
router.get('/',
    authorize(PERMISSIONS.PRODUCTOS_VER),
    productoController.listar
);

// GET /api/productos/barcode/:codigo - Buscar por código de barras
router.get('/barcode/:codigo',
    authorize(PERMISSIONS.PRODUCTOS_VER),
    productoController.buscarPorCodigoBarras
);

// GET /api/productos/:id - Obtener producto
router.get('/:id',
    authorize(PERMISSIONS.PRODUCTOS_VER),
    param('id').isInt(),
    handleValidationErrors,
    productoController.obtener
);

// POST /api/productos - Crear producto
router.post('/',
    authorize(PERMISSIONS.PRODUCTOS_CREAR),
    productoValidation,
    productoController.crear
);

// PUT /api/productos/:id - Actualizar producto
router.put('/:id',
    authorize(PERMISSIONS.PRODUCTOS_EDITAR),
    param('id').isInt(),
    handleValidationErrors,
    productoController.actualizar
);

// DELETE /api/productos/:id - Eliminar producto
router.delete('/:id',
    authorize(PERMISSIONS.PRODUCTOS_ELIMINAR),
    param('id').isInt(),
    handleValidationErrors,
    productoController.eliminar
);

// POST /api/productos/:id/ajustar-stock - Ajustar stock
router.post('/:id/ajustar-stock',
    authenticate,
    authorize(PERMISSIONS.PRODUCTOS_AJUSTAR_STOCK),
    param('id').isInt(),
    body('nuevoStock').isInt({ min: 0 }),
    body('motivo').optional().trim(),
    handleValidationErrors,
    productoController.ajustarStock
);

// POST /api/productos/:id/imagen - Subir imagen de producto
router.post('/:id/imagen',
    authenticate,
    authorize(PERMISSIONS.PRODUCTOS_EDITAR),
    param('id').isInt(),
    handleValidationErrors,
    upload.single('imagen'),
    handleMulterError,
    productoController.subirImagen
);

// DELETE /api/productos/:id/imagen - Eliminar imagen de producto
router.delete('/:id/imagen',
    authenticate,
    authorize(PERMISSIONS.PRODUCTOS_EDITAR),
    param('id').isInt(),
    handleValidationErrors,
    productoController.eliminarImagen
);

module.exports = router;
