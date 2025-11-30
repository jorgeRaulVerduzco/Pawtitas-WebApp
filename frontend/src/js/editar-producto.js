import ProductoService from '../services/producto.service.js';

document.addEventListener("DOMContentLoaded", () => {
  const productoId = localStorage.getItem("editandoProductoId");
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/frontend/src/pages/login-page.html";
    return;
  }

  if (!productoId) {
    // Si no hay productoId, regresar a la página de origen o la predeterminada
    const paginaOrigen = localStorage.getItem('paginaOrigen') || '/frontend/src/pages/gestionar-productos.html';
    localStorage.removeItem('paginaOrigen');
    window.location.href = paginaOrigen;
    return;
  }

  const form = document.getElementById("editarProductoForm");
  const mensajeError = document.getElementById("mensaje-error");
  const mensajeExito = document.getElementById("mensaje-exito");
  const imagenInput = document.getElementById("imagenArchivo");
  const previewContainer = document.getElementById("previewContainer");
  const previewImagen = document.getElementById("previewImagen");
  const boton = form.querySelector("button");
  const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;

  let imagenActual = null;

  cargarProducto();

  imagenInput.addEventListener("change", () => {
    if (!imagenInput.files.length) {
      if (!imagenActual) {
        ocultarPreview();
      }
      return;
    }

    const archivo = imagenInput.files[0];
    if (!validarArchivoImagen(archivo)) {
      imagenInput.value = "";
      return;
    }

    const objectUrl = URL.createObjectURL(archivo);
    previewImagen.src = objectUrl;
    previewContainer.hidden = false;
    previewImagen.onload = () => URL.revokeObjectURL(objectUrl);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    limpiarMensajes();

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const precio = parseFloat(document.getElementById("precio").value);
    const cantidadStock = parseInt(document.getElementById("cantidad").value);
    const categoriasInput = document.getElementById("categorias").value.trim();

    if (!nombre || !descripcion || Number.isNaN(precio) || Number.isNaN(cantidadStock)) {
      mostrarError("Completa todos los campos obligatorios.");
      return;
    }

    if (precio <= 0) {
      mostrarError("El precio debe ser mayor a 0.");
      return;
    }

    if (cantidadStock < 0) {
      mostrarError("La cantidad no puede ser negativa.");
      return;
    }

    let categorias = [];
    if (categoriasInput) {
      categorias = categoriasInput.split(",").map((c) => c.trim()).filter((c) => c.length > 0);
    }

    try {
      boton.disabled = true;
      boton.textContent = "Guardando...";

      let nuevaImagen = imagenActual;
      if (imagenInput.files.length) {
        nuevaImagen = await convertirArchivoABase64(imagenInput.files[0]);
      }

      const payload = {
        nombre,
        descripcion,
        precio,
        cantidadStock,
        categorias,
        imagen: nuevaImagen,
      };

      await ProductoService.actualizar(productoId, payload);

      mostrarExito("Producto actualizado correctamente.");
      localStorage.removeItem("editandoProductoId");
      
      // Obtener página de origen o usar la predeterminada
      const paginaOrigen = localStorage.getItem('paginaOrigen') || '/frontend/src/pages/gestionar-productos.html';
      localStorage.removeItem('paginaOrigen');
      
      setTimeout(() => {
        window.location.href = paginaOrigen;
      }, 1500);
    } catch (error) {
      mostrarError(error.message || "No se pudo actualizar el producto.");
    } finally {
      boton.disabled = false;
      boton.textContent = "Guardar cambios";
    }
  });

  async function cargarProducto() {
    try {
      const response = await ProductoService.obtenerPorId(productoId, true);
      const producto = response.data || response;

      document.getElementById("nombre").value = producto.nombre || "";
      document.getElementById("descripcion").value = producto.descripcion || "";
      document.getElementById("precio").value = producto.precio || 0;
      document.getElementById("cantidad").value = producto.cantidadStock || 0;
      document.getElementById("categorias").value = (producto.categorias || [])
        .map((cat) => cat.nombre)
        .join(", ");

      if (producto.imagen) {
        imagenActual = producto.imagen;
        previewImagen.src = producto.imagen;
        previewContainer.hidden = false;
      } else {
        ocultarPreview();
      }
    } catch (error) {
      mostrarError("No se pudo cargar el producto a editar.");
      const paginaOrigen = localStorage.getItem('paginaOrigen') || '/frontend/src/pages/gestionar-productos.html';
      localStorage.removeItem('paginaOrigen');
      setTimeout(() => {
        window.location.href = paginaOrigen;
      }, 1500);
    }
  }

  function validarArchivoImagen(file) {
    if (!file.type.startsWith("image/")) {
      mostrarError("El archivo debe ser una imagen.");
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      mostrarError("La imagen debe pesar menos de 3MB.");
      return false;
    }

    return true;
  }

  function convertirArchivoABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
      reader.readAsDataURL(file);
    });
  }

  function ocultarPreview() {
    previewContainer.hidden = true;
    previewImagen.src = "";
  }

  function limpiarMensajes() {
    mensajeError.style.display = "none";
    mensajeExito.style.display = "none";
  }

  function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = "block";
    mensajeExito.style.display = "none";
  }

  function mostrarExito(mensaje) {
    mensajeExito.textContent = mensaje;
    mensajeExito.style.display = "block";
    mensajeError.style.display = "none";
  }
});


