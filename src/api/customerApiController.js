const { Categorias } = require('../models/categorias');

const Productos = require('../models/productos');

function listJSONC() {
  return Categorias.findAll();
};


function listJSONP() {
  return Productos.findAll();
};



module.exports = {
  listJSONC,
  listJSONP

}

