const { DetalleCompra } = require('../models/detalleCompras');

// Listar detalles de compra
function list() {
  return DetalleCompra.findAll();
}

// Crear detalle de compra
function save(data) {
  return DetalleCompra.create({
    compra_id: data.compra_id,
    producto_id: data.producto_id,
    cantidad: data.cantidad,
    precio_unit: data.precio_unit
  });
}

// Eliminar detalle de compra
function eliminar(id) {
  return DetalleCompra.destroy({
    where: { id }
  });
}

// Buscar para editar
function edit(id) {
  return DetalleCompra.findByPk(id);
}

// Actualizar detalle de compra
function updatee(id, newData) {
  return DetalleCompra.update(
    {
      compra_id: newData.compra_id,
      producto_id: newData.producto_id,
      cantidad: newData.cantidad,
      precio_unit: newData.precio_unit
    },
    {
      where: { id }
    }
  ).then(() => DetalleCompra.findByPk(id));
}

module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee
};
