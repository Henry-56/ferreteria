const { Proveedores } = require('../models/proveedores');

// Listar proveedores
function list() {
  return Proveedores.findAll();
}

// Crear proveedor
function save(data) {
  return Proveedores.create({
    nombre: data.nombre,
    contacto: data.contacto,
    direccion: data.direccion,
    email: data.email
  });
}

// Eliminar proveedor
function eliminar(id) {
  return Proveedores.destroy({
    where: { id }
  });
}

// Buscar para editar
function edit(id) {
  return Proveedores.findByPk(id);
}

// Actualizar proveedor
function updatee(id, newData) {
  return Proveedores.update(
    {
      nombre: newData.nombre,
      contacto: newData.contacto,
      direccion: newData.direccion,
      email: newData.email
    },
    {
      where: { id }
    }
  ).then(() => Proveedores.findByPk(id));
}

module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee
};
