import AdopcionService from '../services/adopcion.service.js';

function normalizeImagePath(img) {
  if (!img) return '/frontend/src/assets/images/dog.png';
  if (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')) return img;
  return `/frontend/${img}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString();
}

function createCard(adopcion) {
  const mascota = adopcion.mascota || {};
  const container = document.createElement('div');
  container.className = 'estado-wrapper';

  const fecha = formatDate(adopcion.fechaSolicitud || adopcion.createdAt || adopcion.fecha);
  const estado = adopcion.estadoSolicitud || adopcion.estado || 'Pendiente';

  container.innerHTML = `
    <div class="solicitud-card"> 
      <div class="img-container"> 
        <img src="${normalizeImagePath(mascota.imagen)}" alt="Imagen de ${mascota.nombre || 'mascota'}">
      </div>
      <div class="text-content">
        <h2 class="nombre-mascota">${mascota.nombre || '-'}</h2>
        <p class="descripcion">${mascota.descripcion || (mascota.tamano ? 'Tamaño: ' + mascota.tamano : '')}</p>
        <p class="fecha">${fecha}</p>
      </div>
    </div>
    <div class="estado-info">
      <span class="estado-label">Estado:</span>
      <span class="estado-value">${estado.charAt(0).toUpperCase() + estado.slice(1)}</span>
    </div>
  `;

  return container;
}

async function loadSolicitudes() {
  const usuarioRaw = localStorage.getItem('usuario');
  if (!usuarioRaw) {
    // redirect to login page
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  const usuario = JSON.parse(usuarioRaw);
  const userId = usuario.id;

  const container = document.querySelector('.solicitudes-container');
  if (!container) return;
  container.innerHTML = '<p>Cargando solicitudes...</p>';

  try {
    const resp = await AdopcionService.obtenerHistorialUsuario(userId);
    const adopciones = resp && resp.data ? resp.data : [];

    if (!adopciones.length) {
      container.innerHTML = '<p>No has enviado solicitudes de adopción aún.</p>';
      return;
    }

    // Ordenado en orden cronológico inverso (últimas primero)
    container.innerHTML = '';
    const ordered = Array.isArray(adopciones) ? adopciones.slice().reverse() : adopciones;
    ordered.forEach(a => {
      const card = createCard(a);
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error cargando solicitudes de adopción:', err);
    container.innerHTML = '<p>Error al cargar solicitudes. Revisa la consola.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadSolicitudes);
