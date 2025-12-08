const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const DetalleVenta = sequelize.define("detalle_venta", {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  venta_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  producto_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  cantidad: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  precio_unitario: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  descuento_unitario: {
    type: Sequelize.DECIMAL(10, 2),
    defaultValue: 0
  },
  subtotal: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
  },
  costo_unitario: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  utilidad: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: true
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: true
  }
});

// Relaciones se manejan en models/index.js

module.exports = { DetalleVenta };
