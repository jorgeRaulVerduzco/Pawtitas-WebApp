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

    // Procesar archivos subidos
    const documentos = [];
    const ineFile = document.getElementById('ine')?.files[0];
    const fotoViviendaFile = document.getElementById('foto-vivienda')?.files[0];

    console.log('Archivos detectados:', { 
      ine: ineFile ? `${ineFile.name} (${ineFile.size} bytes)` : 'No hay archivo',
      fotoVivienda: fotoViviendaFile ? `${fotoViviendaFile.name} (${fotoViviendaFile.size} bytes)` : 'No hay archivo'
    });

    // Función para convertir archivo a base64
    const convertirArchivoABase64 = (file) => {
      return new Promise((resolve, reject) => {
        if (!file) {
          resolve(null);
          return;
        }
        const reader = new FileReader();
        reader.onload = () => {
          console.log('Archivo convertido a base64, tamaño:', reader.result.length);
          resolve(reader.result);
        };
        reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
        reader.readAsDataURL(file);
      });
    };

    try {
      // Convertir archivos a base64
      if (ineFile) {
        console.log('Convirtiendo INE a base64...');
        const ineBase64 = await convertirArchivoABase64(ineFile);
        if (ineBase64) {
          documentos.push(ineBase64);
          console.log('INE agregado a documentos');
        }
      }

      if (fotoViviendaFile) {
        console.log('Convirtiendo foto de vivienda a base64...');
        const fotoBase64 = await convertirArchivoABase64(fotoViviendaFile);
        if (fotoBase64) {
          documentos.push(fotoBase64);
          console.log('Foto de vivienda agregada a documentos');
        }
      }

      console.log('Total de documentos procesados:', documentos.length);

      // Preparar documentosSolicitud: si hay documentos, guardarlos como JSON string
      // Si solo hay uno, guardarlo directamente; si hay múltiples, como array JSON
      let documentosSolicitud = null;
      if (documentos.length === 1) {
        documentosSolicitud = documentos[0];
        console.log('Un solo documento, guardando como string base64');
      } else if (documentos.length > 1) {
        documentosSolicitud = JSON.stringify(documentos);
        console.log('Múltiples documentos, guardando como JSON string');
      } else {
        console.log('No hay documentos para guardar');
      }

      const payload = {
        idUsuario: Number(idUsuario),
        idMascota: Number(idMascotaVal),
        tipoVivienda,
        tienePatio: !!tienePatio,
        razonAdopcion: razon,
        tieneExperiencia: !!tieneExperiencia,
        documentosSolicitud
      };

      console.log('Payload completo:', payload);
      console.log('documentosSolicitud tiene valor?', documentosSolicitud !== null);
      console.log('Tamaño de documentosSolicitud:', documentosSolicitud ? documentosSolicitud.length : 0);

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
