// frontend/src/js/gestionar-documentos.js

import AdopcionService from '../services/adopcion.service.js';
import MascotaService from '../services/mascota.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const documentosContainer = document.querySelector('.documentos-container');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Obtener IDs de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const adopcionId = urlParams.get('id');
  const mascotaId = urlParams.get('mascotaId');

  if (!adopcionId) {
    documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">No se especificó una solicitud de adopción</p>';
    return;
  }

  // Cargar información de la solicitud
  await cargarDocumentos(adopcionId, mascotaId);

  /**
   * Cargar información de la solicitud de adopción
   */
  async function cargarDocumentos(adopcionId, mascotaId) {
    try {
      documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Cargando información...</p>';
      
      // Cargar información de la adopción
      const adopcionResponse = await AdopcionService.obtenerPorId(adopcionId, {
        includeUsuario: true,
        includeMascota: true
      });
      
      const adopcion = adopcionResponse.data;
      
      if (!adopcion) {
        documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Solicitud no encontrada</p>';
        return;
      }

      const usuario = adopcion.usuario || {};
      const mascota = adopcion.mascota || {};
      
      const nombreUsuario = usuario.nombres ? 
        `${usuario.nombres} ${usuario.apellidoPaterno || ''}`.trim() : 
        usuario.nombreUsuario || 'Usuario desconocido';
      
      const nombreMascota = mascota.nombre || 'Mascota sin nombre';

      // Actualizar título
      const nombreDestacado = document.querySelector('.nombre-destacado');
      if (nombreDestacado) {
        nombreDestacado.textContent = nombreMascota;
      }

      // Actualizar información de la solicitud
      const nombreSolicitante = document.querySelector('.nombre-solicitante');
      if (nombreSolicitante) {
        nombreSolicitante.textContent = nombreUsuario;
      }

      const tipoVivienda = document.querySelector('.info-value');
      if (tipoVivienda && adopcion.tipoVivienda) {
        tipoVivienda.textContent = adopcion.tipoVivienda;
      }

      const tienePatio = document.querySelectorAll('.info-value-si')[0];
      if (tienePatio) {
        tienePatio.textContent = adopcion.tienePatio ? 'Sí' : 'No';
      }

      const tieneExperiencia = document.querySelectorAll('.info-value-si')[1];
      if (tieneExperiencia) {
        tieneExperiencia.textContent = adopcion.tieneExperiencia ? 'Sí' : 'No';
      }

      const razonBox = document.querySelector('.razon-box p');
      if (razonBox) {
        razonBox.textContent = adopcion.razonAdopcion || 'No especificada';
      }

      // Mostrar documentos si existen
      if (adopcion.documentosSolicitud) {
        const archivosLista = document.querySelector('.archivos-lista');
        if (archivosLista) {
          // Si hay documentos, mostrarlos (formato puede variar)
          archivosLista.innerHTML = `<a href="${adopcion.documentosSolicitud}" class="archivo-link" target="_blank">Ver documentos</a>`;
        }
      }

      // Configurar botones de acción
      const btnAceptar = document.querySelector('.boton-aceptar');
      const btnRechazar = document.querySelector('.boton-rechazar');

      if (btnAceptar) {
        btnAceptar.addEventListener('click', () => aprobarSolicitud(adopcionId));
      }

      if (btnRechazar) {
        btnRechazar.addEventListener('click', () => rechazarSolicitud(adopcionId));
      }

      documentosContainer.style.display = 'block';

    } catch (error) {
      console.error('Error al cargar documentos:', error);
      documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error al cargar información. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Aprobar solicitud de adopción
   */
  async function aprobarSolicitud(id) {
    if (!confirm('¿Estás seguro de aprobar esta solicitud de adopción?')) {
      return;
    }

    try {
      await AdopcionService.aprobar(id);
      alert('Solicitud de adopción aprobada exitosamente');
      
      // Redirigir a gestionar-mascotas
      window.location.href = '/frontend/src/pages/gestionar-mascotas.html';
      
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      alert(`Error al aprobar la solicitud: ${error.message}`);
    }
  }

  /**
   * Rechazar solicitud de adopción
   */
  async function rechazarSolicitud(id) {
    if (!confirm('¿Estás seguro de rechazar esta solicitud de adopción?')) {
      return;
    }

    try {
      await AdopcionService.rechazar(id);
      alert('Solicitud de adopción rechazada');
      
      // Redirigir a gestionar-mascotas
      window.location.href = '/frontend/src/pages/gestionar-mascotas.html';
      
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      alert(`Error al rechazar la solicitud: ${error.message}`);
    }
  }
});

