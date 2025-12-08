const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');
const { STATUS } = require('../config/constants');

const User = sequelize.define('usuarios', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false,
        validate: {
            len: [3, 50],
            isAlphanumeric: true
        }
    },
    email: {
        type: Sequelize.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    nombre_completo: {
        type: Sequelize.STRING(100),
        allowNull: true
    },
    telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    rol_id: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    activo: {
        type: Sequelize.TINYINT,
        defaultValue: STATUS.ACTIVO
    },
    ultimo_acceso: {
        type: Sequelize.DATE,
        allowNull: true
    }
}, {
    timestamps: true,
    underscored: true,
    hooks: {
        beforeCreate: async (user) => {
            if (user.password_hash) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password_hash')) {
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        }
    }
});

// Método para verificar contraseña
User.prototype.verifyPassword = async function (password) {
    return await bcrypt.compare(password, this.password_hash);
};

// Método para obtener datos públicos (sin password)
User.prototype.toSafeObject = function () {
    const { password_hash, ...safeUser } = this.toJSON();
    return safeUser;
};

module.exports = User;
