// frontend/src/js/gestionar-documentos.js

import AdopcionService from '../services/adopcion.service.js';
import MascotaService from '../services/mascota.service.js';

document.addEventListener('DOMContentLoaded', () => {
  init().catch(err => console.error('Error init gestionar-documentos:', err));
});


async function init() {
  const cont = document.querySelector('.documentos-container');
  if (!cont) return;

  if (!isAuthenticated()) {
    return redirectToLogin();
  }

  const params = Object.fromEntries(new URLSearchParams(window.location.search));
  const adopcionId = params.id;
  
  if (!adopcionId) return showMessage(cont, 'No se especificó la solicitud de adopción (id)', 'red');

  // Guardar la plantilla antes de borrarla con el mensaje de carga
  const plantillaGuardada = cont.innerHTML; 
  showMessage(cont, 'Cargando solicitud...');

  const adopcion = await fetchAdopcion(adopcionId, params.mascotaId);
  if (!adopcion) return showMessage(cont, 'Solicitud no encontrada', '#999');

  // Restaurar plantilla y poblar con datos
  cont.innerHTML = plantillaGuardada;
  populateTemplate(cont, adopcion);
  attachActionButtons(cont, adopcion.id);
}


function isAuthenticated() {
  return !!localStorage.getItem('token');
}

function redirectToLogin() {
  window.location.href = '/frontend/src/pages/login-page.html';
}

function showMessage(container, text, color) {
  container.innerHTML = `<p style="text-align:center;padding:40px;${color ? `color:${color}` : ''}">${text}</p>`;
}

async function fetchAdopcion(id, mascotaId) {
  try {
    const resp = await AdopcionService.obtenerPorId(id, { includeUsuario: true, includeMascota: true });
    
    // Si la mascota no viene incluida, intentar obtenerla por separado
    if (!resp.mascota && mascotaId) {
      resp.mascota = await tryGetMascota(mascotaId);
    }
    return resp?.data || resp;
  } catch (e) {
    console.error('Error fetchAdopcion', e);
    return null;
  }
}

async function tryGetMascota(id) {
  try {
    const m = await MascotaService.obtenerPorId(id, true);
    return m?.data || m;
  } catch (e) {
    console.warn('No se pudo obtener mascota:', e.message || e);
    return null;
  }
}

function normalizeDocumentos(field) {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'object') return Object.values(field);
  if (typeof field === 'string') {
    try { 
      const p = JSON.parse(field); 
      return Array.isArray(p) ? p : (typeof p === 'object' ? Object.values(p) : [p]); 
    } catch (e) { 
      return [field]; 
    }
  }
  return [field];
}


function populateTemplate(cont, adopcion) {
  const { usuario = {}, mascota = {} } = adopcion;

  const nombreUsuario = usuario.nombres ? `${usuario.nombres} ${usuario.apellidoPaterno || ''}`.trim() : (usuario.nombreUsuario || 'Solicitante desconocido');
  const nombreMascota = (mascota.nombre || mascota.nombreMascota) || 'Mascota';

  // Datos principales
  cont.querySelector('.nombre-destacado').textContent = nombreMascota;
  cont.querySelector('.nombre-solicitante').textContent = nombreUsuario;
  cont.querySelector('.info-value').textContent = adopcion.tipoVivienda || 'N/A';
  cont.querySelector('.razon-box p').textContent = adopcion.razonAdopcion || 'No especificada';

  // Booleano (Sí/No)
  const infoSiElements = cont.querySelectorAll('.info-value-si');
  if (infoSiElements[0]) infoSiElements[0].textContent = adopcion.tienePatio ? 'Sí' : 'No';
  if (infoSiElements[1]) infoSiElements[1].textContent = adopcion.tieneExperiencia ? 'Sí' : 'No';

  // Imagen de Mascota
  const imagenMascota = cont.querySelector('.mascota-imagen-preview');
  if (imagenMascota) {
      imagenMascota.src = mascota.imagen || '/frontend/src/assets/images/dog.png';
      imagenMascota.alt = `Foto de ${nombreMascota}`;
  }
  
  // Documentos
  populateDocumentSections(cont, adopcion);
}

function populateDocumentSections(cont, adopcion) {
  const documentos = normalizeDocumentos(adopcion.documentosSolicitud);
  const archivosSeccion = cont.querySelector('.archivos-seccion');
  if (!archivosSeccion) return;

  // 1. Foto de credencial
  const primerItem = archivosSeccion.querySelector('.archivo-item:first-child');
  if (primerItem) {
    primerItem.innerHTML = `<span class="info-label">Foto de credencial:</span>`;
    const doc = documentos[0];

    if (doc) {
      const isImage = typeof doc === 'string' && doc.startsWith('data:image');
      
      if (isImage) {
        const img = document.createElement('img'); 
        img.src = doc; img.alt = 'Credencial'; 
        img.style.cssText = 'max-width:15rem; max-height:15rem; margin:8px 0;';
        primerItem.appendChild(img);

        // Enlace oculto para mantener funcionalidad si es necesario
        const a = document.createElement('a'); 
        a.href = doc; a.target = '_blank'; a.className = 'archivo-link';
        a.textContent = 'Ver documento (Clic)';
        a.style.display = 'none'; // Ocultar el texto azul
        primerItem.appendChild(a);
      } else {
        const a = document.createElement('a');
        a.href = doc; a.target = '_blank'; a.className = 'archivo-link';
        a.textContent = doc.startsWith('data:application/pdf') ? 'Ver credencial (PDF)' : ('' + doc).split('/').pop() || 'Ver credencial';
        primerItem.appendChild(a);
      }
    } else {
      const p = document.createElement('p');
      p.style.color = '#999'; p.textContent = 'No disponible';
      primerItem.appendChild(p);
    }
  }

  // 2. Fotos extras
  const listaExtras = archivosSeccion.querySelector('.archivo-item:nth-child(2) .archivos-lista');
  if (listaExtras) {
    listaExtras.innerHTML = ''; 
    const extras = documentos.slice(1);
    
    if (extras.length > 0) {
      extras.forEach((doc, i) => {
        const itemContainer = document.createElement('div');
        itemContainer.style.cssText = 'display:flex; align-items:center; gap:8px;';
        const isImage = typeof doc === 'string' && doc.startsWith('data:image');
        
        if (isImage) {
          const img = document.createElement('img');
          img.src = doc; img.alt = `Imagen ${i + 1}`;
          img.style.cssText = 'max-width:15rem; max-height:15rem; object-fit:cover;';
          
          // Envolver la imagen en el enlace (<a>) para que sea clickeable
          const a_img = document.createElement('a');
          a_img.href = doc; a_img.target = '_blank';
          a_img.appendChild(img);
          itemContainer.appendChild(a_img);
        } else {
          // Si es PDF/otro, mostrar solo el enlace azul
          const a = document.createElement('a');
          a.className = 'archivo-link'; a.href = doc; a.target = '_blank';
          a.textContent = doc.startsWith('data:application/pdf') ? `Documento ${i + 1} (PDF)` : ('' + doc).split('/').pop() || `Documento ${i + 1}`;
          itemContainer.appendChild(a);
        }
        listaExtras.appendChild(itemContainer);
      });
    } else {
      const p = document.createElement('p');
      p.style.cssText = 'color:#999; font-style:italic; margin:0;';
      p.textContent = 'No hay fotos extras';
      listaExtras.appendChild(p);
    }
  }
}

// ===================================
//  4. Acciones
// ===================================

function attachActionButtons(container, adopcionId) {
  const aprobo = () => aprobar(adopcionId);
  const rechazo = () => rechazar(adopcionId);
  
  // Asignar a botones dinámicos (si existen)
  container.querySelector('.btn-aprobar')?.addEventListener('click', aprobo);
  container.querySelector('.btn-rechazar')?.addEventListener('click', rechazo);

  // Reemplazar y asignar a botones de la plantilla
  const globalA = document.querySelector('.boton-aceptar');
  if (globalA) { const cloneA = globalA.cloneNode(true); globalA.replaceWith(cloneA); cloneA.addEventListener('click', aprobo); }
  
  const globalR = document.querySelector('.boton-rechazar');
  if (globalR) { const cloneR = globalR.cloneNode(true); globalR.replaceWith(cloneR); cloneR.addEventListener('click', rechazo); }
}

async function aprobar(id) {
  if (!confirm('¿Estás seguro de aprobar esta solicitud de adopción?')) return;
  try { await AdopcionService.aprobar(id); alert('Solicitud aprobada'); window.location.href = '/frontend/src/pages/gestionar-mascotas.html'; } catch (e) { console.error(e); alert('Error al aprobar: ' + (e.message || e)); }
}

async function rechazar(id) {
  if (!confirm('¿Estás seguro de rechazar esta solicitud de adopción?')) return;
  try { await AdopcionService.rechazar(id); alert('Solicitud rechazada'); window.location.href = '/frontend/src/pages/gestionar-mascotas.html'; } catch (e) { console.error(e); alert('Error al rechazar: ' + (e.message || e)); }
}