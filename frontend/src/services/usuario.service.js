// services/usuarioService.js

const API_URL = 'http://localhost:3002/api/usuarios';

class UsuarioService {
  /**
   * Obtener token almacenado en localStorage
   */
  static getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Guardar token en localStorage
   */
  static setToken(token) {
    localStorage.setItem('token', token);
  }

  /**
   * Eliminar token de localStorage
   */
  static removeToken() {
    localStorage.removeItem('token');
  }

  /**
   * Headers por defecto con token JWT
   */
  static getHeaders(includeAuth = false) {
    const headers = {
      'Content-Type': 'application/json'
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Registrar nuevo usuario
   * POST /api/usuarios/register
   */
  static async registrar(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en registrar:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión
   * POST /api/usuarios/login
   */
  static async login(nombreUsuario, contrasena) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ nombreUsuario, contrasena })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar token
      if (data.data && data.data.token) {
        this.setToken(data.data.token);
      }

      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  static logout() {
    this.removeToken();
  }

  /**
   * Obtener todos los usuarios
   * GET /api/usuarios/verify
   */
  static async obtenerTodos() {
    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuarios');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/usuarios/:id
   */
  static async obtenerPorId(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   * PUT /api/usuarios/:id
   */
  static async actualizar(id, cambios) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify(cambios)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizar:', error);
      throw error;
    }
  }

  /**
   * Desactivar usuario
   * DELETE /api/usuarios/:id
   */
  static async desactivar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders(true)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al desactivar usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en desactivar:', error);
      throw error;
    }
  }

  /**
   * Cambiar rol de usuario
   * PUT /api/usuarios/change-role/:id
   */
  static async cambiarRol(id, nuevoRol) {
    try {
      const response = await fetch(`${API_URL}/change-role/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ nuevoRol })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar rol');
      }

      return data;
    } catch (error) {
      console.error('Error en cambiarRol:', error);
      throw error;
    }
  }

  /**
   * Activar/Desactivar usuario
   * PUT /api/usuarios/act-deact/:id
   */
  static async activarDesactivar(id, activo) {
    try {
      const response = await fetch(`${API_URL}/act-deact/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(true),
        body: JSON.stringify({ activo })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al cambiar estado');
      }

      return data;
    } catch (error) {
      console.error('Error en activarDesactivar:', error);
      throw error;
    }
  }
}


