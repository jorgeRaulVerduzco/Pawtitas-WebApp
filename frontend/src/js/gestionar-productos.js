// frontend/src/js/gestionar-productos.js

document.addEventListener('DOMContentLoaded', async () => {
  const productosCard = document.querySelector('.productos-card');
  const addProductButton = document.querySelector('.add-product-button');

  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Cargar productos al iniciar
  await cargarProductos();

  // Event listener para agregar producto
  addProductButton.addEventListener('click', () => {
    window.location.href = '/frontend/src/pages/agregar-producto.html';
  });

  /**
   * Cargar todos los productos
   */
  async function cargarProductos() {
    try {
      productosCard.innerHTML = '<p>Cargando productos...</p>';
      
      const response = await ProductoService.obtenerTodos(100, 0);
      
      if (!response.data || response.data.length === 0) {
        productosCard.innerHTML = '<p>No hay productos registrados</p>';
        return;
      }

      // Limpiar contenedor
      productosCard.innerHTML = '';

      // Renderizar cada producto
      response.data.forEach((producto, index) => {
        const productoElement = crearElementoProducto(producto);
        productosCard.appendChild(productoElement);
        
        // Agregar divisor excepto en el último
        if (index < response.data.length - 1) {
          const divider = document.createElement('hr');
          divider.className = 'divider';
          productosCard.appendChild(divider);
        }
      });

    } catch (error) {
      console.error('Error al cargar productos:', error);
      productosCard.innerHTML = '<p>Error al cargar productos. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Crear elemento HTML para un producto
   */
  function crearElementoProducto(producto) {
    const div = document.createElement('div');
    div.className = 'obejeto-card';
    div.dataset.productoId = producto.id;

    div.innerHTML = `
      <div class="imagen">
        <img src="${producto.imagen || '/frontend/src/assets/images/default-product.png'}" 
             alt="${producto.nombre}">
      </div>
      
      <div class="detalles-producto">
        <h3>${producto.nombre}</h3>
        <p class="stock-label">Productos en existencia</p>
        
        <div class="stock-control">
          <button class="quantity-btn minus-btn" data-id="${producto.id}">-</button>
          <input type="number" 
                 class="stock-quantity-input" 
                 value="${producto.cantidadStock}" 
                 min="0"
                 data-id="${producto.id}">
          <button class="quantity-btn plus-btn" data-id="${producto.id}">+</button>
        </div>
      </div>
      
      <div class="product-actions">
        <img src="/frontend/src/assets/images/trash.svg" 
             alt="Eliminar" 
             class="action-icon trash-icon"
             data-id="${producto.id}">
        <img src="/frontend/src/assets/images/Edit-black.svg" 
             alt="Editar" 
             class="action-icon edit-icon"
             data-id="${producto.id}">
      </div>
    `;

    // Event listeners para botones de stock
    const minusBtn = div.querySelector('.minus-btn');
    const plusBtn = div.querySelector('.plus-btn');
    const stockInput = div.querySelector('.stock-quantity-input');

    minusBtn.addEventListener('click', () => {
      const newValue = Math.max(0, parseInt(stockInput.value) - 1);
      stockInput.value = newValue;
      actualizarStock(producto.id, newValue);
    });

    plusBtn.addEventListener('click', () => {
      const newValue = parseInt(stockInput.value) + 1;
      stockInput.value = newValue;
      actualizarStock(producto.id, newValue);
    });

    stockInput.addEventListener('change', (e) => {
      const newValue = Math.max(0, parseInt(e.target.value) || 0);
      stockInput.value = newValue;
      actualizarStock(producto.id, newValue);
    });

    // Event listeners para acciones
    const trashIcon = div.querySelector('.trash-icon');
    const editIcon = div.querySelector('.edit-icon');

    trashIcon.addEventListener('click', () => eliminarProducto(producto.id));
    editIcon.addEventListener('click', () => editarProducto(producto.id));

    return div;
  }

  /**
   * Actualizar stock de producto
   */
  async function actualizarStock(id, cantidadStock) {
    try {
      await ProductoService.actualizar(id, { cantidadStock });
      console.log(`Stock actualizado para producto ${id}: ${cantidadStock}`);
    } catch (error) {
      console.error('Error al actualizar stock:', error);
      alert('Error al actualizar el stock. Por favor intenta de nuevo.');
      await cargarProductos(); // Recargar para mostrar el valor correcto
    }
  }

  /**
   * Eliminar producto
   */
  async function eliminarProducto(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    return;
  }

  try {
    console.log('🗑️ Intentando eliminar producto:', id);
    
    const response = await ProductoService.eliminar(id);
    
    console.log('✅ Respuesta del servidor:', response);
    
    alert('Producto eliminado exitosamente');
    await cargarProductos(); // Recargar la lista
    
  } catch (error) {
    console.error('❌ Error al eliminar producto:', error);
    
    if (error.message.includes('ventas asociadas')) {
      alert('No se puede eliminar este producto porque tiene ventas asociadas. Se desactivará en su lugar.');
    } else {
      alert(`Error al eliminar el producto: ${error.message}`);
    }
  }
}

  /**
   * Editar producto (redirigir a página de edición)
   */
  function editarProducto(id) {
    // Guardar ID del producto en localStorage para la página de edición
    localStorage.setItem('editandoProductoId', id);
    window.location.href = '/frontend/src/pages/editar-producto.html';
  }
});