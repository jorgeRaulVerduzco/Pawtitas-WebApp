// frontend/src/js/registro.js
import UsuarioService from '../services/usuario.service.js';

document.addEventListener('DOMContentLoaded', () => {
  const registroForm = document.getElementById('registroForm');
  const mensajeError = document.getElementById('mensaje-error');
  const mensajeExito = document.getElementById('mensaje-exito');

  registroForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Limpiar mensajes anteriores
    mensajeError.style.display = 'none';
    mensajeExito.style.display = 'none';
    
    // Obtener valores del formulario
    const nombres = document.getElementById('nombres').value.trim();
    const apellidoPaterno = document.getElementById('apellido-paterno').value.trim();
    const apellidoMaterno = document.getElementById('apellido-materno').value.trim();
    const nombreUsuario = document.getElementById('nombre-usuario').value.trim();
    const correo = document.getElementById('email').value.trim();
    const contrasena = document.getElementById('contrasena').value;
    const confirmarContrasena = document.getElementById('confirmar-contrasena').value;
    const rol = document.getElementById('rol').value;

    // Validaciones
    if (!nombres || !apellidoPaterno || !nombreUsuario || !correo || !contrasena) {
      mostrarError('Por favor completa todos los campos obligatorios');
      return;
    }

    if (contrasena !== confirmarContrasena) {
      mostrarError('Las contraseñas no coinciden');
      return;
    }

    if (contrasena.length < 6) {
      mostrarError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      mostrarError('Por favor ingresa un correo electrónico válido');
      return;
    }

    try {
      // Deshabilitar botón mientras se procesa
      const boton = registroForm.querySelector('button[type="submit"]');
      boton.disabled = true;
      boton.textContent = 'Creando cuenta...';

      // Preparar datos para enviar
      const userData = {
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        nombreUsuario,
        correo,
        contrasena,
        rol
      };

      // Llamar al servicio de registro
      const response = await UsuarioService.registrar(userData);

      // Registro exitoso
      console.log('Registro exitoso:', response);
      
      mostrarExito('¡Cuenta creada exitosamente! Redirigiendo al login...');
      
      // Limpiar formulario
      registroForm.reset();
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        window.location.href = '/frontend/src/pages/login-page.html';
      }, 2000);

    } catch (error) {
      console.error('Error en registro:', error);
      mostrarError(error.message || 'Error al crear la cuenta. Por favor intenta de nuevo.');
      
      // Rehabilitar botón
      const boton = registroForm.querySelector('button[type="submit"]');
      boton.disabled = false;
      boton.textContent = 'Crear';
    }
  });

  function mostrarError(mensaje) {
    mensajeError.textContent = mensaje;
    mensajeError.style.display = 'block';
    mensajeExito.style.display = 'none';
  }

  function mostrarExito(mensaje) {
    mensajeExito.textContent = mensaje;
    mensajeExito.style.display = 'block';
    mensajeError.style.display = 'none';
  }
});