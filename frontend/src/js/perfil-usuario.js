import UsuarioService from '../services/usuario.service.js';

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const usuarioRaw = localStorage.getItem("usuario");
  const contenido = document.getElementById("perfilContent");
  const loginPrompt = document.getElementById("perfilLoginPrompt");
  const mensaje = document.getElementById("perfilMensaje");

  if (!token || !usuarioRaw) {
    if (contenido) contenido.hidden = true;
    if (loginPrompt) loginPrompt.hidden = false;
    const btnLogin = document.getElementById("irIniciarSesion");
    if (btnLogin) {
      btnLogin.addEventListener("click", () => {
        window.location.href = "/frontend/src/pages/login-page.html";
      });
    }
    return;
  }

  const usuario = JSON.parse(usuarioRaw);
  const nombreCompleto = [usuario.nombres, usuario.apellidoPaterno, usuario.apellidoMaterno]
    .filter(Boolean)
    .join(" ");

  document.getElementById("perfilNombre").textContent = nombreCompleto || "Mi perfil";
  document.getElementById("perfilBienvenida").textContent =
    "Bienvenido a tu cuenta, en esta sección podrás modificar tus datos.";
  document.getElementById("perfilCorreo").textContent = usuario.correo || "";

  document.getElementById("linkDirecciones").addEventListener("click", (e) => {
    e.preventDefault();
    window.location.href = "/frontend/src/pages/direcciones-page.html";
  });

  // Botón de cerrar sesión
  const btnCerrarSesion = document.getElementById("btnCerrarSesion");
  if (btnCerrarSesion) {
    btnCerrarSesion.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        cerrarSesion();
      }
    });
  }

  const form = document.getElementById("formActualizarContrasena");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    mensaje.textContent = "";

    const contrasenaActual = document.getElementById("contrasena-actual").value;
    const nuevaContrasena = document.getElementById("nueva-contrasena").value;
    const confirmar = document.getElementById("confirmar-nueva-contrasena").value;

    if (!contrasenaActual || !nuevaContrasena || !confirmar) {
      mensaje.textContent = "Completa todos los campos.";
      return;
    }

    if (nuevaContrasena !== confirmar) {
      mensaje.textContent = "Las contraseñas no coinciden.";
      return;
    }

    try {
      const boton = form.querySelector("button");
      boton.disabled = true;
      boton.textContent = "Actualizando...";

      await UsuarioService.login(usuario.nombreUsuario, contrasenaActual);
      const response = await UsuarioService.actualizar(usuario.id, {
        contrasena: nuevaContrasena,
      });

      mensaje.textContent = "Contraseña actualizada correctamente.";
      document.getElementById("contrasena-actual").value = "";
      document.getElementById("nueva-contrasena").value = "";
      document.getElementById("confirmar-nueva-contrasena").value = "";

      if (response.data) {
        localStorage.setItem("usuario", JSON.stringify(response.data));
      }
    } catch (error) {
      mensaje.textContent = error.message || "No se pudo actualizar la contraseña.";
    } finally {
      const boton = form.querySelector("button");
      boton.disabled = false;
      boton.textContent = "Guardar cambios";
    }
  });

  function cerrarSesion() {
    // Limpiar datos de sesión
    UsuarioService.logout();
    localStorage.removeItem('usuario');
    localStorage.removeItem('cart');
    localStorage.removeItem('checkout');
    
    // Redirigir a login
    window.location.href = '/frontend/src/pages/login-page.html';
  }
});


