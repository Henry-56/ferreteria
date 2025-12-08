const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const authConfig = require('../config/auth');
const logger = require('../utils/logger');

class AuthService {

    /**
     * Autenticar usuario con username y password
     */
    async login(username, password) {
        try {
            // Buscar usuario con su rol
            const user = await User.findOne({
                where: { username, activo: 1 },
                include: [{
                    model: Role,
                    as: 'rol'
                }]
            });

            if (!user) {
                logger.warn(`Intento de login fallido: usuario "${username}" no encontrado`);
                throw new Error('Usuario o contraseña incorrectos');
            }

            // Verificar contraseña
            const isValidPassword = await user.verifyPassword(password);
            if (!isValidPassword) {
                logger.warn(`Intento de login fallido: contraseña incorrecta para usuario "${username}"`);
                throw new Error('Usuario o contraseña incorrectos');
            }

            // Actualizar último acceso
            await user.update({ ultimo_acceso: new Date() });

            // Generar tokens
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);

            logger.info(`Usuario "${username}" inició sesión exitosamente`);

            return {
                user: user.toSafeObject(),
                token,
                refreshToken
            };
        } catch (error) {
            logger.error(`Error en login: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generar JWT access token
     */
    generateToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            rol_id: user.rol_id,
            rol_nombre: user.rol?.nombre
        };

        return jwt.sign(payload, authConfig.jwt.secret, {
            expiresIn: authConfig.jwt.expiresIn,
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience
        });
    }

    /**
     * Generar refresh token
     */
    generateRefreshToken(user) {
        const payload = {
            id: user.id,
            type: 'refresh'
        };

        return jwt.sign(payload, authConfig.jwt.refreshSecret, {
            expiresIn: authConfig.jwt.refreshExpiresIn,
            issuer: authConfig.jwt.issuer,
            audience: authConfig.jwt.audience
        });
    }

    /**
     * Verificar y decodificar token
     */
    async verifyToken(token) {
        try {
            // Verificar token
            const decoded = jwt.verify(token, authConfig.jwt.secret, {
                issuer: authConfig.jwt.issuer,
                audience: authConfig.jwt.audience
            });

            // Buscar usuario con rol
            const user = await User.findByPk(decoded.id, {
                include: [{
                    model: Role,
                    as: 'rol'
                }]
            });

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            if (user.activo === 0) {
                throw new Error('Usuario inactivo');
            }

            return user;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new Error('Token expirado');
            } else if (error.name === 'JsonWebTokenError') {
                throw new Error('Token inválido');
            }
            throw error;
        }
    }

    /**
     * Renovar access token usando refresh token
     */
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret, {
                issuer: authConfig.jwt.issuer,
                audience: authConfig.jwt.audience
            });

            const user = await User.findByPk(decoded.id, {
                include: [{
                    model: Role,
                    as: 'rol'
                }]
            });

            if (!user || user.activo === 0) {
                throw new Error('Usuario no autorizado');
            }

            const newToken = this.generateToken(user);
            logger.info(`Token renovado para usuario "${user.username}"`);

            return newToken;
        } catch (error) {
            logger.error(`Error al renovar token: ${error.message}`);
            throw new Error('Refresh token inválido');
        }
    }

    /**
     * Registrar nuevo usuario (solo para admin)
     */
    async register(userData) {
        try {
            // Validar que el rol existe
            const rol = await Role.findByPk(userData.rol_id);
            if (!rol) {
                throw new Error('Rol no válido');
            }

            // Crear usuario (el password se hashea automáticamente en el hook)
            const user = await User.create({
                username: userData.username,
                email: userData.email,
                password_hash: userData.password,
                nombre_completo: userData.nombre_completo,
                telefono: userData.telefono,
                rol_id: userData.rol_id,
                activo: 1
            });

            logger.info(`Nuevo usuario registrado: "${user.username}"`);

            return user.toSafeObject();
        } catch (error) {
            logger.error(`Error al registrar usuario: ${error.message}`);
            throw error;
        }
    }

    /**
     * Cambiar contraseña
     */
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User.findByPk(userId);

            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar contraseña actual
            const isValid = await user.verifyPassword(currentPassword);
            if (!isValid) {
                throw new Error('Contraseña actual incorrecta');
            }

            // Actualizar contraseña (se hashea automáticamente)
            await user.update({ password_hash: newPassword });

            logger.info(`Contraseña actualizada para usuario "${user.username}"`);

            return true;
        } catch (error) {
            logger.error(`Error al cambiar contraseña: ${error.message}`);
            throw error;
        }
    }
}

module.exports = new AuthService();
