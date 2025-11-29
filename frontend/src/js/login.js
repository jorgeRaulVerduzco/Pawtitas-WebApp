// frontend/src/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const mensajeError = document.getElementById('mensaje-error');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    mensajeError.style.display = 'none';
    
    const nombreUsuario = document.getElementById('nombre-usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value;

    if (!nombreUsuario || !contrasena) {
      mostrarError('Por favor completa todos los campos');
      return;
    }

    try {
      const boton = loginForm.querySelector('button[type="submit"]');
      boton.disabled = true;
      boton.textContent = 'Iniciando sesión...';

      // Llamar al servicio de login
      const response = await UsuarioService.login(nombreUsuario, contrasena);

      console.log('Respuesta completa:', response); // Para debug

      // Verificar que tenemos el usuario en la respuesta
      if (response.data && response.data.usuario) {
        // Guardar información del usuario
        localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
        
        const rol = response.data.usuario.rol;

        // Redirigir según el rol
        if (rol === 'administrador') {
          window.location.href = 'home-administrador.html';
        } else if (rol === 'empleado') {
          window.location.href = 'home-empresas.html';
        } else {
          // Usuario cliente: ir a la vista de productos
          window.location.href = 'home-productos.html';
        }
      } else {
        throw new Error('Respuesta del servidor incompleta');
      }

    } catch (error) {
      console.error('Error en login:', error);
      mostrarError(error.message || 'Error al iniciar sesión. Por favor intenta de nuevo.');
      
      const boton = loginForm.querySelector('button[type="submit"]');
      boton.disabled = false;
      boton.textContent = 'Iniciar Sesión';
    }
  });

  function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
  }
});