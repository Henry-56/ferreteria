const express = require("express");
const router = express.Router();

const productosController = require('../controllers/productosController');
const rubrosController = require('../controllers/rubrosController');
const proveedoresController = require('../controllers/proveedoresController');

// Renderiza vista productos (listado)
router.get('/productos', async function(req, res) {
  try {
    const productos = await productosController.list();
    const rubros = await rubrosController.list();
    const proveedores = await proveedoresController.list();
    res.render('productos', {
      productos,
      rubros,
      proveedores
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Renderiza vista de edición de producto
router.get('/productos/edit/:id', async function(req, res) {
  try {
    const producto = await productosController.edit(req.params.id);
    const rubros = await rubrosController.list();
    const proveedores = await proveedoresController.list();
    res.render('productos_edit', {
      producto,
      rubros,
      proveedores
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Actualiza el producto y redirige al listado
router.post('/productos/update/:id', async function(req, res) {
  try {
    await productosController.updatee(req.params.id, req.body);
    res.redirect('/productos');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Solo este endpoint es API (JSON)
router.get('/api/productos', async function(req, res) {
  try {
    const productos = await productosController.list();
    res.status(200).json({ productos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Añadir nuevo producto
router.post('/productos/add', async function(req, res) {
  try {
    await productosController.save(req.body);
    res.redirect('/productos');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Eliminar producto y redirigir
router.get('/productos/delete/:id', async function(req, res) {
  try {
    await productosController.eliminar(req.params.id);
    res.redirect('/productos');
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
