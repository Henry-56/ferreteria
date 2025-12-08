// Reportes
document.addEventListener('DOMContentLoaded', async () => {
    // Proteger ruta
    auth.redirectIfNotAuthenticated();

    // Cargar usuario
    const user = auth.getUser();
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.rol?.nombre || 'Usuario';
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const confirmed = await utils.confirm('¿Cerrar sesión?');
        if (confirmed) {
            auth.logout();
            window.location.href = '/views/login.html';
        }
    });

    // Establecer fechas por defecto (última semana)
    const hoy = new Date();
    const haceUnaSemana = new Date();
    haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);

    document.getElementById('fechaFin').valueAsDate = hoy;
    document.getElementById('fechaInicio').valueAsDate = haceUnaSemana;

    // Generar reporte
    document.getElementById('generarReporteBtn').addEventListener('click', generarReporte);

    // Cargar reporte inicial
    await generarReporte();
});

async function generarReporte() {
    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    if (!fechaInicio || !fechaFin) {
        utils.showToast('Selecciona un período válido', 'error');
        return;
    }

    try {
        utils.showToast('Generando reporte...', 'info');

        // Obtener productos más vendidos
        const response = await api.get(
            `/reportes/productos-mas-vendidos?limit=10&fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`
        );

        if (response.success && response.data) {
            mostrarTopProductos(response.data);
            calcularEstadisticas(response.data);
            utils.showToast('Reporte generado', 'success');
        }

    } catch (error) {
        console.error('Error al generar reporte:', error);
        utils.showToast('Error al generar reporte: ' + error.message, 'error');
    }
}

function mostrarTopProductos(productos) {
    const tbody = document.getElementById('topProductosTable');

    if (!productos || productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-state">No hay datos para el período seleccionado</td></tr>';
        return;
    }

    tbody.innerHTML = productos.map((p, index) => `
    <tr>
      <td><strong>${index + 1}</strong></td>
      <td>${utils.escapeHtml(p.nombre || p.producto?.nombre || 'Producto')}</td>
      <td><span class="badge badge-primary">${p.total_vendido || p.cantidad || 0}</span></td>
      <td><strong>${utils.formatCurrency(p.monto_total || 0)}</strong></td>
    </tr>
  `).join('');
}

function calcularEstadisticas(productos) {
    let totalVendido = 0;
    let cantidadVentas = 0;
    let productosVendidos = 0;

    productos.forEach(p => {
        totalVendido += parseFloat(p.monto_total || 0);
        productosVendidos += parseInt(p.total_vendido || p.cantidad || 0);
        cantidadVentas += parseInt(p.cantidad_ventas || 1);
    });

    document.getElementById('totalVendido').textContent = utils.formatCurrency(totalVendido);
    document.getElementById('cantidadVentas').textContent = `${cantidadVentas} ventas`;
    document.getElementById('productosVendidos').textContent = productosVendidos;

    const ticketPromedio = cantidadVentas > 0 ? totalVendido / cantidadVentas : 0;
    document.getElementById('ticketPromedio').textContent = utils.formatCurrency(ticketPromedio);
}
