const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Compras = sequelize.define("compras", {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW
  },
  usuario_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  proveedor_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  total: {
    type: Sequelize.DECIMAL(12, 2),
    allowNull: true
  },
  status: {
    type: Sequelize.ENUM('completada', 'cancelada', 'pendiente'),
    defaultValue: 'completada'
  },
  notas: {
    type: Sequelize.TEXT,
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

module.exports = { Compras };
