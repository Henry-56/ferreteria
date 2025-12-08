// POS - Punto de Venta
let productos = [];
let carrito = [];
let selectedPaymentMethod = 'efectivo';

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

    // Cargar productos
    await cargarProductos();

    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', utils.debounce((e) => {
        const query = e.target.value.toLowerCase();
        filtrarProductos(query);
    }, 300));

    // Soporte para lector de código de barras (Enter automático)
    searchInput.addEventListener('keypress', async (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const codigo = searchInput.value.trim();
            if (codigo) {
                await buscarPorCodigoBarras(codigo);
            }
        }
    });

    // Botones del carrito
    document.getElementById('finalizarVentaBtn').addEventListener('click', mostrarModalPago);
    document.getElementById('limpiarCarritoBtn').addEventListener('click', limpiarCarrito);

    // Modal de pago
    setupModalPago();
});

async function cargarProductos() {
    try {
        const response = await api.get(API_CONFIG.endpoints.productos + '?limit=1000&status=1');
        if (response.success && response.data) {
            productos = response.data.filter(p => p.st ock > 0); // Solo productos con stock
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        utils.showToast('Error al cargar productos', 'error');
    }
}

function mostrarProductos(items) {
    const grid = document.getElementById('productsGrid');

    if (items.length === 0) {
        grid.innerHTML = '<div class="empty-state"><p>No hay productos disponibles</p></div>';
        return;
    }

    grid.innerHTML = items.map(p => `
    <div class="product-card" onclick="agregarAlCarrito(${p.id})">
      <div class="product-image">${p.nombre.charAt(0)}</div>
      <div class="product-name">${utils.escapeHtml(p.nombre)}</div>
      <div class="product-price">${utils.formatCurrency(p.precio_venta)}</div>
      <div class="product-stock">Stock: ${p.stock}</div>
    </div>
  `).join('');
}

function filtrarProductos(query) {
    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(query) ||
        (p.codigo_barra && p.codigo_barra.includes(query))
    );
    mostrarProductos(filtered);
}

async function buscarPorCodigoBarras(codigo) {
    try {
        const response = await api.get(API_CONFIG.endpoints.productoByBarcode(codigo));
        if (response.success && response.data) {
            agregarAlCarrito(response.data.id);
            document.getElementById('searchInput').value = '';
        }
    } catch (error) {
        utils.showToast('Producto no encontrado', 'error');
    }
}

function agregarAlCarrito(productId) {
    const producto = productos.find(p => p.id === productId);
    if (!producto) return;

    const itemExistente = carrito.find(item => item.id === productId);

    if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
            itemExistente.cantidad++;
        } else {
            utils.showToast('No hay más stock disponible', 'warning');
            return;
        }
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }

    actualizarCarrito();
    utils.showToast(`${producto.nombre} agregado al carrito`, 'success');
}

function actualizarCarrito() {
    const cartItemsEl = document.getElementById('cartItems');
    const finalizarBtn = document.getElementById('finalizarVentaBtn');
    const limpiarBtn = document.getElementById('limpiarCarritoBtn');

    if (carrito.length === 0) {
        cartItemsEl.innerHTML = `
      <div class="cart-empty">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
        <p>El carrito está vacío</p>
      </div>
    `;
        finalizarBtn.disabled = true;
        limpiarBtn.disabled = true;
        actualizarTotales();
        return;
    }

    finalizarBtn.disabled = false;
    limpiarBtn.disabled = false;

    cartItemsEl.innerHTML = carrito.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <div class="cart-item-name">${utils.escapeHtml(item.nombre)}</div>
        <div class="cart-item-price">${utils.formatCurrency(item.precio_venta)} c/u</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="cambiarCantidad(${index}, -1)">-</button>
        <input 
          type="number" 
          class="qty-input" 
          value="${item.cantidad}" 
          min="1"
          max="${item.stock}"
          onchange="actualizarCantidad(${index}, this.value)"
        >
        <button class="qty-btn" onclick="cambiarCantidad(${index}, 1)">+</button>
        <button class="remove-btn" onclick="eliminarItem(${index})">🗑️</button>
      </div>
    </div>
  `).join('');

    actualizarTotales();
}

function cambiarCantidad(index, delta) {
    const item = carrito[index];
    const nuevaCantidad = item.cantidad + delta;

    if (nuevaCantidad <= 0) {
        eliminarItem(index);
        return;
    }

    if (nuevaCantidad > item.stock) {
        utils.showToast('No hay suficiente stock', 'warning');
        return;
    }

    item.cantidad = nuevaCantidad;
    actualizarCarrito();
}

function actualizarCantidad(index, valor) {
    const cantidad = parseInt(valor);
    const item = carrito[index];

    if (isNaN(cantidad) || cantidad <= 0) {
        eliminarItem(index);
        return;
    }

    if (cantidad > item.stock) {
        utils.showToast('No hay suficiente stock', 'warning');
        item.cantidad = item.stock;
    } else {
        item.cantidad = cantidad;
    }

    actualizarCarrito();
}

function eliminarItem(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

async function limpiarCarrito() {
    const confirmed = await utils.confirm('¿Limpiar todo el carrito?');
    if (confirmed) {
        carrito = [];
        actualizarCarrito();
        utils.showToast('Carrito limpiado', 'success');
    }
}

function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
    const descuento = 0; // Implementar lógica de descuentos si es necesario
    const total = subtotal - descuento;

    document.getElementById('subtotal').textContent = utils.formatCurrency(subtotal);
    document.getElementById('descuento').textContent = utils.formatCurrency(descuento);
    document.getElementById('total').textContent = utils.formatCurrency(total);
}

function setupModalPago() {
    const modal = document.getElementById('paymentModal');
    const montoInput = document.getElementById('montoRecibido');
    const cambioEl = document.getElementById('cambio');

    // Métodos de pago
    document.querySelectorAll('.payment-method').forEach(method => {
        method.addEventListener('click', function () {
            document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('selected'));
            this.classList.add('selected');
            selectedPaymentMethod = this.dataset.method;
        });
    });

    // Calcular cambio
    montoInput.addEventListener('input', () => {
        const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
        const monto = parseFloat(montoInput.value) || 0;
        const cambio = Math.max(0, monto - total);
        cambioEl.textContent = utils.formatCurrency(cambio);
    });

    // Botones
    document.getElementById('cancelarPagoBtn').addEventListener('click', () => {
        modal.classList.remove('active');
    });

    document.getElementById('confirmarPagoBtn').addEventListener('click', procesarVenta);
}

function mostrarModalPago() {
    const modal = document.getElementById('paymentModal');
    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);

    document.getElementById('montoRecibido').value = total.toFixed(2);
    document.getElementById('cambio').textContent = utils.formatCurrency(0);

    modal.classList.add('active');
}

async function procesarVenta() {
    const total = carrito.reduce((sum, item) => sum + (item.precio_venta * item.cantidad), 0);
    const montoRecibido = parseFloat(document.getElementById('montoRecibido').value) || 0;

    if (montoRecibido < total) {
        utils.showToast('El monto recibido es insuficiente', 'error');
        return;
    }

    const venta = {
        metodo_pago: selectedPaymentMethod,
        detalles: carrito.map(item => ({
            producto_id: item.id,
            cantidad: item.cantidad,
            precio_unitario: item.precio_venta
        }))
    };

    // NOTA: Este endpoint debe implementarse en el backend
    try {
        utils.showToast('Procesando venta...', 'info');
        // const response = await api.post('/ventas', venta);

        // Simulación de éxito (remover cuando se implemente el endpoint)
        await new Promise(resolve => setTimeout(resolve, 1000));

        utils.showToast('¡Venta realizada con éxito!', 'success');
        document.getElementById('paymentModal').classList.remove('active');
        carrito = [];
        actualizarCarrito();

    } catch (error) {
        console.error('Error al procesar venta:', error);
        utils.showToast('Error al procesar la venta: ' + error.message, 'error');
    }
}

// Exponer funciones globalmente para onclick
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidad = cambiarCantidad;
window.actualizarCantidad = actualizarCantidad;
window.eliminarItem = eliminarItem;
