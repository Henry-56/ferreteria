const Sequelize = require('sequelize');
const sequelize = require('../config/database');
const { STATUS } = require('../config/constants');

const Cliente = sequelize.define('clientes', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
    },
    ruc_dni: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true
    },
    direccion: {
        type: Sequelize.STRING(200),
        allowNull: true
    },
    telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
    },
    email: {
        type: Sequelize.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    tipo_cliente: {
        type: Sequelize.ENUM('minorista', 'mayorista', 'corporativo'),
        defaultValue: 'minorista'
    },
    credito_disponible: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0
    },
    activo: {
        type: Sequelize.TINYINT,
        defaultValue: STATUS.ACTIVO
    }
}, {
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ['ruc_dni'] },
        { fields: ['nombre'] }
    ]
});

module.exports = Cliente;
