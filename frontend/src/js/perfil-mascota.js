import MascotaService from '../services/mascota.service.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function normalizeImagePath(img) {
  if (!img) return '/frontend/src/assets/images/dog.png';
  if (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:')) return img;
  return `/frontend/${img}`;
}

async function renderPerfil() {
  const id = getQueryParam('id');
  if (!id) return;

  try {
    const resp = await MascotaService.obtenerPorId(id, true);
    const mascota = resp && resp.data ? resp.data : null;
    if (!mascota) {
      console.error('Mascota no encontrada');
      return;
    }

    // Mapear campos
    const imgEl = document.getElementById('mascota-img');
    const nombreEl = document.getElementById('nombre-mascota');
    const edadEl = document.getElementById('edad-value');
    const especieEl = document.getElementById('especie-value');
    const tamanoEl = document.getElementById('tamano-value');
    const centroEl = document.getElementById('centro-value');
    const razaEl = document.getElementById('raza-value');
    const sexoEl = document.getElementById('sexo-value');
    const descEl = document.getElementById('descripcion-text');

    imgEl.src = normalizeImagePath(mascota.imagen);
    imgEl.alt = mascota.nombre || 'Mascota';
    nombreEl.textContent = mascota.nombre || '-';
    edadEl.textContent = mascota.edad || '-';
    especieEl.textContent = mascota.especie || '-';
    tamanoEl.textContent = mascota.tamano || '-';
    centroEl.textContent = mascota.centro ? mascota.centro.nombre : '-';
    razaEl.textContent = mascota.raza || '-';
    sexoEl.textContent = mascota.sexo || '-';
    descEl.textContent = mascota.descripcion || '-';

    // Botón interesa: redirigir a formulario de solicitud con el id de la mascota
    const interesBtn = document.getElementById('interesar-btn');
    if (interesBtn) {
      interesBtn.addEventListener('click', () => {
        window.location.href = `./solicitud-adopcion.html?id=${mascota.id}`;
      });
    }

  } catch (err) {
    console.error('Error cargando perfil de mascota:', err);
  }
}

document.addEventListener('DOMContentLoaded', renderPerfil);
