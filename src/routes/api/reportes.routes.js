const router = require('express').Router();
const reporteController = require('../../controllers/reporte.controller');
const { authenticate, authorize } = require('../../middleware/auth.middleware');
const { query } = require('express-validator');
const { handleValidationErrors } = require('../../middleware/validation.middleware');

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/reportes/dashboard
 * @desc    Obtener KPIs del dashboard
 * @access  Private (reportes.ver)
 */
router.get('/dashboard',
    authorize('reportes.ver'),
    reporteController.dashboard
);

/**
 * @route   GET /api/reportes/ventas
 * @desc    Reporte de ventas por período
 * @access  Private (reportes.ver)
 */
router.get('/ventas',
    authorize('reportes.ver'),
    [
        query('fecha_inicio').isISO8601().withMessage('Fecha de inicio inválida'),
        query('fecha_fin').isISO8601().withMessage('Fecha de fin inválida'),
        query('agrupar_por').optional().isIn(['dia', 'semana', 'mes']),
        handleValidationErrors
    ],
    reporteController.ventas
);

/**
 * @route   GET /api/reportes/productos-mas-vendidos
 * @desc    Top productos más vendidos
 * @access  Private (reportes.ver)
 */
router.get('/productos-mas-vendidos',
    authorize('reportes.ver'),
    [
        query('limit').optional().isInt({ min: 1, max: 100 }),
        query('fecha_inicio').optional().isISO8601(),
        query('fecha_fin').optional().isISO8601(),
        handleValidationErrors
    ],
    reporteController.productosMasVendidos
);

/**
 * @route   GET /api/reportes/ventas-por-rubro
 * @desc    Ventas agrupadas por rubro/categoría
 * @access  Private (reportes.ver)
 */
router.get('/ventas-por-rubro',
    authorize('reportes.ver'),
    [
        query('fecha_inicio').optional().isISO8601(),
        query('fecha_fin').optional().isISO8601(),
        handleValidationErrors
    ],
    reporteController.ventasPorRubro
);

module.exports = router;
