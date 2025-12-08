const { MovInventario } = require('../models/movInventarios');

// Listar movimientos de inventario
function list() {
  return MovInventario.findAll();
}

// Crear movimiento de inventario
function save(data) {
  return MovInventario.create({
    producto_id: data.producto_id,
    tipo_movimiento: data.tipo_movimiento,
    cantidad: data.cantidad,
    fecha: data.fecha,
    motivo: data.motivo,
    referencia: data.referencia
  });
}

// Eliminar movimiento de inventario
function eliminar(id) {
  return MovInventario.destroy({
    where: { id }
  });
}

// Buscar para editar
function edit(id) {
  return MovInventario.findByPk(id);
}

// Actualizar movimiento de inventario
function updatee(id, newData) {
  return MovInventario.update(
    {
      producto_id: newData.producto_id,
      tipo_movimiento: newData.tipo_movimiento,
      cantidad: newData.cantidad,
      fecha: newData.fecha,
      motivo: newData.motivo,
      referencia: newData.referencia
    },
    {
      where: { id }
    }
  ).then(() => MovInventario.findByPk(id));
}

module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee
};
