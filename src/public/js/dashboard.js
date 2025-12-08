// Dashboard logic
document.addEventListener('DOMContentLoaded', async () => {
    // Proteger ruta - redirigir si no está autenticado
    auth.redirectIfNotAuthenticated();

    // Obtener usuario actual
    const user = auth.getUser();

    // Mostrar información del usuario
    if (user) {
        document.getElementById('userName').textContent = user.username;
        document.getElementById('userRole').textContent = user.rol?.nombre || 'Usuario';
        document.getElementById('userAvatar').textContent = user.username.charAt(0).toUpperCase();
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const confirmed = await utils.confirm('¿Estás seguro de cerrar sesión?', 'Cerrar Sesión');
        if (confirmed) {
            try {
                await api.post(API_CONFIG.endpoints.logout);
            } catch (error) {
                console.log('Error al cerrar sesión en el servidor:', error);
            }

            auth.logout();
            utils.showToast('Sesión cerrada correctamente', 'success');
            setTimeout(() => {
                window.location.href = '/views/login.html';
            }, 500);
        }
    });

    // Cargar estadísticas
    await cargarEstadisticas();
});

async function cargarEstadisticas() {
    try {
        // Cargar productos
        const productosResponse = await api.get(API_CONFIG.endpoints.productos + '?limit=1000');

        if (productosResponse.success && productosResponse.data) {
            const productos = productosResponse.data;

            // Total de productos
            document.getElementById('totalProductos').textContent = productos.length;

            // Productos con stock bajo
            const stockBajo = productos.filter(p => p.stock <= p.stock_minimo && p.stock > 0);
            document.getElementById('stockBajo').textContent = stockBajo.length;

            // Productos agotados
            const agotados = productos.filter(p => p.stock === 0);
            document.getElementById('productosAgotados').textContent = agotados.length;

            // Mostrar tabla de stock bajo si hay productos
            if (stockBajo.length > 0) {
                mostrarProductosStockBajo(stockBajo);
            }
        }

        // Simular ventas del día (cuando se implemente el endpoint)
        document.getElementById('ventasHoy').textContent = 'S/ 0.00';

        utils.showToast('Estadísticas cargadas', 'success');

    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        utils.showToast('Error al cargar estadísticas: ' + error.message, 'error');
    }
}

function mostrarProductosStockBajo(productos) {
    const section = document.getElementById('stockBajoSection');
    const tbody = document.getElementById('stockBajoTable');

    section.style.display = 'block';

    tbody.innerHTML = productos.map(p => `
    <tr>
      <td>${utils.escapeHtml(p.nombre)}</td>
      <td>
        <span class="badge badge-warning">${p.stock}</span>
      </td>
      <td>${p.stock_minimo || 5}</td>
      <td>
        <a href="/views/productos.html?id=${p.id}&action=ajustar" class="btn btn-sm btn-primary">
          Ajustar Stock
        </a>
      </td>
    </tr>
  `).join('');
}
