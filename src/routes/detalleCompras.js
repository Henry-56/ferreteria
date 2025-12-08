const express = require("express");
const router = express.Router();
const detalleCompraController = require('../controllers/detalleComprasController');
const comprasController = require('../controllers/comprasController');
const productosController = require('../controllers/productosController');

// Vista principal con compras y productos para el formulario
router.get('/detalleCompra', async (req, res) => {
  try {
    const detalles = await detalleCompraController.list();
    const compras = await comprasController.list();
    const productos = await productosController.list();
    res.render('detalleCompras', { detalles, compras, productos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// API
router.get('/api/detalleCompra', async (req, res) => {
  try {
    const detalles = await detalleCompraController.list();
    res.status(200).json({ detalles });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Agregar detalle de compra
router.post('/detalleCompra/add', async (req, res) => {
  try {
    await detalleCompraController.save(req.body);
    res.redirect('/detalleCompra');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Eliminar detalle de compra
router.get('/detalleCompra/delete/:id', async (req, res) => {
  try {
    await detalleCompraController.eliminar(req.params.id);
    res.redirect('/detalleCompra');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Renderiza vista de edición de detalle de compra (compra/productos para selects)
router.get('/detalleCompra/edit/:id', async (req, res) => {
  try {
    const detalle = await detalleCompraController.edit(req.params.id);
    const compras = await comprasController.list();
    const productos = await productosController.list();
    res.render('detalleCompras_edit', { detalle, compras, productos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Actualizar detalle de compra (edit)
router.post('/detalleCompra/update/:id', async (req, res) => {
  try {
    await detalleCompraController.updatee(req.params.id, req.body);
    res.redirect('/detalleCompra');
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
