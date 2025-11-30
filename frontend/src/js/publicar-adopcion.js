// frontend/src/js/publicar-adopcion.js

import MascotaService from '../services/mascota.service.js';
import CentroAdopcionService from '../services/centroAdopcion.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.querySelector('.general-form');
  const imagenInput = document.getElementById('imagenArchivo');
  const previewContainer = document.getElementById('previewContainer');
  const previewImagen = document.getElementById('previewImagen');
  const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024; // 3MB
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  if (!form) return;

  // Manejar preview de imagen
  if (imagenInput) {
    imagenInput.addEventListener('change', () => {
      if (!imagenInput.files.length) {
        ocultarPreview();
        return;
      }

      const archivo = imagenInput.files[0];
      if (!validarArchivoImagen(archivo)) {
        imagenInput.value = '';
        ocultarPreview();
        return;
      }

      const objectUrl = URL.createObjectURL(archivo);
      previewImagen.src = objectUrl;
      previewContainer.style.display = 'block';

      previewImagen.onload = () => URL.revokeObjectURL(objectUrl);
    });
  }

  // Obtener o crear un centro de adopción por defecto
  let idCentroAdopcion = null;
  try {
    const centrosResponse = await CentroAdopcionService.obtenerTodos();
    const centros = centrosResponse.centros || centrosResponse.data || [];
    
    if (centros.length > 0) {
      idCentroAdopcion = centros[0].id;
    } else {
      const nuevoCentro = await CentroAdopcionService.crear({
        nombre: 'Centro de Adopción Principal',
        correo: 'centro@adopcion.com',
        telefono: '555-0000'
      });
      idCentroAdopcion = nuevoCentro.centro?.id || nuevoCentro.data?.id || nuevoCentro.id;
    }
  } catch (error) {
    console.error('Error al obtener/crear centro de adopción:', error);
    alert('Error al obtener centro de adopción. Por favor intenta de nuevo.');
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value.trim();
    const raza = document.getElementById('raza').value.trim();
    const edad = document.getElementById('edad').value.trim();
    const peso = document.getElementById('peso').value.trim();
    const sexo = document.getElementById('sexo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const archivoImagen = imagenInput?.files[0];

    const especieCheckboxes = document.querySelectorAll('input[name="especie"]:checked');
    const especies = Array.from(especieCheckboxes).map(cb => cb.value);
    
    if (especies.length === 0) {
      alert('Por favor selecciona al menos una especie');
      return;
    }

    if (!nombre || !raza || !edad || !peso || !sexo || !descripcion) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    let tamano = 'mediano';
    const pesoNum = parseFloat(peso.replace(/[^0-9.]/g, ''));
    if (pesoNum < 10) {
      tamano = 'pequeño';
    } else if (pesoNum > 25) {
      tamano = 'grande';
    }

    // Convertir imagen a base64 SIN compresión (igual que productos)
    let imagenBase64 = null;
    if (archivoImagen) {
      if (!validarArchivoImagen(archivoImagen)) {
        return;
      }
      try {
        imagenBase64 = await convertirArchivoABase64(archivoImagen);
      } catch (error) {
        alert('Error al procesar la imagen. Por favor intenta de nuevo.');
        return;
      }
    }

    const mascotaData = {
      nombre,
      raza,
      edad,
      peso,
      sexo,
      especie: especies[0],
      tamano,
      descripcion,
      estado: 'disponible',
      idCentroAdopcion,
      imagen: imagenBase64
    };

    try {
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publicando...';

      const response = await MascotaService.crear(mascotaData);
      
      alert('Mascota publicada exitosamente');
      window.location.href = '/frontend/src/pages/gestionar-mascotas.html';
      
    } catch (error) {
      console.error('Error al publicar mascota:', error);
      alert(`Error al publicar la mascota: ${error.message}`);
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Publicar';
    }
  });

  function validarArchivoImagen(file) {
    if (!file.type.startsWith('image/')) {
      alert('El archivo seleccionado debe ser una imagen.');
      return false;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      alert('La imagen debe pesar menos de 3MB.');
      return false;
    }

    return true;
  }

  // Conversión simple SIN compresión (igual que productos)
  function convertirArchivoABase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      reader.readAsDataURL(file);
    });
  }

  function ocultarPreview() {
    if (previewContainer) {
      previewContainer.style.display = 'none';
    }
    if (previewImagen) {
      previewImagen.src = '';
    }
  }
});