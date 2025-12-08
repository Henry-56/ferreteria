const express = require("express");
const router = express.Router();
const proveedoresController = require('../controllers/proveedoresController');

router.get('/proveedores', async (req, res) => {
  try {
    const proveedores = await proveedoresController.list();
    res.render('proveedores', { proveedores });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/api/proveedores', async (req, res) => {
  try {
    const proveedores = await proveedoresController.list();
    res.status(200).json({ proveedores });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/proveedores/add', async (req, res) => {
  try {
    await proveedoresController.save(req.body);
    res.redirect('/proveedores');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/proveedores/delete/:id', async (req, res) => {
  try {
    await proveedoresController.eliminar(req.params.id);
    res.redirect('/proveedores');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/proveedores/update/:id', async (req, res) => {
  try {
    const proveedor = await proveedoresController.edit(req.params.id);
    res.status(200).json({ proveedor });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/proveedores/update/:id', async (req, res) => {
  try {
    const proveedor = await proveedoresController.updatee(req.params.id, req.body);
    res.status(200).json({ proveedor });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
