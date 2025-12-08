const { Compras } = require('../models/compras');
const { MovInventario } = require('../models/movInventarios');
const Productos = require('../models/productos');
const { DetalleCompra } = require('../models/detalleCompras');
const { Proveedores } = require('../models/proveedores');

// Listar compras
function list() {
  return Compras.findAll({
    include: [
      {
        model: DetalleCompra,
        as: 'detalles',
        include: [
          { model: Productos, as: 'producto' }
        ]
      },
      {
        model: Proveedores,
        as: 'proveedor'
      }
    ]
  });
}


// Crear compra
function save(data) {
  return Compras.create({
    fecha: data.fecha,
    proveedor_id: data.proveedor_id,
    total: data.total
  });
}

// Agregar detalle a una compra
function addDetalle(data) {
  // data = { compra_id, producto_id, cantidad, precio_unit, subtotal }
  return DetalleCompra.create(data);
}

// Eliminar compra
function eliminar(id) {
  return Compras.destroy({
    where: { id }
  });
}

// Buscar para editar
function edit(id) {
  return Compras.findByPk(id);
}

// Actualizar compra
function updatee(id, newData) {
  return Compras.update(
    {
      fecha: newData.fecha,
      proveedor_id: newData.proveedor_id,
      total: newData.total
    },
    {
      where: { id }
    }
  ).then(() => Compras.findByPk(id));
}

// Obtener una compra con todos sus detalles
function getCompraConDetalles(id) {
  return Compras.findByPk(id, {
    include: [{
      model: DetalleCompra,
      as: 'detalles'
    }]
  });
}

// Agregar movimiento de inventario tipo ENTRADA
function addMovimientoEntrada(data) {
  // data = { producto_id, cantidad, fecha, motivo, referencia }
  return MovInventario.create({
    producto_id: data.producto_id,
    tipo_movimiento: 'entrada',
    cantidad: data.cantidad,
    fecha: data.fecha,
    motivo: data.motivo || 'Compra',
    referencia: data.referencia || null
  });
}

// Actualiza el stock sumando (para entradas)
async function actualizarStockEntrada(producto_id, cantidad) {
  const producto = await Productos.findByPk(producto_id);
  if (producto) {
    producto.stock += cantidad;
    await producto.save();
  }
}

module.exports = {
  list,
  save,
  addDetalle,
  eliminar,
  edit,
  updatee,
  getCompraConDetalles,
  addMovimientoEntrada,
  actualizarStockEntrada
};
