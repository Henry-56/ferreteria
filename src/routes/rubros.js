const express = require("express");
const router = express.Router();
const rubrosController = require('../controllers/rubrosController');

router.get('/rubros', async (req, res) => {
  try {
    const rubros = await rubrosController.list();
    res.render('rubros', { rubros });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/api/rubros', async (req, res) => {
  try {
    const rubros = await rubrosController.list();
    res.status(200).json({ rubros });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/rubros/add', async (req, res) => {
  try {
    await rubrosController.save(req.body);
    res.redirect('/rubros');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/rubros/delete/:id', async (req, res) => {
  try {
    await rubrosController.eliminar(req.params.id);
    res.redirect('/rubros');
  } catch (err) {
    res.status(500).send(err);
  }
});

router.get('/rubros/update/:id', async (req, res) => {
  try {
    const rubros = await rubrosController.edit(req.params.id);
    res.status(200).json({ rubros });
  } catch (err) {
    res.status(500).send(err);
  }
});

router.post('/rubros/update/:id', async (req, res) => {
  try {
    const rubro = await rubrosController.updatee(req.params.id, req.body);
    res.status(200).json({ rubros: rubro });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = router;
