import DireccionService from '../services/direccion.service.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const usuarioRaw = localStorage.getItem("usuario");
  const lista = document.getElementById("listaDirecciones");
  const mensaje = document.getElementById("direccionesMensaje");

  if (!token || !usuarioRaw) {
    window.location.href = "/frontend/src/pages/login-page.html";
    return;
  }

  const usuario = JSON.parse(usuarioRaw);
  // Actualizamos el nombre del usuario arriba a la izquierda
  document.getElementById("direccionesNombre").textContent =
    [usuario.nombres, usuario.apellidoPaterno].filter(Boolean).join(" ") || "Usuario";

  document.getElementById("btnNuevaDireccion").addEventListener("click", () => {
    localStorage.removeItem("direccionEditId");
    window.location.href = "/frontend/src/pages/agregar-domicilio-page.html";
  });

  cargarDirecciones();

  async function cargarDirecciones() {
    // Usamos un estilo inline temporal para el mensaje de carga
    lista.style.display = 'block'; 
    lista.innerHTML = "<p style='color:#6A1B9A'>Cargando direcciones...</p>";
    
    try {
      const response = await DireccionService.obtenerTodas();
      const direcciones = response.data || [];

      // Restauramos el grid
      lista.style.display = 'grid';
      lista.innerHTML = "";

      if (!direcciones.length) {
        lista.style.display = 'block';
        lista.innerHTML = "<p>No tienes direcciones guardadas todavía.</p>";
        return;
      }

      direcciones.forEach((direccion) => {
        const li = document.createElement("li");
        
        // Estructura limpia: Texto arriba, iconos abajo
        li.innerHTML = `
          <div class="card-content">
            <p class="direcciones">
               ${direccion.calle} ${direccion.numeroExterior}
               ${direccion.numeroInterior ? `<br><small>Int. ${direccion.numeroInterior}</small>` : ''}
            </p>
            <p class="address-text">
                ${direccion.colonia}<br>
                ${direccion.ciudad}, CP ${direccion.codigoPostal}
            </p>
          </div>
          
          <div class="iconos">
            <img src="/frontend/src/assets/images/edit.svg" alt="Editar" title="Editar" data-action="edit">
            <img src="/frontend/src/assets/images/trash.svg" alt="Eliminar" title="Eliminar" data-action="delete">
          </div>
        `;

        const btnEdit = li.querySelector('[data-action="edit"]');
        const btnDelete = li.querySelector('[data-action="delete"]');

        btnEdit.addEventListener("click", () => editarDireccion(direccion.id));
        btnDelete.addEventListener("click", () => eliminarDireccion(direccion.id));

        lista.appendChild(li);
      });
    } catch (error) {
      console.error(error);
      lista.innerHTML = "<p>Error al cargar direcciones.</p>";
      mensaje.textContent = error.message || "Intenta más tarde.";
    }
  }

  function editarDireccion(id) {
    localStorage.setItem("direccionEditId", String(id));
    // Guardar página de origen para regresar después
    localStorage.setItem('paginaOrigen', '/frontend/src/pages/direcciones-page.html');
    window.location.href = "/frontend/src/pages/agregar-domicilio-page.html";
  }

  async function eliminarDireccion(id) {
    const confirmar = confirm("¿Eliminar esta dirección?");
    if (!confirmar) return;

    try {
      await DireccionService.eliminar(id);
      // Mensaje temporal
      mensaje.textContent = "Dirección eliminada.";
      setTimeout(() => mensaje.textContent = "", 3000);
      await cargarDirecciones();
    } catch (error) {
      mensaje.textContent = error.message || "No se pudo eliminar.";
    }
  }
});
