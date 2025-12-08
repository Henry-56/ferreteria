const { Rubros } = require('../models/rubros');

// Listar rubros
function list() {
  return Rubros.findAll();
}

// Crear rubro
function save(data) {
  return Rubros.create({
    nombre: data.nombre,
    descripcion: data.descripcion
  });
}

// Eliminar rubro por id
function eliminar(id) {
  return Rubros.destroy({
    where: { id }
  });
}

// Buscar para editar por id
function edit(id) {
  return Rubros.findByPk(id);
}

// Actualizar rubro
function updatee(id, newData) {
  return Rubros.update(
    {
      nombre: newData.nombre,
      descripcion: newData.descripcion
    },
    {
      where: { id }
    }
  ).then(() => Rubros.findByPk(id));
}

module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee
};
