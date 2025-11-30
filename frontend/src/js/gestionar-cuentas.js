// frontend/src/js/gestionar-cuentas.js
import UsuarioService from '../services/usuario.service.js';

let usuarios = [];

document.addEventListener('DOMContentLoaded', async () => {
  console.log("DOM Cargado - Gestionar Cuentas");
  await cargarUsuarios();
  
  const searchForm = document.getElementById('searchForm');
  if(searchForm){
      searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        filtrarUsuarios();
      });
  }
});

async function cargarUsuarios() {
  try {
    const response = await UsuarioService.obtenerTodos();
    usuarios = response.data;
    renderizarUsuarios(usuarios);
  } catch (error) {
    console.error('Error al cargar usuarios:', error);
    mostrarError('Error al cargar la lista de usuarios');
  }
}

function renderizarUsuarios(listaUsuarios) {
  const userList = document.getElementById('userList');
  
  if (!listaUsuarios || listaUsuarios.length === 0) {
    userList.innerHTML = '<li class="user-item"><span>No se encontraron usuarios</span></li>';
    return;
  }
  
  userList.innerHTML = '';
  
  listaUsuarios.forEach(usuario => {
    // Verificar si ID viene como id o _id
    const userId = usuario.id || usuario._id;

    const li = document.createElement('li');
    li.className = 'user-item';
    
    // Mostramos estado activo/inactivo visualmente
    const estadoStyle = usuario.activo ? 'color: green;' : 'color: red;';
    const estadoTexto = usuario.activo ? '(Activo)' : '(Inactivo)';

    li.innerHTML = `
      <span class="username">
        ${usuario.nombreUsuario} - ${usuario.rol} <small style="${estadoStyle}">${estadoTexto}</small>
      </span>
      <button class="delete-btn" data-user-id="${userId}" aria-label="Desactivar usuario">
        <span class="x-icon">✕</span> 
      </button>
    `;
    
    // Event listener para el botón de eliminar/desactivar
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        console.log(`Click eliminar en usuario: ${usuario.nombreUsuario}`);
        desactivarUsuario(userId, usuario.nombreUsuario);
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

async function desactivarUsuario(userId, username) {
  if (!userId) {
      alert("Error: ID de usuario no válido");
      return;
  }

  if (!confirm(`¿Estás seguro de desactivar/eliminar al usuario "${username}"?`)) {
    return;
  }
  
  try {
    // Nota: desactivar (DELETE) o activarDesactivar (PUT)?
    // Usaremos activarDesactivar con false para mantener consistencia
    await UsuarioService.activarDesactivar(userId, false);
    
    alert('Usuario desactivado exitosamente');
    await cargarUsuarios(); // Esto actualiza la página (la lista)
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    alert('Error al desactivar el usuario: ' + error.message);
  }
}

function mostrarError(mensaje) {
  alert(mensaje);
}