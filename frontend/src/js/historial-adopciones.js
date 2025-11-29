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
  const fecha = formatDate(adopcion.fechaSolicitud || adopcion.createdAt || adopcion.fecha);
  const estado = adopcion.estadoSolicitud || adopcion.estado || 'Aprobada';

  const container = document.createElement('div');
  container.className = 'estado-wrapper';

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
  `;

  return container;
}

async function loadHistorial() {
  const usuarioRaw = localStorage.getItem('usuario');
  if (!usuarioRaw) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  const usuario = JSON.parse(usuarioRaw);
  const userId = usuario.id;

  const container = document.querySelector('.solicitudes-container');
  if (!container) return;

  container.innerHTML = '<p>Cargando historial...</p>';

  try {
    const resp = await AdopcionService.obtenerHistorialUsuario(userId);
    let adopciones = resp && resp.data ? resp.data : [];

    // Filtrar solo aprobadas
    adopciones = adopciones.filter(a => (a.estadoSolicitud || '').toLowerCase() === 'aprobada');

    // Ordenar cronológicamente: más antiguas primero
    adopciones.sort((a, b) => {
      const da = new Date(a.fechaSolicitud || a.createdAt || a.fecha);
      const db = new Date(b.fechaSolicitud || b.createdAt || b.fecha);
      return da - db;
    });

    container.innerHTML = '';

    if (!adopciones.length) {
      container.innerHTML = '<p>No tienes adopciones aprobadas todavía.</p>';
      return;
    }

    adopciones.forEach(a => {
      const card = createCard(a);
      container.appendChild(card);
    });

  } catch (err) {
    console.error('Error cargando historial de adopciones:', err);
    container.innerHTML = '<p>Error al cargar historial. Revisa la consola.</p>';
  }
}

document.addEventListener('DOMContentLoaded', loadHistorial);
