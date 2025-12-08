const express = require("express");
const router = express.Router();
const comprasController = require('../controllers/comprasController');
const proveedoresController = require('../controllers/proveedoresController');

// Listado de compras (vista principal, pasar proveedores para el formulario)
router.get('/compras', async (req, res) => {
  try {
    console.log("Obteniendo compras para reporte...");
    const compras = await comprasController.list();
    console.log("Compras obtenidas para reporte:", compras);
    
    res.render('compras_reporte', { compras }); // ya no necesitas pasar proveedores por separado
    
  } catch (err) {
    res.status(500).send(err);
  }
});


// API: listado de compras en formato JSON
router.get('/api/compras', async (req, res) => {
  try {
    const compras = await comprasController.list();
    res.status(200).json({ compras });
  } catch (err) {
    res.status(500).send(err);
  }
});



// Eliminar compra
router.get('/compras/delete/:id', async (req, res) => {
  try {
    await comprasController.eliminar(req.params.id);
    res.redirect('/compras');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Renderiza vista de edición de compra
router.get('/compras/edit/:id', async (req, res) => {
  try {
    const compra = await comprasController.edit(req.params.id);
    const proveedores = await proveedoresController.list();
    res.render('compras_edit', { compra, proveedores });
  } catch (err) {
    res.status(500).send(err);
  }
});



// Nueva compra con detalles de productos
router.get('/compras/nueva', async (req, res) => {
  try {
    const proveedores = await proveedoresController.list();
    // Puedes agregar todos los productos aquí si los quieres para elegir
    const productos = await require('../controllers/productosController').productosConRubro();
    res.render('compras_nueva', { proveedores, productos, fechaActual: new Date().toISOString().slice(0,10) });
  } catch (err) {
    res.status(500).send(err);
  }
});
router.post('/compras/add', async (req, res) => {
  try {
    const { fecha, proveedor_id, total, detalle } = req.body; // <-- recibe total del frontend

    // 1. Guarda cabecera de compra
    const compraCreada = await comprasController.save({ fecha, proveedor_id, total });

    // 2. Recorrer y guardar cada DETALLE + MOVIMIENTO
    if (Array.isArray(detalle)) {
      for (const item of detalle) {
        // Guardar detalle de la compra
        await comprasController.addDetalle({
          compra_id: compraCreada.id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unit: item.precio_unit,
          subtotal: item.cantidad * item.precio_unit
        });
        // Registrar el movimiento de inventario tipo 'entrada'
        await comprasController.addMovimientoEntrada({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          fecha: fecha,
          motivo: 'Compra',
          referencia: compraCreada.id
        });
         if (comprasController.actualizarStockEntrada) {
          await comprasController.actualizarStockEntrada(item.producto_id, item.cantidad);
        }
      }
    }
    res.redirect('/compras/nueva');
  } catch (err) {
    console.log(err);
    res.status(500).send("Error guardando la compra y sus detalles");
  }
});


router.get('/compras/:id', async (req, res) => {
  try {
    const compra = await comprasController.getCompraConDetalles(req.params.id);
    res.render('compras_show', { compra });
  } catch (err) {
    res.status(500).send(err);
  }
});




module.exports = router;
