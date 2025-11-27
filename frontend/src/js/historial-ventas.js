// frontend/src/js/historial-ventas.js

document.addEventListener('DOMContentLoaded', async () => {
  const purchasesCard = document.querySelector('.purchases-card');

  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Cargar productos vendidos
  await cargarProductosVendidos();

  /**
   * Cargar productos más vendidos con sus estadísticas
   */
  async function cargarProductosVendidos() {
    try {
      purchasesCard.innerHTML = '<p>Cargando historial...</p>';

      // Intentar obtener productos más vendidos
      // Si no existe ese endpoint, obtenemos todas las ventas y calculamos
      let productosVendidos;
      
      try {
        const response = await ProductoService.obtenerMasVendidos();
        productosVendidos = response.data;
      } catch (error) {
        // Si no existe el endpoint, calculamos desde las ventas
        productosVendidos = await calcularProductosVendidos();
      }

      if (!productosVendidos || productosVendidos.length === 0) {
        purchasesCard.innerHTML = '<p>No hay productos vendidos aún</p>';
        return;
      }

      // Limpiar contenedor
      purchasesCard.innerHTML = '';

      // Renderizar cada producto vendido
      productosVendidos.forEach((item, index) => {
        const itemElement = crearElementoProductoVendido(item);
        purchasesCard.appendChild(itemElement);

        // Agregar divisor excepto en el último
        if (index < productosVendidos.length - 1) {
          const divider = document.createElement('hr');
          divider.className = 'divider';
          purchasesCard.appendChild(divider);
        }
      });

    } catch (error) {
      console.error('Error al cargar historial:', error);
      purchasesCard.innerHTML = '<p>Error al cargar el historial. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Calcular productos vendidos desde las ventas (fallback)
   */
  async function calcularProductosVendidos() {
    try {
      const ventasResponse = await VentaService.obtenerTodas();
      const ventas = ventasResponse.data || [];

      // Agrupar por producto
      const productosMap = new Map();

      for (const venta of ventas) {
        if (venta.items && Array.isArray(venta.items)) {
          for (const item of venta.items) {
            const productoId = item.productoId;
            
            if (!productosMap.has(productoId)) {
              productosMap.set(productoId, {
                id: productoId,
                nombre: item.producto?.nombre || 'Producto',
                imagen: item.producto?.imagen || '/frontend/src/assets/images/default-product.png',
                cantidadVendida: 0,
                calificacion: item.producto?.calificacion || 0
              });
            }

            const producto = productosMap.get(productoId);
            producto.cantidadVendida += item.cantidad;
          }
        }
      }

      // Convertir a array y ordenar por cantidad vendida
      return Array.from(productosMap.values())
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida);

    } catch (error) {
      console.error('Error al calcular productos vendidos:', error);
      return [];
    }
  }

  /**
   * Crear elemento HTML para un producto vendido
   */
  function crearElementoProductoVendido(item) {
    const div = document.createElement('div');
    div.className = 'purchase-item';

    // Calcular estrellas (paws) activas
    const calificacion = parseFloat(item.calificacion || 0);
    const pawsHTML = generarPawsHTML(calificacion);

    div.innerHTML = `
      <div class="product-image">
        <img src="${item.imagen || '/frontend/src/assets/images/default-product.png'}" 
             alt="${item.nombre}">
      </div>
      
      <div class="product-details">
        <h3>${item.nombre}</h3>
        <p class="promedio">Cantidad Vendida</p>
        <div class="cantidad-vendidos">${item.cantidadVendida || 0}</div>
      </div>
      
      <div class="product-rating">
        <div class="rating-content">
          <p class="promedio">Calificación promedio</p>
          <div class="paws-container">
            ${pawsHTML}
          </div>
        </div>
      </div>
    `;

    return div;
  }

  /**
   * Generar HTML de las paws (estrellas) según la calificación
   */
  function generarPawsHTML(calificacion) {
    const totalPaws = 5;
    const pawsActivas = Math.round(calificacion);
    let html = '';

    for (let i = 0; i < totalPaws; i++) {
      const clase = i < pawsActivas ? 'active' : 'inactive';
      html += `<i class="paw-icon ${clase}"></i>`;
    }

    return html;
  }
});