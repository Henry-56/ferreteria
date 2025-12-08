const { DetalleVenta } = require('../models/detalleVentas');

// Listar detalles de venta
function list() {
  return DetalleVenta.findAll();
}

// Crear detalle de venta
function save(data) {
  return DetalleVenta.create({
    venta_id: data.venta_id,
    producto_id: data.producto_id,
    cantidad: data.cantidad,
    precio_unit: data.precio_unit,
    subtotal: data.subtotal
  });
}

// Eliminar detalle de venta
function eliminar(id) {
  return DetalleVenta.destroy({
    where: { id }
  });
}

// Buscar para editar
function edit(id) {
  return DetalleVenta.findByPk(id);
}

// Actualizar detalle de venta
function updatee(id, newData) {
  return DetalleVenta.update(
    {
      venta_id: newData.venta_id,
      producto_id: newData.producto_id,
      cantidad: newData.cantidad,
      precio_unit: newData.precio_unit,
      subtotal: newData.subtotal
    },
    {
      where: { id }
    }
  ).then(() => DetalleVenta.findByPk(id));
}

module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee
};
