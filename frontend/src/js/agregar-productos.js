// frontend/src/js/agregar-producto.js

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('.general-form');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Cargar categorías disponibles
  await cargarCategorias();

  // Event listener para el formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await agregarProducto();
  });

  /**
   * Cargar categorías y crear selector múltiple
   */
  async function cargarCategorias() {
    try {
      // Crear contenedor para categorías después del campo de imagen
      const imagenField = document.getElementById('imagen').parentElement;
      const categoriasContainer = document.createElement('div');
      categoriasContainer.className = 'form-field-group';
      categoriasContainer.innerHTML = `
        <label for="categorias" class="required">Categorías</label>
        <div id="categorias-checkboxes" class="categorias-container">
          <p>Cargando categorías...</p>
        </div>
      `;
      
      imagenField.parentNode.insertBefore(categoriasContainer, imagenField.nextSibling);

      // Aquí deberías obtener las categorías de tu API
      // Por ahora uso categorías de ejemplo
      const categorias = [
        { id: 1, nombre: 'Comida' },
        { id: 2, nombre: 'Juguetes' },
        { id: 3, nombre: 'Accesorios' },
        { id: 4, nombre: 'Higiene' },
        { id: 5, nombre: 'Salud' }
      ];

      const checkboxesContainer = document.getElementById('categorias-checkboxes');
      checkboxesContainer.innerHTML = '';

      categorias.forEach(categoria => {
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
          <input type="checkbox" 
                 id="cat-${categoria.id}" 
                 name="categorias" 
                 value="${categoria.id}">
          <label for="cat-${categoria.id}">${categoria.nombre}</label>
        `;
        checkboxesContainer.appendChild(div);
      });

    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  /**
   * Agregar nuevo producto
   */
  async function agregarProducto() {
    try {
      // Obtener valores del formulario
      const nombre = document.getElementById('nombre').value.trim();
      const descripcion = document.getElementById('descripcion').value.trim();
      const precio = parseFloat(document.getElementById('precio').value);
      const cantidadStock = parseInt(document.getElementById('cantidad').value);
      const imagenInput = document.getElementById('imagen');

      // Obtener categorías seleccionadas
      const categoriasSeleccionadas = Array.from(
        document.querySelectorAll('input[name="categorias"]:checked')
      ).map(checkbox => parseInt(checkbox.value));

      // Validaciones
      if (!nombre || !descripcion) {
        alert('Por favor completa todos los campos obligatorios');
        return;
      }

      if (isNaN(precio) || precio < 0) {
        alert('Por favor ingresa un precio válido');
        return;
      }

      if (isNaN(cantidadStock) || cantidadStock < 0) {
        alert('Por favor ingresa una cantidad válida');
        return;
      }

      if (categoriasSeleccionadas.length === 0) {
        alert('Por favor selecciona al menos una categoría');
        return;
      }

      // Deshabilitar botón mientras se procesa
      const boton = form.querySelector('button[type="submit"]');
      const textoOriginal = boton.textContent;
      boton.disabled = true;
      boton.textContent = 'Agregando...';

      // Preparar datos del producto
      let imagenUrl = null;
      
      // Si hay imagen, convertirla a base64 o subirla
      if (imagenInput.files && imagenInput.files[0]) {
        // Aquí deberías implementar la subida de imagen
        // Por ahora solo guardaremos el nombre
        imagenUrl = `/uploads/${imagenInput.files[0].name}`;
      }

      const productoData = {
        nombre,
        descripcion,
        precio,
        cantidadStock,
        imagen: imagenUrl,
        activo: true,
        categorias: categoriasSeleccionadas
      };

      // Crear producto
      const response = await ProductoService.crear(productoData);

      console.log('Producto creado:', response);
      alert('¡Producto agregado exitosamente!');
      
      // Redirigir a gestionar productos
      window.location.href = '/frontend/src/pages/gestionar-productos.html';

    } catch (error) {
      console.error('Error al agregar producto:', error);
      alert(error.message || 'Error al agregar el producto. Por favor intenta de nuevo.');
      
      // Rehabilitar botón
      const boton = form.querySelector('button[type="submit"]');
      boton.disabled = false;
      boton.textContent = 'Agregar';
    }
  }
});