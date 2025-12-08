const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Ventas = sequelize.define("ventas", {
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
  cliente_id: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  tipo_comprobante: {
    type: Sequelize.ENUM('boleta', 'factura', 'ticket'),
    defaultValue: 'ticket'
  },
  numero_comprobante: {
    type: Sequelize.STRING(50),
    allowNull: true
  },
  metodo_pago: {
    type: Sequelize.ENUM('efectivo', 'tarjeta', 'transferencia', 'mixto'),
    defaultValue: 'efectivo'
  },
  monto_efectivo: {
    type: Sequelize.DECIMAL(12, 2),
    defaultValue: 0
  },
  monto_tarjeta: {
    type: Sequelize.DECIMAL(12, 2),
    defaultValue: 0
  },
  monto_transferencia: {
    type: Sequelize.DECIMAL(12, 2),
    defaultValue: 0
  },
  subtotal: {
    type: Sequelize.DECIMAL(12, 2),
    allowNull: false
  },
  descuento: {
    type: Sequelize.DECIMAL(12, 2),
    defaultValue: 0
  },
  impuesto: {
    type: Sequelize.DECIMAL(12, 2),
    defaultValue: 0
  },
  total: {
    type: Sequelize.DECIMAL(12, 2),
    allowNull: false
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
}, {
  timestamps: true,
  underscored: false
});

// Relaciones se manejan en models/index.js

module.exports = { Ventas };
