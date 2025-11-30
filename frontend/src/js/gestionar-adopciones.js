// frontend/src/js/gestionar-adopciones.js

import AdopcionService from '../services/adopcion.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const adopcionesCard = document.querySelector('.adopciones-card');
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  let estadoFiltro = 'todos';
  
  // Event listeners para filtros
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Actualizar botones activos
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      estadoFiltro = btn.dataset.estado;
      cargarAdopciones(estadoFiltro);
    });
  });

  // Cargar adopciones al iniciar
  await cargarAdopciones(estadoFiltro);

  /**
   * Cargar adopciones según el filtro
   */
  async function cargarAdopciones(estado = 'todos') {
    try {
      adopcionesCard.innerHTML = '<p class="loading-message">Cargando adopciones...</p>';
      
      let response;
      if (estado === 'todos') {
        response = await AdopcionService.obtenerTodas({
          includeUsuario: true,
          includeMascota: true,
          limit: 100,
          offset: 0
        });
      } else {
        response = await AdopcionService.obtenerTodas({
          includeUsuario: true,
          includeMascota: true,
          limit: 100,
          offset: 0,
          estadoSolicitud: estado
        });
      }
      
      const adopciones = response.data || [];
      
      if (!adopciones || adopciones.length === 0) {
        adopcionesCard.innerHTML = '<p class="empty-message">No hay adopciones registradas</p>';
        return;
      }

      // Limpiar contenedor
      adopcionesCard.innerHTML = '';

      // Renderizar cada adopción
      adopciones.forEach((adopcion, index) => {
        const adopcionElement = crearElementoAdopcion(adopcion);
        adopcionesCard.appendChild(adopcionElement);
        
        // Agregar divisor excepto en el último
        if (index < adopciones.length - 1) {
          const divider = document.createElement('hr');
          divider.className = 'divider';
          adopcionesCard.appendChild(divider);
        }
      });

    } catch (error) {
      console.error('Error al cargar adopciones:', error);
      adopcionesCard.innerHTML = '<p class="error-message">Error al cargar adopciones. Por favor intenta de nuevo.</p>';
    }
  }

  /**
   * Crear elemento HTML para una adopción
   */
  function crearElementoAdopcion(adopcion) {
    const div = document.createElement('div');
    div.className = 'adopcion-card';
    div.dataset.adopcionId = adopcion.id;

    const usuario = adopcion.usuario || {};
    const mascota = adopcion.mascota || {};
    const nombreUsuario = usuario.nombres ? 
      `${usuario.nombres} ${usuario.apellidoPaterno || ''}`.trim() : 
      usuario.nombreUsuario || 'Usuario desconocido';
    
    const nombreMascota = mascota.nombre || 'Mascota sin nombre';
    const especieMascota = mascota.especie || 'N/A';
    const estado = adopcion.estadoSolicitud || 'pendiente';
    
    // Formatear fecha
    const fechaSolicitud = adopcion.fechaSolicitud ? 
      new Date(adopcion.fechaSolicitud).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }) : 'Fecha no disponible';

    // Clase CSS según estado
    const estadoClass = `estado-${estado}`;
    const estadoTexto = {
      'pendiente': 'Pendiente',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada'
    }[estado] || estado;

    div.innerHTML = `
      <div class="adopcion-imagen">
        <img src="${mascota.imagen || '/frontend/src/assets/images/dog.png'}" 
             alt="${nombreMascota}">
      </div>
      
      <div class="adopcion-detalles">
        <div class="adopcion-header">
          <h3>${nombreMascota}</h3>
          <span class="estado-badge ${estadoClass}">${estadoTexto}</span>
        </div>
        
        <div class="adopcion-info">
          <p><strong>Especie:</strong> ${especieMascota}</p>
          <p><strong>Solicitante:</strong> ${nombreUsuario}</p>
          <p><strong>Email:</strong> ${usuario.correo || 'N/A'}</p>
          <p><strong>Fecha de solicitud:</strong> ${fechaSolicitud}</p>
          <p><strong>Tipo de vivienda:</strong> ${adopcion.tipoVivienda || 'N/A'}</p>
          <p><strong>Tiene patio:</strong> ${adopcion.tienePatio ? 'Sí' : 'No'}</p>
          <p><strong>Tiene experiencia:</strong> ${adopcion.tieneExperiencia ? 'Sí' : 'No'}</p>
        </div>
        
        <div class="razon-adopcion">
          <p><strong>Razón de adopción:</strong></p>
          <p class="razon-texto">${adopcion.razonAdopcion || 'No especificada'}</p>
        </div>
      </div>
      
      <div class="adopcion-actions">
        ${estado === 'pendiente' ? `
          <button class="action-btn btn-aprobar" data-id="${adopcion.id}">
            Aprobar
          </button>
          <button class="action-btn btn-rechazar" data-id="${adopcion.id}">
            Rechazar
          </button>
        ` : `
          <p class="estado-finalizado">Solicitud ${estadoTexto.toLowerCase()}</p>
        `}
      </div>
    `;

    // Event listeners para botones de acción (solo si están pendientes)
    if (estado === 'pendiente') {
      const btnAprobar = div.querySelector('.btn-aprobar');
      const btnRechazar = div.querySelector('.btn-rechazar');

      btnAprobar.addEventListener('click', () => aprobarAdopcion(adopcion.id));
      btnRechazar.addEventListener('click', () => rechazarAdopcion(adopcion.id));
    }

    return div;
  }

  /**
   * Aprobar solicitud de adopción
   */
  async function aprobarAdopcion(id) {
    if (!confirm('¿Estás seguro de aprobar esta solicitud de adopción?')) {
      return;
    }

    try {
      console.log('✅ Aprobando adopción:', id);
      
      const response = await AdopcionService.aprobar(id);
      
      console.log('✅ Respuesta del servidor:', response);
      
      alert('Solicitud de adopción aprobada exitosamente');
      await cargarAdopciones(estadoFiltro); // Recargar la lista
      
    } catch (error) {
      console.error('❌ Error al aprobar adopción:', error);
      alert(`Error al aprobar la solicitud: ${error.message}`);
    }
  }

  /**
   * Rechazar solicitud de adopción
   */
  async function rechazarAdopcion(id) {
    if (!confirm('¿Estás seguro de rechazar esta solicitud de adopción?')) {
      return;
    }

    try {
      console.log('❌ Rechazando adopción:', id);
      
      const response = await AdopcionService.rechazar(id);
      
      console.log('✅ Respuesta del servidor:', response);
      
      alert('Solicitud de adopción rechazada');
      await cargarAdopciones(estadoFiltro); // Recargar la lista
      
    } catch (error) {
      console.error('❌ Error al rechazar adopción:', error);
      alert(`Error al rechazar la solicitud: ${error.message}`);
    }
  }
});

