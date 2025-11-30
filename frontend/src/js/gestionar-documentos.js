// frontend/src/js/gestionar-documentos.js

import AdopcionService from '../services/adopcion.service.js';
import MascotaService from '../services/mascota.service.js';

document.addEventListener('DOMContentLoaded', async () => {
  const documentosContainer = document.querySelector('.documentos-container');
  
  if (!documentosContainer) {
    console.error('No se encontró el contenedor de documentos');
    return;
  }
  
  // Verificar autenticación
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  // Obtener IDs de la URL
  const urlParams = new URLSearchParams(window.location.search);
  const adopcionId = urlParams.get('id');
  const mascotaId = urlParams.get('mascotaId');

  console.log('IDs obtenidos de URL:', { adopcionId, mascotaId });

  if (!adopcionId) {
    documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">No se especificó una solicitud de adopción</p>';
    return;
  }

  // Cargar información de la solicitud
  await cargarDocumentos(adopcionId, mascotaId);

  /**
   * Cargar información de la solicitud de adopción
   */
  async function cargarDocumentos(adopcionId, mascotaId) {
    try {
      documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Cargando información...</p>';
      
      // Cargar información de la adopción
      const adopcionResponse = await AdopcionService.obtenerPorId(adopcionId, {
        includeUsuario: true,
        includeMascota: true
      });
      
      console.log('Respuesta completa:', adopcionResponse);
      
      // Manejar diferentes estructuras de respuesta
      const adopcion = adopcionResponse?.data || adopcionResponse;
      
      if (!adopcion) {
        documentosContainer.innerHTML = '<p style="text-align: center; padding: 40px; color: red;">Solicitud no encontrada</p>';
        return;
      }

      console.log('Datos de adopción:', adopcion);

      const usuario = adopcion.usuario || {};
      const mascota = adopcion.mascota || {};
      
      const nombreUsuario = usuario.nombres ? 
        `${usuario.nombres} ${usuario.apellidoPaterno || ''}`.trim() : 
        usuario.nombreUsuario || 'Usuario desconocido';
      
      const nombreMascota = mascota.nombre || 'Mascota sin nombre';

      // Actualizar título
      const nombreDestacado = document.querySelector('.nombre-destacado');
      if (nombreDestacado) {
        nombreDestacado.textContent = nombreMascota;
      }

      // Actualizar información de la solicitud
      const nombreSolicitante = document.querySelector('.nombre-solicitante');
      if (nombreSolicitante) {
        nombreSolicitante.textContent = nombreUsuario;
      }

      const tipoVivienda = document.querySelector('.info-value');
      if (tipoVivienda && adopcion.tipoVivienda) {
        tipoVivienda.textContent = adopcion.tipoVivienda;
      }

      const tienePatio = document.querySelectorAll('.info-value-si')[0];
      if (tienePatio) {
        tienePatio.textContent = adopcion.tienePatio ? 'Sí' : 'No';
      }

      const tieneExperiencia = document.querySelectorAll('.info-value-si')[1];
      if (tieneExperiencia) {
        tieneExperiencia.textContent = adopcion.tieneExperiencia ? 'Sí' : 'No';
      }

      const razonBox = document.querySelector('.razon-box p');
      if (razonBox) {
        razonBox.textContent = adopcion.razonAdopcion || 'No especificada';
      }

      // Mostrar documentos si existen
      let documentos = [];
      
      if (adopcion.documentosSolicitud) {
        try {
          // Intentar parsear como JSON (si hay múltiples documentos)
          const parsed = JSON.parse(adopcion.documentosSolicitud);
          if (Array.isArray(parsed)) {
            documentos = parsed;
          } else if (typeof parsed === 'object') {
            // Si es un objeto, convertirlo a array
            documentos = Object.values(parsed);
          } else {
            // Si no es array ni objeto, tratarlo como documento único
            documentos = [adopcion.documentosSolicitud];
          }
        } catch (e) {
          // Si no es JSON, tratarlo como documento único (URL o base64)
          documentos = [adopcion.documentosSolicitud];
        }
      }

      // Buscar los elementos del HTML
      const archivoItems = document.querySelectorAll('.archivo-item');
      const primerArchivoItem = archivoItems[0]; // Foto de credencial
      const segundoArchivoItem = archivoItems[1]; // Fotos extras
      
      // Mostrar foto de credencial (primer documento)
      if (primerArchivoItem && documentos.length > 0) {
        const primerArchivoLink = primerArchivoItem.querySelector('.archivo-link');
        if (primerArchivoLink) {
          const documento = documentos[0];
          primerArchivoLink.href = documento;
          primerArchivoLink.target = '_blank';
          
          // Determinar el nombre del archivo
          if (documento.startsWith('data:')) {
            // Si es base64, extraer el tipo
            const match = documento.match(/data:([^;]+)/);
            const tipo = match ? match[1] : 'documento';
            if (tipo.includes('pdf')) {
              primerArchivoLink.textContent = 'Ver credencial (PDF)';
            } else if (tipo.includes('image')) {
              primerArchivoLink.textContent = 'Ver credencial (Imagen)';
            } else {
              primerArchivoLink.textContent = 'Ver credencial';
            }
          } else if (documento.includes('http') || documento.includes('/')) {
            // Si es URL, extraer nombre del archivo
            const nombreArchivo = documento.split('/').pop() || 'Ver credencial';
            primerArchivoLink.textContent = nombreArchivo.length > 30 ? 'Ver credencial' : nombreArchivo;
          } else {
            primerArchivoLink.textContent = 'Ver credencial';
          }
        }
      } else if (primerArchivoItem && documentos.length === 0) {
        const primerArchivoLink = primerArchivoItem.querySelector('.archivo-link');
        if (primerArchivoLink) {
          primerArchivoLink.textContent = 'No disponible';
          primerArchivoLink.style.color = '#999';
          primerArchivoLink.style.pointerEvents = 'none';
        }
      }

      // Mostrar fotos extras (documentos adicionales)
      if (segundoArchivoItem && documentos.length > 1) {
        const archivosLista = segundoArchivoItem.querySelector('.archivos-lista');
        if (archivosLista) {
          archivosLista.innerHTML = ''; // Limpiar contenido por defecto
          
          // Mostrar documentos adicionales (del índice 1 en adelante)
          documentos.slice(1).forEach((documento, index) => {
            const link = document.createElement('a');
            link.href = documento;
            link.className = 'archivo-link';
            link.target = '_blank';
            
            // Determinar el nombre del archivo
            if (documento.startsWith('data:')) {
              const match = documento.match(/data:([^;]+)/);
              const tipo = match ? match[1] : 'documento';
              if (tipo.includes('pdf')) {
                link.textContent = `Documento ${index + 1} (PDF)`;
              } else if (tipo.includes('image')) {
                link.textContent = `Imagen ${index + 1}`;
              } else {
                link.textContent = `Documento ${index + 1}`;
              }
            } else if (documento.includes('http') || documento.includes('/')) {
              const nombreArchivo = documento.split('/').pop() || `Documento ${index + 1}`;
              link.textContent = nombreArchivo.length > 30 ? `Documento ${index + 1}` : nombreArchivo;
            } else {
              link.textContent = `Documento ${index + 1}`;
            }
            
            archivosLista.appendChild(link);
          });
        }
      } else if (segundoArchivoItem && documentos.length <= 1) {
        const archivosLista = segundoArchivoItem.querySelector('.archivos-lista');
        if (archivosLista) {
          archivosLista.innerHTML = '<p style="color: #999; font-style: italic; margin: 0;">No hay fotos extras</p>';
        }
      }

      // Configurar botones de acción
      const btnAceptar = document.querySelector('.boton-aceptar');
      const btnRechazar = document.querySelector('.boton-rechazar');

      if (btnAceptar) {
        // Remover listeners anteriores si existen
        btnAceptar.replaceWith(btnAceptar.cloneNode(true));
        const newBtnAceptar = document.querySelector('.boton-aceptar');
        newBtnAceptar.addEventListener('click', () => aprobarSolicitud(adopcionId));
      }

      if (btnRechazar) {
        // Remover listeners anteriores si existen
        btnRechazar.replaceWith(btnRechazar.cloneNode(true));
        const newBtnRechazar = document.querySelector('.boton-rechazar');
        newBtnRechazar.addEventListener('click', () => rechazarSolicitud(adopcionId));
      }

      documentosContainer.style.display = 'block';

    } catch (error) {
      console.error('Error al cargar documentos:', error);
      console.error('Stack trace:', error.stack);
      documentosContainer.innerHTML = `<p style="text-align: center; padding: 40px; color: red;">Error al cargar información: ${error.message || 'Error desconocido'}. Por favor intenta de nuevo.</p>`;
    }
  }

  /**
   * Aprobar solicitud de adopción
   */
  async function aprobarSolicitud(id) {
    if (!confirm('¿Estás seguro de aprobar esta solicitud de adopción?')) {
      return;
    }

    try {
      await AdopcionService.aprobar(id);
      alert('Solicitud de adopción aprobada exitosamente');
      
      // Redirigir a gestionar-mascotas
      window.location.href = '/frontend/src/pages/gestionar-mascotas.html';
      
    } catch (error) {
      console.error('Error al aprobar solicitud:', error);
      alert(`Error al aprobar la solicitud: ${error.message}`);
    }
  }

  /**
   * Rechazar solicitud de adopción
   */
  async function rechazarSolicitud(id) {
    if (!confirm('¿Estás seguro de rechazar esta solicitud de adopción?')) {
      return;
    }

    try {
      await AdopcionService.rechazar(id);
      alert('Solicitud de adopción rechazada');
      
      // Redirigir a gestionar-mascotas
      window.location.href = '/frontend/src/pages/gestionar-mascotas.html';
      
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      alert(`Error al rechazar la solicitud: ${error.message}`);
    }
  }
});

