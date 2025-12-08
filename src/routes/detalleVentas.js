const express = require("express");
const router = express.Router();
const detalleVentaController = require('../controllers/detalleVentasController');
const ventasController = require('../controllers/ventasController');
const productosController = require('../controllers/productosController');

// Vista principal: Detalles + ventas/productos para el formulario
router.get('/detalleVenta', async (req, res) => {
  try {
    const detalles = await detalleVentaController.list();
    const ventas = await ventasController.list();
    const productos = await productosController.list();
    res.render('detalleVentas', { detalles, ventas, productos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// API
router.get('/api/detalleVenta', async (req, res) => {
  try {
    const detalles = await detalleVentaController.list();
    res.status(200).json({ detalles });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Agregar detalle venta
router.post('/detalleVenta/add', async (req, res) => {
  try {
    await detalleVentaController.save(req.body);
    res.redirect('/detalleVentas');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Eliminar detalle venta
router.get('/detalleVenta/delete/:id', async (req, res) => {
  try {
    await detalleVentaController.eliminar(req.params.id);
    res.redirect('/detalleVentas');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Vista edición
router.get('/detalleVenta/edit/:id', async (req, res) => {
  try {
    const detalle = await detalleVentaController.edit(req.params.id);
    const ventas = await ventasController.list();
    const productos = await productosController.list();
    res.render('detalleVentas_edit', { detalle, ventas, productos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Actualiza (edición)
router.post('/detalleVenta/update/:id', async (req, res) => {
  try {
    await detalleVentaController.updatee(req.params.id, req.body);
    res.redirect('/detalleVentas');
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
