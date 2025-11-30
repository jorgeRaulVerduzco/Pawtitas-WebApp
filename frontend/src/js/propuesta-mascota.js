// frontend/src/js/propuesta-mascota.js

import AdopcionService from '../services/adopcion.service.js';
import MascotaService from '../services/mascota.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const propuestasContainer = document.querySelector('.propuestas-container');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Obtener ID de mascota de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const mascotaId = urlParams.get('id');

  if (!mascotaId) {
    propuestasContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">No se especificó una mascota</p>';
    return;
  }

  // Cargar información de la mascota y sus solicitudes
  await cargarPropuestas(mascotaId);

  /**
   * Cargar propuestas de adopción para una mascota
   */
  async function cargarPropuestas(mascotaId) {
    try {
      propuestasContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Cargando propuestas...</p>';
      
      // Cargar información de la mascota
      const mascotaResponse = await MascotaService.obtenerPorId(mascotaId, true);
      const mascota = mascotaResponse.data;
      
      if (mascota && mascota.nombre) {
        const titulo = document.querySelector('.nombre-destacado');
        if (titulo) {
          titulo.textContent = mascota.nombre;
        }
      }

      // Cargar solicitudes de adopción para esta mascota
      const response = await AdopcionService.obtenerPorMascota(mascotaId, true);
      const adopciones = response.data || [];
      
      // Filtrar solo pendientes
      const pendientes = adopciones.filter(a => a.estadoSolicitud === 'pendiente');
      
      if (pendientes.length === 0) {
        propuestasContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No hay solicitudes pendientes para esta mascota</p>';
        return;
      }

      // Limpiar contenedor
      propuestasContainer.innerHTML = '';

      // Renderizar cada propuesta
      pendientes.forEach((adopcion) => {
        const propuestaElement = crearElementoPropuesta(adopcion, mascotaId);
        propuestasContainer.appendChild(propuestaElement);
      });

    } catch (error) {
      console.error('Error al cargar propuestas:', error);
      propuestasContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error al cargar propuestas. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Crear elemento HTML para una propuesta
   */
  function crearElementoPropuesta(adopcion, mascotaId) {
    const item = document.createElement('div');
    item.className = 'propuesta-item';

    const usuario = adopcion.usuario || {};
    const nombreUsuario = usuario.nombres ? 
      `${usuario.nombres} ${usuario.apellidoPaterno || ''}`.trim() : 
      usuario.nombreUsuario || 'Usuario desconocido';

    item.innerHTML = `
      <span class="punto-morado">•</span>
      <div class="propuesta-content">
        <p class="solicitud-texto">
          <span class="solicitud-label">Solicitud de:</span>
          <span class="nombre-solicitante">${nombreUsuario}</span>
        </p>
        <a href="/frontend/src/pages/gestionar-documentos.html?id=${adopcion.id}&mascotaId=${mascotaId}" class="link-gestionar">
          Gestionar documentos --->
        </a>
      </div>
    `;

    return item;
  }
});

