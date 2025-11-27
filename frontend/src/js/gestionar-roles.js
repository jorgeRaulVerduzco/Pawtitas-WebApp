// frontend/src/js/gestionar-roles.js
let usuarios = [];
let usuariosSeleccionados = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Cargado - Gestionar Roles'); // LOG
  await cargarUsuarios();
  
  // Verificamos que los botones existan antes de asignar eventos
  const btnCliente = document.getElementById('btnCliente');
  const btnEmpleado = document.getElementById('btnEmpleado');
  const btnAdmin = document.getElementById('btnAdministrador');

  if(btnCliente) btnCliente.addEventListener('click', () => { console.log('Click Cliente'); cambiarRol('cliente'); });
  if(btnEmpleado) btnEmpleado.addEventListener('click', () => { console.log('Click Empleado'); cambiarRol('empleado'); });
  if(btnAdmin) btnAdmin.addEventListener('click', () => { console.log('Click Admin'); cambiarRol('administrador'); });
  
  const searchForm = document.getElementById('searchForm');
  if(searchForm) {
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filtrarUsuarios();
      });
  }
});

async function cargarUsuarios() {
  try {
    console.log('Cargando usuarios...');
    // Asegúrate de que UsuarioService existe
    if (typeof UsuarioService === 'undefined') {
        throw new Error('UsuarioService no está cargado correctamente');
    }

    const response = await UsuarioService.obtenerTodos();
    usuarios = response.data;
    console.log('Usuarios cargados:', usuarios); // Verificamos la estructura
    renderizarUsuarios(usuarios);
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    mostrarError('Error al cargar la lista de usuarios: ' + error.message);
  }
}

function renderizarUsuarios(listaUsuarios) {
  const userList = document.getElementById('userList');
  usuariosSeleccionados = []; // Limpiamos selección al renderizar
  
  if (!listaUsuarios || listaUsuarios.length === 0) {
    userList.innerHTML = '<li class="user-item"><span>No se encontraron usuarios</span></li>';
    return;
  }
  
  userList.innerHTML = '';
  
  listaUsuarios.forEach(usuario => {
    // NOTA: Verifica si tu base de datos usa "id" o "_id"
    const userId = usuario.id || usuario._id; 

    const li = document.createElement('li');
    li.className = 'user-item';
    li.innerHTML = `
      <span class="username">${usuario.nombreUsuario}</span>
      <div class="user-details">
        <span class="user-role">Rol: <strong>${usuario.rol}</strong></span>
        <input type="checkbox" class="role-checkbox" value="${userId}" ${usuario.activo ? 'checked' : ''}>
      </div>
    `;
    
    const checkbox = li.querySelector('.role-checkbox');
    
    // IMPORTANTE: El checkbox controla la selección para cambio masivo, 
    // NO si el usuario está activo/inactivo (eso es otra función)
    // Ajusté la lógica para que coincida con tu array de seleccionados
    checkbox.checked = false; // Empezamos desmarcados para la selección de cambio de rol

    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!usuariosSeleccionados.includes(userId)) {
          usuariosSeleccionados.push(userId);
        }
      } else {
        usuariosSeleccionados = usuariosSeleccionados.filter(id => id !== userId);
      }
      console.log('Usuarios seleccionados:', usuariosSeleccionados);
    });
    
    userList.appendChild(li);
  });
}

function filtrarUsuarios() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const usuariosFiltrados = usuarios.filter(usuario => 
    (usuario.nombreUsuario && usuario.nombreUsuario.toLowerCase().includes(searchTerm)) ||
    (usuario.nombres && usuario.nombres.toLowerCase().includes(searchTerm)) ||
    (usuario.correo && usuario.correo.toLowerCase().includes(searchTerm))
  );
  renderizarUsuarios(usuariosFiltrados);
}

async function cambiarRol(nuevoRol) {
  console.log('Intentando cambiar rol a:', nuevoRol);
  
  if (usuariosSeleccionados.length === 0) {
    alert('Por favor selecciona al menos un usuario usando los checkboxes.');
    return;
  }
  
  if (!confirm(`¿Estás seguro de cambiar el rol de ${usuariosSeleccionados.length} usuario(s) a ${nuevoRol}?`)) {
    return;
  }
  
  try {
    for (const userId of usuariosSeleccionados) {
      if(!userId) {
          console.error("ID de usuario invalido encontrado");
          continue;
      }
      await UsuarioService.cambiarRol(userId, nuevoRol);
    }
    
    alert(`Rol cambiado exitosamente a ${nuevoRol}`);
    usuariosSeleccionados = []; // Resetear array
    await cargarUsuarios(); // Recargar la lista para ver cambios
  } catch (error) {
    console.error('Error al cambiar rol:', error);
    alert('Error al cambiar el rol: ' + error.message);
  }
}

function mostrarError(mensaje) {
  // Solo muestra alert si es un error crítico
  console.error(mensaje);
  alert(mensaje);
}