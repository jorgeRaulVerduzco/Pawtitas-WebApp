// frontend/src/js/gestionar-mascotas.js

import MascotaService from '../services/mascota.service.js';
import AdopcionService from '../services/adopcion.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const gestionContainer = document.querySelector('.gestion-container');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Cargar mascotas al iniciar (por defecto: todas)
  let estadoFiltro = 'todos';
  // Event listeners para filtros (si existen en el HTML)
  if (filterButtons && filterButtons.length) {
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        estadoFiltro = btn.dataset.estado || 'todos';
        cargarMascotas(estadoFiltro);
      });
    });
  }

  await cargarMascotas(estadoFiltro);

  /**
   * Cargar todas las mascotas
   */
  async function cargarMascotas(estado = 'todos') {
    try {
      gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Cargando mascotas...</p>';
      let mascotas = [];

      if (estado === 'todos') {
        const response = await MascotaService.obtenerTodas({
          includeCentro: true,
          limit: 100,
          offset: 0
        });
        mascotas = response.data || [];
      } else {
        // Obtener adopciones filtradas por estado y extraer mascotas relacionadas
        const resp = await AdopcionService.obtenerTodas({ includeMascota: true, estadoSolicitud: estado, limit: 1000, offset: 0 });
        const adopciones = resp.data || [];
        const map = new Map();
        adopciones.forEach(a => {
          if (a.mascota && a.mascota.id) map.set(a.mascota.id, a.mascota);
        });
        mascotas = Array.from(map.values());
      }
      
      if (!mascotas || mascotas.length === 0) {
        gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px;">No hay mascotas registradas</p>';
        return;
      }

      // Limpiar contenedor
      gestionContainer.innerHTML = '';

      // Renderizar cada mascota
      mascotas.forEach((mascota) => {
        const mascotaElement = crearElementoMascota(mascota);
        gestionContainer.appendChild(mascotaElement);
      });

    } catch (error) {
      console.error('Error al cargar mascotas:', error);
      gestionContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Error al cargar mascotas. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Crear elemento HTML para una mascota
   */
  function crearElementoMascota(mascota) {
    const wrapper = document.createElement('div');
    wrapper.className = 'gestion-wrapper';

    const card = document.createElement('div');
    card.className = 'gestion-card';
    card.dataset.mascotaId = mascota.id;

    const nombre = mascota.nombre || 'Sin nombre';
    const estado = mascota.estado || 'disponible';
    const imagen = mascota.imagen || '/frontend/src/assets/images/dog.png';
    
    // Normalizar imagen
    const imagenNormalizada = imagen.startsWith('http') || imagen.startsWith('/') || imagen.startsWith('data:') 
      ? imagen 
      : `/frontend/${imagen}`;

    // Formatear fecha
    const fechaPublicacion = mascota.createdAt ? 
      new Date(mascota.createdAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Fecha no disponible';

    // Determinar texto y clase según estado
    let estadoTexto, estadoClass;
    if (estado === 'adoptado') {
      estadoTexto = 'Adoptada';
      estadoClass = 'estado-value-aceptada';
    } else if (estado === 'disponible') {
      estadoTexto = 'Disponible';
      estadoClass = 'estado-value-pendiente';
    } else {
      estadoTexto = estado;
      estadoClass = 'estado-value-pendiente';
    }

    // Obtener solicitudes pendientes para esta mascota
    obtenerSolicitudesPendientes(mascota.id).then(count => {
      const solicitudesCount = card.querySelector('.solicitudes-count');
      if (solicitudesCount) {
        solicitudesCount.textContent = `${count} solicitudes pendientes`;
      }
    });

    card.innerHTML = `
      <div class="img-container">
        <img src="${imagenNormalizada}" alt="${nombre}" />
      </div>
      <div class="text-content">
        <h2 class="nombre-mascota">${nombre}</h2>
        <div class="estado-info">
          <span class="estado-label">Estado:</span>
          <span class="${estadoClass}">${estadoTexto}</span>
        </div>
        ${estado === 'disponible' ? `
          <p class="solicitudes-count">Cargando solicitudes...</p>
          <a href="/frontend/src/pages/propuesta-mascota.html?id=${mascota.id}">
            <button class="boton-revisar">Revisar solicitudes</button>
          </a>
        ` : ''}
        <p class="fecha">${estado === 'adoptado' ? 'Mascota adoptada el: ' : 'Publicado el: '}${fechaPublicacion}</p>
      </div>
    `;

    wrapper.appendChild(card);
    return wrapper;
  }

  /**
   * Obtener cantidad de solicitudes pendientes para una mascota
   */
  async function obtenerSolicitudesPendientes(mascotaId) {
    try {
      const response = await (await import('../services/adopcion.service.js')).default.obtenerPorMascota(mascotaId, false);
      const adopciones = response.data || [];
      return adopciones.filter(a => a.estadoSolicitud === 'pendiente').length;
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      return 0;
    }
  }
});

