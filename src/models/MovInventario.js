const sequelize = require('../config/database');
const Producto = require('./productos');
const { Rubros } = require('./rubros');
const User = require('./User');
const { TIPO_MOVIMIENTO } = require('../config/constants');

const MovInventario = sequelize.define('mov_inventarios', {
    id: {
        type: sequelize.Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true
    },
    producto_id: {
        type: sequelize.Sequelize.BIGINT,
        allowNull: false
    },
    usuario_id: {
        type: sequelize.Sequelize.BIGINT,
        allowNull: false
    },
    tipo_movimiento: {
        type: sequelize.Sequelize.ENUM(
            TIPO_MOVIMIENTO.ENTRADA,
            TIPO_MOVIMIENTO.SALIDA,
            TIPO_MOVIMIENTO.AJUSTE
        ),
        allowNull: false
    },
    cantidad: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
    },
    stock_anterior: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
    },
    stock_nuevo: {
        type: sequelize.Sequelize.INTEGER,
        allowNull: false
    },
    referencia: {
        type: sequelize.Sequelize.STRING(50),
        allowNull: true
    },
    referencia_id: {
        type: sequelize.Sequelize.BIGINT,
        allowNull: true
    },
    motivo: {
        type: sequelize.Sequelize.TEXT,
        allowNull: true
    },
    fecha: {
        type: sequelize.Sequelize.DATE,
        allowNull: false,
        defaultValue: sequelize.Sequelize.NOW
    }
}, {
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
        { fields: ['producto_id'] },
        { fields: ['usuario_id'] },
        { fields: ['tipo_movimiento'] },
        { fields: ['fecha'] }
    ]
});

module.exports = MovInventario;
