const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const AuditoriaLog = sequelize.define('auditoria_logs', {
    id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    usuario_id: {
        type: Sequelize.BIGINT,
        allowNull: false
    },
    tabla: {
        type: Sequelize.STRING(50),
        allowNull: false
    },
    registro_id: {
        type: Sequelize.BIGINT,
        allowNull: true
    },
    accion: {
        type: Sequelize.ENUM('crear', 'actualizar', 'eliminar', 'consultar'),
        allowNull: false
    },
    datos_anteriores: {
        type: Sequelize.JSON,
        allowNull: true
    },
    datos_nuevos: {
        type: Sequelize.JSON,
        allowNull: true
    },
    ip_address: {
        type: Sequelize.STRING(50),
        allowNull: true
    },
    user_agent: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    metodo_http: {
        type: Sequelize.STRING(10),
        allowNull: true
    },
    ruta: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    duracion_ms: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    exito: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
    },
    mensaje_error: {
        type: Sequelize.TEXT,
        allowNull: true
    }
}, {
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { fields: ['usuario_id'] },
        { fields: ['tabla'] },
        { fields: ['accion'] },
        { fields: ['created_at'] },
        { fields: ['exito'] }
    ]
});

module.exports = AuditoriaLog;
