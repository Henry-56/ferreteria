// Gestión de Productos
let productos = [];
let rubros = [];
let proveedores = [];
let productoEditando = null;
let imagenSeleccionada = null; // Para almacenar el archivo de imagen seleccionado

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

    // Cargar datos iniciales
    await Promise.all([
        cargarRubros(),
        cargarProveedores(),
        cargarProductos()
    ]);

    // Botones
    document.getElementById('nuevoProductoBtn').addEventListener('click', () => mostrarModalProducto());
    document.getElementById('cancelarBtn').addEventListener('click', cerrarModal);
    document.getElementById('guardarBtn').addEventListener('click', guardarProducto);

    // Manejo de imagen
    document.getElementById('selectImageBtn').addEventListener('click', () => {
        document.getElementById('imagenInput').click();
    });

    document.getElementById('imagenInput').addEventListener('change', handleImageSelect);
    document.getElementById('removeImageBtn').addEventListener('click', removeImage);

    // Hacer el área de preview clickeable
    document.getElementById('imagePreview').addEventListener('click', () => {
        document.getElementById('imagenInput').click();
    });

    // Filtros
    document.getElementById('searchProducto').addEventListener('input', utils.debounce(filtrarProductos, 300));
    document.getElementById('filterStatus').addEventListener('change', filtrarProductos);
    document.getElementById('clearFiltersBtn').addEventListener('click', limpiarFiltros);

    // Event delegation para botones de editar y eliminar en la tabla
    document.getElementById('productosTable').addEventListener('click', (e) => {
        const editBtn = e.target.closest('.btn-edit');
        const deleteBtn = e.target.closest('.btn-delete');

        if (editBtn) {
            const id = parseInt(editBtn.dataset.id);
            editarProducto(id);
        } else if (deleteBtn) {
            const id = parseInt(deleteBtn.dataset.id);
            eliminarProducto(id);
        }
    });
});

async function cargarRubros() {
    try {
        const response = await fetch('/api/rubros');
        const data = await response.json();
        rubros = data.rubros || [];
        llenarSelectRubros();
    } catch (error) {
        console.error('Error al cargar rubros:', error);
        rubros = [];
    }
}

async function cargarProveedores() {
    try {
        const response = await fetch('/api/proveedores');
        const data = await response.json();
        proveedores = data.proveedores || [];
        llenarSelectProveedores();
    } catch (error) {
        console.error('Error al cargar proveedores:', error);
        proveedores = [];
    }
}

function llenarSelectRubros() {
    const select = document.getElementById('id_rubro');
    select.innerHTML = '<option value="">Seleccione un rubro</option>';
    rubros.forEach(r => {
        select.innerHTML += `<option value="${r.id}">${utils.escapeHtml(r.nombre)}</option>`;
    });
}

function llenarSelectProveedores() {
    const select = document.getElementById('proveedor_id');
    select.innerHTML = '<option value="">Sin proveedor</option>';
    proveedores.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${utils.escapeHtml(p.nombre)}</option>`;
    });
}

async function cargarProductos() {
    try {
        const response = await api.get(API_CONFIG.endpoints.productos + '?limit=1000');
        if (response.success && response.data) {
            productos = response.data;
            mostrarProductos(productos);
        }
    } catch (error) {
        console.error('Error al cargar productos:', error);
        utils.showToast('Error al cargar productos', 'error');
        document.getElementById('productosTable').innerHTML =
            '<tr><td colspan="6" class="empty-state">Error al cargar productos</td></tr>';
    }
}

function mostrarProductos(items) {
    const tbody = document.getElementById('productosTable');

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state">No hay productos</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(p => `
    <tr>
      <td>
        <div style="display: flex; align-items: center; gap: 10px;">
          ${p.imagen_url ?
            `<img src="${p.imagen_url}" alt="${utils.escapeHtml(p.nombre)}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px; border: 2px solid var(--gray-200);">`
            : '<div style="width: 50px; height: 50px; background: var(--gray-200); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1.5em;">📷</div>'
        }
          <span style="font-weight: 500;">${utils.escapeHtml(p.nombre)}</span>
        </div>
      </td>
      <td>${p.codigo_barra || '-'}</td>
      <td>${utils.formatCurrency(p.precio_venta)}</td>
      <td>
        <span class="badge ${p.stock <= 0 ? 'badge-error' : p.stock <= p.stock_minimo ? 'badge-warning' : 'badge-success'}">
          ${p.stock}
        </span>
      </td>
      <td>
        <span class="badge ${p.status ? 'badge-success' : 'badge-error'}">
          ${p.status ? 'Activo' : 'Inactivo'}
        </span>
      </td>
      <td>
        <div class="table-actions">
          <button class="btn btn-sm btn-primary btn-edit" data-id="${p.id}">
            ✏️
          </button>
          <button class="btn btn-sm btn-error btn-delete" data-id="${p.id}">
            🗑️
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function filtrarProductos() {
    const query = document.getElementById('searchProducto').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;

    let filtered = productos;

    if (query) {
        filtered = filtered.filter(p =>
            p.nombre.toLowerCase().includes(query) ||
            (p.codigo_barra && p.codigo_barra.includes(query))
        );
    }

    if (status !== '') {
        filtered = filtered.filter(p => p.status === parseInt(status));
    }

    mostrarProductos(filtered);
}

function limpiarFiltros() {
    document.getElementById('searchProducto').value = '';
    document.getElementById('filterStatus').value = '1';
    filtrarProductos();
}

function mostrarModalProducto(producto = null) {
    productoEditando = producto;
    imagenSeleccionada = null;
    const modal = document.getElementById('productoModal');
    const form = document.getElementById('productoForm');

    document.getElementById('modalTitle').textContent = producto ? 'Editar Producto' : 'Nuevo Producto';

    if (producto) {
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('id_rubro').value = producto.id_rubro || '';
        document.getElementById('proveedor_id').value = producto.proveedor_id || '';
        document.getElementById('codigo_barra').value = producto.codigo_barra || '';
        document.getElementById('precio_compra').value = producto.precio_compra || 0;
        document.getElementById('precio_venta').value = producto.precio_venta;
        document.getElementById('stock').value = producto.stock;
        document.getElementById('stock_minimo').value = producto.stock_minimo || 5;
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('imagen_url').value = producto.imagen_url || '';

        // Mostrar imagen existente
        if (producto.imagen_url) {
            showImagePreview(producto.imagen_url);
        } else {
            resetImagePreview();
        }
    } else {
        form.reset();
        resetImagePreview();
    }

    modal.classList.add('active');
}

function cerrarModal() {
    document.getElementById('productoModal').classList.remove('active');
    productoEditando = null;
    imagenSeleccionada = null;
    resetImagePreview();
}

async function guardarProducto() {
    const id_rubro = document.getElementById('id_rubro').value;
    const proveedor_id = document.getElementById('proveedor_id').value;

    const data = {
        nombre: document.getElementById('nombre').value.trim(),
        id_rubro: parseInt(id_rubro),
        proveedor_id: proveedor_id ? parseInt(proveedor_id) : null,
        codigo_barra: document.getElementById('codigo_barra').value.trim() || null,
        precio_compra: parseFloat(document.getElementById('precio_compra').value) || 0,
        precio_venta: parseFloat(document.getElementById('precio_venta').value),
        stock: parseInt(document.getElementById('stock').value),
        stock_minimo: parseInt(document.getElementById('stock_minimo').value) || 5,
        descripcion: document.getElementById('descripcion').value.trim() || null
    };

    if (!data.nombre || !data.precio_venta || !data.id_rubro) {
        utils.showToast('Completa los campos obligatorios (Nombre, Rubro, Precio de Venta)', 'error');
        return;
    }

    try {
        let productoId;

        if (productoEditando) {
            await api.put(API_CONFIG.endpoints.productoById(productoEditando.id), data);
            productoId = productoEditando.id;
            utils.showToast('Producto actualizado', 'success');
        } else {
            const response = await api.post(API_CONFIG.endpoints.productos, data);
            productoId = response.data.id;
            utils.showToast('Producto creado', 'success');
        }

        // Si hay imagen seleccionada, subirla
        if (imagenSeleccionada) {
            await uploadProductImage(productoId, imagenSeleccionada);
        }

        cerrarModal();
        await cargarProductos();
    } catch (error) {
        console.error('Error al guardar producto:', error);
        utils.showToast('Error: ' + error.message, 'error');
    }
}

// Funciones de manejo de imagen
function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        utils.showToast('La imagen es muy grande. Tamaño máximo: 5MB', 'error');
        return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
        utils.showToast('El archivo debe ser una imagen', 'error');
        return;
    }

    imagenSeleccionada = file;

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        showImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
}

function showImagePreview(url) {
    const preview = document.getElementById('previewImg');
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');

    preview.src = url;
    preview.style.display = 'block';
    placeholder.style.display = 'none';
    removeBtn.style.display = 'inline-block';
}

function resetImagePreview() {
    const preview = document.getElementById('previewImg');
    const placeholder = document.getElementById('uploadPlaceholder');
    const removeBtn = document.getElementById('removeImageBtn');
    const fileInput = document.getElementById('imagenInput');

    preview.src = '';
    preview.style.display = 'none';
    placeholder.style.display = 'flex';
    removeBtn.style.display = 'none';
    fileInput.value = '';
    imagenSeleccionada = null;
}

function removeImage() {
    resetImagePreview();
    document.getElementById('imagen_url').value = '';

    // Si estamos editando y el producto tenía imagen, eliminarla del servidor
    if (productoEditando && productoEditando.imagen_url) {
        if (confirm('¿Deseas eliminar la imagen del servidor?')) {
            api.delete(API_CONFIG.endpoints.productoEliminarImagen(productoEditando.id))
                .then(() => {
                    utils.showToast('Imagen eliminada', 'success');
                    productoEditando.imagen_url = null;
                })
                .catch(err => {
                    console.error('Error al eliminar imagen:', err);
                });
        }
    }
}

async function uploadProductImage(productoId, file) {
    try {
        const formData = new FormData();
        formData.append('imagen', file);

        const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.apiPrefix}/productos/${productoId}/imagen`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${auth.getToken()}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Error al subir imagen');
        }

        const data = await response.json();
        utils.showToast('Imagen subida exitosamente', 'success');
        return data.data.imagen_url;
    } catch (error) {
        console.error('Error al subir imagen:', error);
        utils.showToast('Error al subir imagen: ' + error.message, 'error');
        throw error;
    }
}

async function editarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (producto) {
        mostrarModalProducto(producto);
    }
}

async function eliminarProducto(id) {
    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const confirmed = await utils.confirm(
        `¿Eliminar el producto "${producto.nombre}"?`,
        'Confirmar eliminación'
    );

    if (confirmed) {
        try {
            await api.delete(API_CONFIG.endpoints.productoById(id));
            utils.showToast('Producto eliminado', 'success');
            await cargarProductos();
        } catch (error) {
            console.error('Error al eliminar producto:', error);
            utils.showToast('Error: ' + error.message, 'error');
        }
    }
}
