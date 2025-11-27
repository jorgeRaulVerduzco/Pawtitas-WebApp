// frontend/src/js/agregar-producto.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("agregarProductoForm");
  const mensajeError = document.getElementById("mensaje-error");
  const mensajeExito = document.getElementById("mensaje-exito");
  const imagenInput = document.getElementById("imagenArchivo");
  const previewContainer = document.getElementById("previewContainer");
  const previewImagen = document.getElementById("previewImagen");
  const boton = form.querySelector('button[type="submit"]');
  const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB

  imagenInput.addEventListener("change", () => {
    if (!imagenInput.files.length) {
      ocultarPreview();
      return;
    }

    const archivo = imagenInput.files[0];
    if (!validarArchivoImagen(archivo)) {
      imagenInput.value = "";
      ocultarPreview();
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
    const archivoImagen = imagenInput.files[0];

    if (!nombre || !descripcion || Number.isNaN(precio) || Number.isNaN(cantidadStock)) {
      mostrarError("Por favor completa todos los campos obligatorios.");
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

    if (!archivoImagen) {
      mostrarError("Selecciona una imagen del producto.");
      return;
    }

    if (!validarArchivoImagen(archivoImagen)) {
      return;
    }

    let categorias = [];
    if (categoriasInput) {
      categorias = categoriasInput
        .split(",")
        .map((categoria) => categoria.trim())
        .filter((categoria) => categoria.length > 0);
    }

    boton.disabled = true;
    boton.textContent = "Agregando...";

    try {
      const imagenBase64 = await convertirArchivoABase64(archivoImagen);

      const productoData = {
        nombre,
        descripcion,
        precio,
        cantidadStock,
        imagen: imagenBase64,
        categorias,
        activo: true,
      };

      const response = await ProductoService.crear(productoData);
      console.log("Producto creado:", response);

      mostrarExito("¡Producto agregado exitosamente!");
      form.reset();
      ocultarPreview();

      setTimeout(() => {
        window.location.href = "/frontend/src/pages/gestionar-productos.html";
      }, 2000);
    } catch (error) {
      console.error("Error al agregar producto:", error);
      mostrarError(error.message || "Error al agregar el producto.");
    } finally {
      boton.disabled = false;
      boton.textContent = "Agregar";
    }
  });

  function validarArchivoImagen(file) {
    if (!file.type.startsWith("image/")) {
      mostrarError("El archivo seleccionado debe ser una imagen.");
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