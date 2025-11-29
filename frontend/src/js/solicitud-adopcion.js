import MascotaService from '../services/mascota.service.js';
import AdopcionService from '../services/adopcion.service.js';

function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

function showMascotaResumen(m) {
  // opcional: mostrar nombre/imagen pequeño en la parte superior del formulario
  const cont = document.createElement('div');
  cont.className = 'mascota-resumen';
  const imgSrc = m.imagen ? (m.imagen.startsWith('/') || m.imagen.startsWith('http') ? m.imagen : `/frontend/${m.imagen}`) : '/frontend/src/assets/images/dog.png';
  cont.innerHTML = `
    <div class="mini">
      <img src="${imgSrc}" alt="${m.nombre}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;margin-right:8px;">
      <strong>${m.nombre || '-'}</strong>
    </div>
  `;
  const form = document.querySelector('.general-form');
  if (form) form.prepend(cont);
}

async function init() {
  const idMascota = getQueryParam('id') || getQueryParam('idMascota');
  const idInput = document.getElementById('idMascota');
  if (idInput && idMascota) idInput.value = idMascota;

  // Mostrar resumen de la mascota
  if (idMascota) {
    try {
      const resp = await MascotaService.obtenerPorId(idMascota, true);
      const mascota = resp && resp.data ? resp.data : null;
      if (mascota) showMascotaResumen(mascota);
    } catch (err) {
      console.warn('No se pudo cargar resumen de mascota:', err);
    }
  }

  const form = document.querySelector('.general-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const usuarioRaw = localStorage.getItem('usuario');
    if (!usuarioRaw) {
      alert('Debes iniciar sesión para enviar una solicitud.');
      window.location.href = '/frontend/src/pages/login-page.html';
      return;
    }

    const usuario = JSON.parse(usuarioRaw);
    const idUsuario = usuario.id;

    const idMascotaVal = document.getElementById('idMascota').value;
    const tipoVivienda = document.getElementById('vivienda').value.trim();
    const tienePatio = document.querySelector('input[name="patio"]:checked')?.value === 'si';
    const razon = document.getElementById('razon').value.trim();
    const tieneExperiencia = document.querySelector('input[name="exp"]:checked')?.value === 'si';

    if (!tipoVivienda || !razon) {
      alert('Por favor completa los campos obligatorios.');
      return;
    }

    const payload = {
      idUsuario: Number(idUsuario),
      idMascota: Number(idMascotaVal),
      tipoVivienda,
      tienePatio: !!tienePatio,
      razonAdopcion: razon,
      tieneExperiencia: !!tieneExperiencia,
      documentosSolicitud: null
    };

    try {
      const result = await AdopcionService.crear(payload);
      console.log('Solicitud creada:', result);
      alert('Solicitud enviada correctamente.');
      // Redirigir a historial o a la misma página de perfil
      window.location.href = '/frontend/src/pages/home-adopcion.html';
    } catch (err) {
      console.error('Error enviando solicitud:', err);
      alert('Error al enviar la solicitud: ' + (err.message || err));
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
