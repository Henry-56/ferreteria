const authService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {

    /**
     * POST /api/auth/login
     * Iniciar sesión
     */
    async login(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Usuario y contraseña son requeridos'
                });
            }

            const result = await authService.login(username, password);

            return res.json({
                success: true,
                message: 'Inicio de sesión exitoso',
                data: result
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/register
     * Registrar nuevo usuario (solo admin)
     */
    async register(req, res, next) {
        try {
            const userData = req.body;

            const user = await authService.register(userData);

            return res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: user
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/refresh-token
     * Renovar access token
     */
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    message: 'Refresh token es requerido'
                });
            }

            const newToken = await authService.refreshAccessToken(refreshToken);

            return res.json({
                success: true,
                message: 'Token renovado exitosamente',
                data: { token: newToken }
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * GET /api/auth/me
     * Obtener usuario actual
     */
    async getMe(req, res, next) {
        try {
            const user = req.user;

            return res.json({
                success: true,
                data: user.toSafeObject()
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/change-password
     * Cambiar contraseña
     */
    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.id;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Contraseña actual y nueva son requeridas'
                });
            }

            if (newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'La nueva contraseña debe tener al menos 8 caracteres'
                });
            }

            await authService.changePassword(userId, currentPassword, newPassword);

            return res.json({
                success: true,
                message: 'Contraseña actualizada exitosamente'
            });

        } catch (error) {
            next(error);
        }
    }

    /**
     * POST /api/auth/logout
     * Cerrar sesión (lado cliente maneja eliminación de token)
     */
    async logout(req, res) {
        // En JWT, el logout se maneja generalmente en el cliente
        // eliminando el token. Aquí solo retornamos confirmación.
        logger.info(`Usuario "${req.user.username}" cerró sesión`);

        return res.json({
            success: true,
            message: 'Sesión cerrada exitosamente'
        });
    }
}

module.exports = new AuthController();
