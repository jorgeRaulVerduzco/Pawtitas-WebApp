// frontend/src/js/propuesta-adopcion.js

import MascotaService from '../services/mascota.service.js';
import AdopcionService from '../services/adopcion.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const gestionContainer = document.querySelector('.gestion-container');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Cargar mascotas con solicitudes pendientes
  await cargarPropuestas();

  /**
   * Cargar mascotas con solicitudes pendientes
   */
  async function cargarPropuestas() {
    try {
      gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Cargando propuestas...</p>';
      
      // Obtener todas las mascotas
      const mascotasResponse = await MascotaService.obtenerTodas({
        includeCentro: true,
        limit: 100,
        offset: 0
      });
      
      const mascotas = mascotasResponse.data || [];
      
      if (!mascotas || mascotas.length === 0) {
        gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No hay mascotas registradas</p>';
        return;
      }

      // Para cada mascota, obtener solicitudes pendientes
      const mascotasConSolicitudes = [];
      
      for (const mascota of mascotas) {
        try {
          const adopcionesResponse = await AdopcionService.obtenerPorMascota(mascota.id, false);
          const adopciones = adopcionesResponse.data || [];
          const pendientes = adopciones.filter(a => a.estadoSolicitud === 'pendiente');
          
          if (pendientes.length > 0) {
            mascotasConSolicitudes.push({
              mascota,
              count: pendientes.length
            });
          }
        } catch (error) {
          console.error(`Error al obtener solicitudes para mascota ${mascota.id}:`, error);
        }
      }

      if (mascotasConSolicitudes.length === 0) {
        gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No hay solicitudes pendientes</p>';
        return;
      }

      // Limpiar contenedor
      gestionContainer.innerHTML = '';

      // Renderizar cada mascota con solicitudes
      mascotasConSolicitudes.forEach((item) => {
        const mascotaElement = crearElementoMascota(item.mascota, item.count);
        gestionContainer.appendChild(mascotaElement);
      });

    } catch (error) {
      console.error('Error al cargar propuestas:', error);
      gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error al cargar propuestas. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Crear elemento HTML para una mascota con solicitudes
   */
  function crearElementoMascota(mascota, count) {
    const wrapper = document.createElement('div');
    wrapper.className = 'gestion-wrapper';

    const card = document.createElement('div');
    card.className = 'gestion-card';

    const nombre = mascota.nombre || 'Sin nombre';
    const imagen = mascota.imagen || '/frontend/src/assets/images/dog.png';
    
    // Normalizar imagen
    const imagenNormalizada = imagen.startsWith('http') || imagen.startsWith('/') || imagen.startsWith('data:') 
      ? imagen 
      : `/frontend/${imagen}`;

    card.innerHTML = `
      <div class="img-container">
        <img src="${imagenNormalizada}" alt="${nombre}" />
      </div>
      <div class="text-content">
        <h2 class="nombre-mascota">${nombre}</h2>
        <p class="solicitudes-count">${count} solicitudes pendientes</p>
        <a href="/frontend/src/pages/propuesta-mascota.html?id=${mascota.id}">
          <button class="boton-revisar">Revisar</button>
        </a>
      </div>
    `;

    wrapper.appendChild(card);
    return wrapper;
  }
});

