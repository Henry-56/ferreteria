const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const MovInventario = sequelize.define("mov_inventario", {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  producto_id: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  tipo_movimiento: {
    type: Sequelize.STRING,
    allowNull: false
  },
  cantidad: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  fecha: {
    type: Sequelize.DATE,
    allowNull: false
  },
  motivo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  referencia: {
    type: Sequelize.STRING,
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
MovInventario.sync()
  .then(() => console.log("Sequelize models initialized MovInventario"))
  .catch(err => console.error("Error while initializing models: ", err));

module.exports = { MovInventario };

