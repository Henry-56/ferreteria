const { Ventas } = require('../models/ventas');
const Sequelize = require('sequelize');
const { DetalleVenta } = require('../models/detalleVentas');
const Productos = require('../models/productos'); // importa el modelo
const { Rubros } = require('../models/rubros'); // <-- AGREGA ESTA LINEA

// Listar ventas
function list() {
  return Ventas.findAll();
}

// Crear venta
function save(data) {
  console.log("Guardando venta con datos:", data);
  return Ventas.create({
    fecha: data.fecha,
    usuario: data.usuario,
    total: data.total
  });
}

// Eliminar venta
function eliminar(id) {
  return Ventas.destroy({
    where: { id }
  });
}

// Buscar para editar
function edit(id) {
  return Ventas.findByPk(id);
}

// Actualizar venta
function updatee(id, newData) {
  return Ventas.update(
    {
      fecha: newData.fecha,
      usuario: newData.usuario,
      total: newData.total
    },
    {
      where: { id }
    }
  ).then(() => Ventas.findByPk(id));
}

// Filtrar ventas por rango de fechas
async function filtradoPorFecha(desde, hasta) {
  console.log("Filtrando ventas desde", desde, "hasta", hasta);
  try {
    const ventas = await Ventas.findAll({
      where: {
        fecha: {
          [Sequelize.Op.between]: [desde, hasta]
        }
      },
      order: [['fecha', 'ASC']]
    });
    return ventas;
  } catch (error) {
    console.error("Error en filtradoPorFecha:", error);
    return [];
  }
}

function addDetalle(data) {
  // data = { venta_id, producto_id, cantidad, precio_unit, subtotal }
  return DetalleVenta.create(data);
}

// Obtener los detalles de una venta (puedes hacer include del modelo Producto si quieres más datos)
function detallesPorVenta(venta_id) {
  return DetalleVenta.findAll({
    where: { venta_id },
    include: [{
      model: Productos,
      as: 'producto',
      attributes: ['nombre', 'descripcion', 'id_rubro', 'precio_venta'],
      include: [{
        model: Rubros,
        as: 'rubro',
        attributes: ['nombre']
      }]
    }]
  });
}


async function actualizarDetalles(venta_id, { productoIds, cantidades, precios }) {
  // Elimina todos los detalles actuales de esa venta
  await DetalleVenta.destroy({ where: { venta_id } });
  // Inserta los nuevos detalles
  for (let i = 0; i < productoIds.length; i++) {
    await DetalleVenta.create({
      venta_id,
      producto_id: productoIds[i],
      cantidad: cantidades[i],
      precio_unit: precios[i],
      subtotal: Number(cantidades[i]) * Number(precios[i])
    });
  }
}
async function actualizarVentaConDetalles(idVenta, newData) {
  // Actualiza la venta principal
  await updatee(idVenta, {
    fecha: newData.fecha,
    usuario: newData.usuario,
    total: newData.total
  });

  // newData.detalles es un array
  for (const det of newData.detalles) {
    await DetalleVenta.update(
      {
        cantidad: det.cantidad,
        precio_unit: det.precio_unit,
        subtotal: det.subtotal
      },
      { where: { id: det.id } }
    );
  }
}



module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee,
  filtradoPorFecha,
  addDetalle,
  detallesPorVenta,
  actualizarDetalles,
  actualizarVentaConDetalles
};
