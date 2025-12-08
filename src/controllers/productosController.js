const Productos = require('../models/productos');
const { Rubros } = require('../models/rubros'); // <-- AGREGA ESTA LINEA

// Listado de productos
function list() {
  return Productos.findAll({
    include: [{
      model: Rubros,
      as: 'rubro',
      attributes: ['nombre']
    }]
  });
}

async function productosConRubro() {

  try {
    const productos = await Productos.findAll({
      include: [{
        model: Rubros,
        as: 'rubro',
        attributes: ['nombre']
      }]
    });

    return productos.map(p => ({
      ...p.dataValues,
      rubro_nombre: p.rubro ? p.rubro.nombre : 'Sin categoría'
    }));
  } catch (error) {
    console.error("ERROR EN FINDALL PRODUCTOSCONRUBRO >>>", error);
    return [];
  }
}



// Crear producto
function save(data) {
  return Productos.create({
    nombre: data.nombre,
    descripcion: data.descripcion,
    id_rubro: data.id_rubro,
    precio_compra: data.precio_compra,
    precio_venta: data.precio_venta,
    stock: data.stock || 0,
    unidad: data.unidad,
    codigo: data.codigo,
    marca: data.marca,
    talla: data.talla,
    color: data.color,
    codigo_barra: data.codigo_barra,
    proveedor_id: data.proveedor_id,
    status: data.status !== undefined ? data.status : 1,
    descripcion_detalle: data.descripcion_detalle
  });
}

// Eliminar producto por id (soft delete recomendado para producción)
function eliminar(id) {
  return Productos.destroy({
    where: { id }
  });
}

// Buscar producto para editar por id
function edit(id) {
  return Productos.findByPk(id);
}

// Actualizar producto
function updatee(id, newData) {
  return Productos.update(
    {
      nombre: newData.nombre,
      descripcion: newData.descripcion,
      id_rubro: newData.id_rubro,
      precio_compra: newData.precio_compra,
      precio_venta: newData.precio_venta,
      stock: newData.stock,
      unidad: newData.unidad,
      codigo: newData.codigo,
      marca: newData.marca,
      talla: newData.talla,
      color: newData.color,
      codigo_barra: newData.codigo_barra,
      proveedor_id: newData.proveedor_id,
      status: newData.status,
      descripcion_detalle: newData.descripcion_detalle
    },
    {
      where: { id }
    }
  ).then(() => {
    return Productos.findByPk(id);
  });
}

module.exports = {
  list,
  save,
  eliminar,
  edit,
  updatee,
  productosConRubro
};
