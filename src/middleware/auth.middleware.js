const authService = require('../services/auth.service');
const logger = require('../utils/logger');
const { ROLES } = require('../config/constants');

/**
 * Middleware para verificar autenticación
 */
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporcionó token de autenticación'
            });
        }

        // Extraer token del header "Bearer TOKEN"
        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido. Use: Bearer {token}'
            });
        }

        const token = parts[1];

        // Verificar token
        const user = await authService.verifyToken(token);

        // Agregar usuario al request para usar en siguientes middlewares
        req.user = user;
        next();

    } catch (error) {
        logger.warn(`Intento de acceso con token inválido: ${error.message}`);
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado',
            error: error.message
        });
    }
};

/**
 * Middleware para verificar permisos
 * Uso: authorize('ventas.crear', 'ventas.ver')
 */
const authorize = (...permisosRequeridos) => {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            // Si es admin, permitir todo
            if (user.rol?.nombre === ROLES.ADMIN) {
                return next();
            }

            // Verificar si tiene al menos uno de los permisos requeridos
            const tienePermiso = permisosRequeridos.some(permiso =>
                user.rol?.hasPermission(permiso)
            );

            if (!tienePermiso) {
                logger.warn(`Usuario "${user.username}" intentó acceder sin permisos: ${permisosRequeridos.join(', ')}`);
                return res.status(403).json({
                    success: false,
                    message: 'No tiene permisos para realizar esta acción',
                    permisosRequeridos
                });
            }

            next();

        } catch (error) {
            logger.error(`Error al verificar permisos: ${error.message}`);
            return res.status(500).json({
                success: false,
                message: 'Error al verificar permisos',
                error: error.message
            });
        }
    };
};

/**
 * Middleware opcional de autenticación (no falla si no hay token)
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (authHeader) {
            const parts = authHeader.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
                const token = parts[1];
                const user = await authService.verifyToken(token);
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // No fallar, simplemente continuar sin usuario
        next();
    }
};

module.exports = {
    authenticate,
    authorize,
    optionalAuth
};
