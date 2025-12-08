// Gestión de Inventario
let inventario = [];

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

    // Cargar datos
    await cargarInventario();

    // Filtros
    document.getElementById('searchInventory').addEventListener('input', utils.debounce(filtrarInventario, 300));
    document.getElementById('filterStock').addEventListener('change', filtrarInventario);

    // Modal Ajuste
    document.getElementById('cancelarAjusteBtn').addEventListener('click', cerrarModalAjuste);
    document.getElementById('ajusteForm').addEventListener('submit', guardarAjuste);

    // Botón Ajuste Rápido (abre modal vacío para buscar producto luego - mejora futura)
    document.getElementById('ajusteRapidoBtn').addEventListener('click', () => {
        utils.showToast('Selecciona un producto de la tabla para ajustar', 'info');
    });

    // Event delegation para botones de ajustar stock
    document.getElementById('inventoryTable').addEventListener('click', (e) => {
        const ajustarBtn = e.target.closest('.btn-ajustar-stock');
        if (ajustarBtn) {
            const id = parseInt(ajustarBtn.dataset.id);
            abrirAjuste(id);
        }
    });
});

async function cargarInventario() {
    try {
        const response = await api.get(API_CONFIG.endpoints.productos + '?limit=1000');
        if (response.success && response.data) {
            inventario = response.data;
            actualizarKPIs();
            mostrarInventario(inventario);
        }
    } catch (error) {
        console.error('Error al cargar inventario:', error);
        utils.showToast('Error al cargar inventario', 'error');
    }
}

function actualizarKPIs() {
    let totalValor = 0;
    let stockBajo = 0;
    let agotados = 0;

    inventario.forEach(p => {
        totalValor += (p.precio_compra || 0) * p.stock;
        if (p.stock <= 0) agotados++;
        else if (p.stock <= (p.stock_minimo || 5)) stockBajo++;
    });

    document.getElementById('totalValor').textContent = utils.formatCurrency(totalValor);
    document.getElementById('totalBajoStock').textContent = stockBajo;
    document.getElementById('totalAgotados').textContent = agotados;
}

function mostrarInventario(items) {
    const tbody = document.getElementById('inventoryTable');

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No hay productos</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(p => {
        const estadoClass = p.stock <= 0 ? 'badge-error' :
            p.stock <= (p.stock_minimo || 5) ? 'badge-warning' : 'badge-success';
        const estadoText = p.stock <= 0 ? 'Agotado' :
            p.stock <= (p.stock_minimo || 5) ? 'Stock Bajo' : 'Normal';

        return `
      <tr>
        <td>
          <div style="font-weight: 500;">${utils.escapeHtml(p.nombre)}</div>
        </td>
        <td>${p.codigo_barra || '-'}</td>
        <td>
          <span style="font-weight: 600; font-size: 1.1em;">${p.stock}</span>
        </td>
        <td>${p.stock_minimo || 5}</td>
        <td>${utils.formatCurrency((p.precio_compra || 0) * p.stock)}</td>
        <td><span class="badge ${estadoClass}">${estadoText}</span></td>
        <td>
          <button class="btn btn-sm btn-secondary btn-ajustar-stock" data-id="${p.id}">
            🔧 Ajustar
          </button>
        </td>
      </tr>
    `;
    }).join('');
}

function filtrarInventario() {
    const query = document.getElementById('searchInventory').value.toLowerCase();
    const filter = document.getElementById('filterStock').value;

    let filtered = inventario.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        (p.codigo_barra && p.codigo_barra.includes(query))
    );

    if (filter === 'low') {
        filtered = filtered.filter(p => p.stock > 0 && p.stock <= (p.stock_minimo || 5));
    } else if (filter === 'out') {
        filtered = filtered.filter(p => p.stock <= 0);
    }

    mostrarInventario(filtered);
}

function abrirAjuste(id) {
    const producto = inventario.find(p => p.id === id);
    if (!producto) return;

    document.getElementById('ajusteProductoId').value = producto.id;
    document.getElementById('ajusteProductoNombre').textContent = `Producto: ${producto.nombre} (Stock actual: ${producto.stock})`;
    document.getElementById('ajusteCantidad').value = '';
    document.getElementById('ajusteNota').value = '';

    document.getElementById('ajusteModal').classList.add('active');
}

function cerrarModalAjuste() {
    document.getElementById('ajusteModal').classList.remove('active');
}

async function guardarAjuste(e) {
    e.preventDefault();

    const id = document.getElementById('ajusteProductoId').value;
    const tipo = document.querySelector('input[name="tipo_movimiento"]:checked').value;
    const cantidad = parseInt(document.getElementById('ajusteCantidad').value);
    const nota = document.getElementById('ajusteNota').value;

    if (!cantidad || cantidad <= 0) {
        utils.showToast('Ingresa una cantidad válida', 'error');
        return;
    }

    try {
        // Usar el endpoint de ajuste de stock
        await api.post(API_CONFIG.endpoints.productoAjustarStock(id), {
            cantidad: cantidad,
            tipo_movimiento: tipo, // 'entrada', 'salida', 'ajuste'
            notas: nota
        });

        utils.showToast('Stock actualizado correctamente', 'success');
        cerrarModalAjuste();
        await cargarInventario(); // Recargar tabla

    } catch (error) {
        console.error('Error al ajustar stock:', error);
        utils.showToast('Error: ' + error.message, 'error');
    }
}
