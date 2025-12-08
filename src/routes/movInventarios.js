const express = require("express");
const router = express.Router();
const movInventarioController = require('../controllers/movInventariosController');
const productosController = require('../controllers/productosController');

// Vista principal, pasa productos para el formulario
router.get('/movInventario', async (req, res) => {
  try {
    const movimientos = await movInventarioController.list();
    const productos = await productosController.list();
   
    res.render('movInventarios', { productos, movimientos: movimientos.map(m => m.dataValues) });

    
  } catch (err) {
    res.status(500).send(err);
  }
});

// Vista edición, pasa productos para el <select>
router.get('/movInventario/edit/:id', async (req, res) => {
  try {
    const movimiento = await movInventarioController.edit(req.params.id);
    const productos = await productosController.list();
    res.render('movInventarios_edit', { movimiento, productos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// API
router.get('/api/movInventario', async (req, res) => {
  try {
    const movimientos = await movInventarioController.list();
    res.status(200).json({ movimientos });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Agregar movimiento de inventario
router.post('/movInventario/add', async (req, res) => {
  try {
    await movInventarioController.save(req.body);
    res.redirect('/movInventarios');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Eliminar movimiento
router.get('/movInventario/delete/:id', async (req, res) => {
  try {
    await movInventarioController.eliminar(req.params.id);
    res.redirect('/movInventarios');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Editar movimiento por API (JSON)
router.get('/movInventario/update/:id', async (req, res) => {
  try {
    const movimiento = await movInventarioController.edit(req.params.id);
    res.status(200).json({ movimiento });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Actualiza (edición, pero responde JSON: puedes cambiarlo por redirect si usas formulario tradicional)
router.post('/movInventario/update/:id', async (req, res) => {
  try {
    await movInventarioController.updatee(req.params.id, req.body);
    res.redirect('/movInventarios');
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
