const { validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación de express-validator
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
                value: err.value
            }))
        });
    }

    next();
};

module.exports = { handleValidationErrors };
