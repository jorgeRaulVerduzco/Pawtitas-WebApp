// services/adopcionService.js

const API_URL = 'http://localhost:3002/api/adopciones';

class AdopcionService {
  /**
   * Obtener token almacenado
   */
  static getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Headers con autenticación
   */
  static getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Crear nueva solicitud de adopción (requiere autenticación)
   * POST /api/adopciones/
   */
  static async crear(adopcionData) {
    try {
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(adopcionData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear solicitud de adopción');
      }

      return data;
    } catch (error) {
      console.error('Error en crear:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las adopciones
   * GET /api/adopciones/all?includeUsuario=true&includeMascota=true&limit=10&offset=0&estadoSolicitud=pendiente
   */
  static async obtenerTodas(options = {}) {
    try {
      const { includeUsuario = false, includeMascota = false, limit, offset, estadoSolicitud } = options;
      const params = new URLSearchParams();

      if (includeUsuario) params.append('includeUsuario', 'true');
      if (includeMascota) params.append('includeMascota', 'true');
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      if (estadoSolicitud) params.append('estadoSolicitud', estadoSolicitud);

      const url = `${API_URL}/all${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener adopciones');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodas:', error);
      throw error;
    }
  }

  /**
   * Obtener adopción por ID
   * GET /api/adopciones/:id?includeUsuario=true&includeMascota=true
   */
  static async obtenerPorId(id, options = {}) {
    try {
      const { includeUsuario = false, includeMascota = false } = options;
      const params = new URLSearchParams();

      if (includeUsuario) params.append('includeUsuario', 'true');
      if (includeMascota) params.append('includeMascota', 'true');

      const url = `${API_URL}/${id}${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener adopción');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Obtener adopciones por usuario
   * GET /api/adopciones/user/:userId?includeMascota=true
   */
  static async obtenerPorUsuario(userId, includeMascota = false) {
    try {
      const url = includeMascota 
        ? `${API_URL}/user/${userId}?includeMascota=true`
        : `${API_URL}/user/${userId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener adopciones del usuario');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorUsuario:', error);
      throw error;
    }
  }

  /**
   * Obtener adopciones por mascota
   * GET /api/adopciones/pet/:petId?includeUsuario=true
   */
  static async obtenerPorMascota(petId, includeUsuario = false) {
    try {
      const url = includeUsuario 
        ? `${API_URL}/pet/${petId}?includeUsuario=true`
        : `${API_URL}/pet/${petId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener adopciones de la mascota');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorMascota:', error);
      throw error;
    }
  }

  /**
   * Aprobar solicitud de adopción (requiere autenticación)
   * PUT /api/adopciones/:id/approve
   */
  static async aprobar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}/approve`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al aprobar solicitud');
      }

      return data;
    } catch (error) {
      console.error('Error en aprobar:', error);
      throw error;
    }
  }

  /**
   * Rechazar solicitud de adopción (requiere autenticación)
   * PUT /api/adopciones/:id/reject
   */
  static async rechazar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}/reject`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al rechazar solicitud');
      }

      return data;
    } catch (error) {
      console.error('Error en rechazar:', error);
      throw error;
    }
  }

  /**
   * Actualizar adopción (requiere autenticación)
   * PUT /api/adopciones/:id
   */
  static async actualizar(id, cambios) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(cambios)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar adopción');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizar:', error);
      throw error;
    }
  }

  /**
   * Eliminar adopción (requiere autenticación)
   * DELETE /api/adopciones/:id
   */
  static async eliminar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar adopción');
      }

      return data;
    } catch (error) {
      console.error('Error en eliminar:', error);
      throw error;
    }
  }

  /**
   * Obtener solicitudes pendientes
   */
  static async obtenerPendientes(options = {}) {
    try {
      return await this.obtenerTodas({ ...options, estadoSolicitud: 'pendiente' });
    } catch (error) {
      console.error('Error en obtenerPendientes:', error);
      throw error;
    }
  }

  /**
   * Obtener solicitudes aprobadas
   */
  static async obtenerAprobadas(options = {}) {
    try {
      return await this.obtenerTodas({ ...options, estadoSolicitud: 'aprobada' });
    } catch (error) {
      console.error('Error en obtenerAprobadas:', error);
      throw error;
    }
  }

  /**
   * Obtener solicitudes rechazadas
   */
  static async obtenerRechazadas(options = {}) {
    try {
      return await this.obtenerTodas({ ...options, estadoSolicitud: 'rechazada' });
    } catch (error) {
      console.error('Error en obtenerRechazadas:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de adopciones de un usuario
   */
  static async obtenerHistorialUsuario(userId) {
    try {
      return await this.obtenerPorUsuario(userId, true);
    } catch (error) {
      console.error('Error en obtenerHistorialUsuario:', error);
      throw error;
    }
  }
}


