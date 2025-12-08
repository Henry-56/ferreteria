const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Proveedores = sequelize.define("proveedores", {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  contacto: {
    type: Sequelize.STRING,
    allowNull: true
  },
  direccion: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
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
Proveedores.sync()
  .then(() => console.log("Sequelize models initialized Proveedores"))
  .catch(err => console.error("Error while initializing models: ", err));
  
module.exports = { Proveedores };

