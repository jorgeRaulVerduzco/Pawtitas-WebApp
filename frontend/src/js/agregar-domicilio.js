import DireccionService from '../services/direccion.service.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/frontend/src/pages/login-page.html";
    return;
  }

  const form = document.getElementById("formDireccion");
  const mensaje = document.getElementById("direccionMensaje");
  const titulo = document.getElementById("domicilioTitulo");
  const boton = document.getElementById("btnGuardarDireccion");

  const direccionEditId = localStorage.getItem("direccionEditId");

  if (direccionEditId) {
    titulo.textContent = "Editar dirección";
    boton.textContent = "Actualizar";
    cargarDireccion(direccionEditId);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensaje.textContent = "";

    const payload = {
      ciudad: form.ciudad.value.trim(),
      calle: form.calle.value.trim(),
      colonia: form.colonia.value.trim(),
      codigoPostal: form.codigoPostal.value.trim(),
      numeroExterior: form.numeroExterior.value.trim(),
      numeroInterior: form.numeroInterior.value.trim(),
    };

    if (!payload.ciudad || !payload.calle || !payload.colonia || !payload.codigoPostal || !payload.numeroExterior) {
      mensaje.textContent = "Completa los campos obligatorios.";
      return;
    }

    try {
      boton.disabled = true;
      boton.textContent = direccionEditId ? "Actualizando..." : "Guardando...";

      if (direccionEditId) {
        await DireccionService.actualizar(direccionEditId, payload);
        mensaje.textContent = "Dirección actualizada correctamente.";
      } else {
        await DireccionService.crear(payload);
        mensaje.textContent = "Dirección agregada correctamente.";
        form.reset();
      }

      localStorage.removeItem("direccionEditId");
      
      // Obtener página de origen o usar la predeterminada
      const paginaOrigen = localStorage.getItem('paginaOrigen') || '/frontend/src/pages/direcciones-page.html';
      localStorage.removeItem('paginaOrigen');
      
      setTimeout(() => {
        window.location.href = paginaOrigen;
      }, 1200);
    } catch (error) {
      mensaje.textContent = error.message || "No se pudo guardar la dirección.";
    } finally {
      boton.disabled = false;
      boton.textContent = direccionEditId ? "Actualizar" : "Guardar";
    }
  });

  async function cargarDireccion(id) {
    try {
      const response = await DireccionService.obtenerPorId(id);
      const direccion = response.data;

      form.ciudad.value = direccion.ciudad || "";
      form.calle.value = direccion.calle || "";
      form.colonia.value = direccion.colonia || "";
      form.codigoPostal.value = direccion.codigoPostal || "";
      form.numeroExterior.value = direccion.numeroExterior || "";
      form.numeroInterior.value = direccion.numeroInterior || "";
    } catch (error) {
      mensaje.textContent = "No se pudo cargar la dirección seleccionada.";
      localStorage.removeItem("direccionEditId");
    }
  }
});


