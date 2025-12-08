const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const DetalleCompra = sequelize.define("detalle_compra", {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  compra_id: {
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
  precio_unit: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false
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

// No definir relaciones aquí - se manejan en models/index.js

module.exports = { DetalleCompra };
