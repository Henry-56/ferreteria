require('dotenv').config();

module.exports = {
    jwt: {
        secret: process.env.JWT_SECRET || 'secret_cambiar_en_produccion',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_secret_cambiar_en_produccion',
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
        issuer: 'pos-multiservicios',
        audience: 'pos-api'
    },
    bcrypt: {
        saltRounds: 10
    },
    passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false // Cambiar a true en producción
    }
};
