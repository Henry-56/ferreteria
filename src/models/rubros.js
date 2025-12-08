const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Rubros = sequelize.define("rubros", {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: Sequelize.STRING,
    allowNull: false
  },
  descripcion: {
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

Rubros.sync()
  .then(() => console.log("Sequelize models initialized rubros"))
  .catch(err => console.error("Error while initializing models: ", err));

module.exports = { Rubros };

