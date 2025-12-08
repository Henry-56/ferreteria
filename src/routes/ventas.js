const express = require("express");
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { productosConRubro } = require('../controllers/productosController'); // Importa la función correcta




// Vista para registrar una venta nueva (venta + detalles)
router.get('/ventas/nueva', async (req, res) => {
  try {
    const productos = await productosConRubro();
    const fechaActual = new Date().toISOString().slice(0,10);

    res.render('ventas_nueva', { productos, fechaActual });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Procesa la venta nueva y sus detalles
router.post('/ventas/add', async (req, res) => {
  try {
    const { fecha, usuario } = req.body;
    // Obtiene los valores enviados como string o array
    const productoIds = req.body['detalle[producto_id][]'];
    const cantidades = req.body['detalle[cantidad][]'];
    const precios = req.body['detalle[precio_unit][]'];

    // Asegura que sean arrays siempre (aunque haya solo 1 producto)
    const productoIdsArray = Array.isArray(productoIds) ? productoIds : [productoIds];
    const cantidadesArray = Array.isArray(cantidades) ? cantidades : [cantidades];
    const preciosArray = Array.isArray(precios) ? precios : [precios];

    // Calcula el total
    let total = 0;
    for (let i = 0; i < productoIdsArray.length; i++) {
      total += Number(cantidadesArray[i]) * Number(preciosArray[i]);
    }

    // Crea la venta/cabecera incluyendo el TOTAL
    const ventaCreada = await ventasController.save({ fecha, usuario, total });

    // Inserta detalles
    for (let i = 0; i < productoIdsArray.length; i++) {
      await ventasController.addDetalle({
        venta_id: ventaCreada.id,
        producto_id: productoIdsArray[i],
        cantidad: cantidadesArray[i],
        precio_unit: preciosArray[i],
        subtotal: Number(cantidadesArray[i]) * Number(preciosArray[i])
      });
    }
    res.redirect('/ventas/nueva');
  } catch (err) {
    console.log(err);
    res.status(500).send("Error guardando la venta y sus detalles");
  }
});




// Puedes mantener los endpoints API si los quieres para administración:
router.get('/api/ventas', async (req, res) => {
  try {
    const ventas = await ventasController.list();
    res.status(200).json({ ventas });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Reporte filtrado de ventas
router.get('/ventasReporte', async (req, res) => {
  try {
    console.log("ENTRANDO A REPORTE DE VENTAS (GET)");
    // Por defecto, mostrar mes actual
    const now = new Date();
    const primerDiaMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
    const ultimoDiaMes = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
    const ventas = await ventasController.filtradoPorFecha(primerDiaMes, ultimoDiaMes);
    res.render('ventas_reporte', { ventas, desde: primerDiaMes, hasta: ultimoDiaMes, tipo: 'mes' });
  } catch (error) {
    console.error("ERROR EN REPORTE DE VENTAS (GET):", error);
    res.status(500).send("Error al cargar reporte de ventas");
  }
});


router.post('/ventasReporte', async (req, res) => {
  try {
    console.log("ENTRANDO A REPORTE DE VENTAS (POST)");
    const { desde, hasta, tipo } = req.body;
    const ventas = await ventasController.filtradoPorFecha(desde, hasta);
    res.render('ventas_reporte', { ventas, desde, hasta, tipo });
  } catch (error) {
    console.error("ERROR EN REPORTE DE VENTAS (POST):", error);
    res.status(500).send("Error al filtrar reporte de ventas");
  }
});

// Ruta para mostrar la vista de edición de una venta existente (EDITAR)
router.get('/ventas/edit/:id', async (req, res) => {
  
  try {
    console.log("Venta obtenida para edición:", req.params.id);
    const venta = await ventasController.edit(req.params.id); // Busca la venta principal (cabecera)
    const productos = await productosConRubro();
    const detalles = await ventasController.detallesPorVenta(req.params.id); // Agrega esta línea para obtener el detalle
    
    if (!venta) return res.status(404).send("Venta no encontrada");
    // Ahora envía los detalles junto con venta y productos a la vista
    res.render('ventas_edit', { venta, productos, detalles });
    
  } catch (err) {
    res.status(500).send("Error mostrando la edición de venta");
  }
});


// Ruta para actualizar datos de una venta (ACTUALIZAR)
router.post('/ventas/update/:id', async (req, res) => {
  try {
    const { fecha, usuario, total } = req.body;
    const ventaId = req.params.id;
    console.log("Datos recibidos para actualizar venta ID", ventaId, ":", req.body);
    // 1. Parsear detalles del body a array
    const detallesForm = [];
    let i = 0;
    while (req.body[`detalles[${i}][id]`] !== undefined) {
      detallesForm.push({
        id: req.body[`detalles[${i}][id]`],
        cantidad: req.body[`detalles[${i}][cantidad]`],
        precio_unit: req.body[`detalles[${i}][precio_unit]`],
        subtotal: req.body[`detalles[${i}][subtotal]`]
      });
      i++;
    }

    // 2. Llamar a la función del controlador con el array
    await ventasController.actualizarVentaConDetalles(ventaId, {
      fecha,
      usuario,
      total,
      detalles: detallesForm // <--- ¡ES UN ARRAY!
    });
    
    res.redirect('/ventas/edit/' + ventaId);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error actualizando la venta");
  }
});



// Ruta para eliminar una venta (ELIMINAR)
router.post('/ventas/delete/:id', async (req, res) => {
  try {
    console.log("Eliminando venta ID:", req.params.id);
    await ventasController.eliminar(req.params.id);
    res.redirect('/ventasReporte');
  } catch (err) {
    res.status(500).send("Error eliminando la venta");
  }
});


module.exports = router;
