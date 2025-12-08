const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Role = sequelize.define('roles', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
    },
    descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
    },
    permisos: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
    }
}, {
    timestamps: true,
    underscored: true
});

// Método para verificar permiso específico
Role.prototype.hasPermission = function (permiso) {
    return this.permisos[permiso] === true;
};

module.exports = Role;
