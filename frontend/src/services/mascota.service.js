// services/mascotaService.js

const API_URL = 'http://localhost:3002/api/mascotas';

class MascotaService {
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
   * Crear nueva mascota (requiere autenticación)
   * POST /api/mascotas/
   */
  static async crear(mascotaData) {
    try {
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(mascotaData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear mascota');
      }

      return data;
    } catch (error) {
      console.error('Error en crear:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las mascotas
   * GET /api/mascotas/all?includeCentro=true&limit=10&offset=0&estado=disponible
   */
  static async obtenerTodas(options = {}) {
    try {
      const { includeCentro = false, limit, offset, estado } = options;
      const params = new URLSearchParams();

      if (includeCentro) params.append('includeCentro', 'true');
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      if (estado) params.append('estado', estado);

      const url = `${API_URL}/all${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener mascotas');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodas:', error);
      throw error;
    }
  }

  /**
   * Obtener mascota por ID
   * GET /api/mascotas/:id?includeCentro=true
   */
  static async obtenerPorId(id, includeCentro = false) {
    try {
      const url = includeCentro 
        ? `${API_URL}/${id}?includeCentro=true`
        : `${API_URL}/${id}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener mascota');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Obtener mascotas por centro de adopción
   * GET /api/mascotas/centro/:centroId?limit=10&offset=0
   */
  static async obtenerPorCentro(centroId, options = {}) {
    try {
      const { limit, offset } = options;
      const params = new URLSearchParams();

      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);

      const url = `${API_URL}/centro/${centroId}${params.toString() ? '?' + params.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener mascotas del centro');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorCentro:', error);
      throw error;
    }
  }

  /**
   * Actualizar mascota (requiere autenticación)
   * PUT /api/mascotas/estado/:id
   */
  static async actualizar(id, cambios) {
    try {
      const response = await fetch(`${API_URL}/estado/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(cambios)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar mascota');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizar:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de mascota
   * PUT /api/mascotas/estado/:id
   */
  static async actualizarEstado(id, nuevoEstado) {
    try {
      return await this.actualizar(id, { estado: nuevoEstado });
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      throw error;
    }
  }

  /**
   * Eliminar mascota (requiere autenticación)
   * DELETE /api/mascotas/:id
   */
  static async eliminar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar mascota');
      }

      return data;
    } catch (error) {
      console.error('Error en eliminar:', error);
      throw error;
    }
  }

  /**
   * Filtrar mascotas disponibles
   */
  static async obtenerDisponibles(options = {}) {
    try {
      return await this.obtenerTodas({ ...options, estado: 'disponible' });
    } catch (error) {
      console.error('Error en obtenerDisponibles:', error);
      throw error;
    }
  }

  /**
   * Filtrar mascotas adoptadas
   */
  static async obtenerAdoptadas(options = {}) {
    try {
      return await this.obtenerTodas({ ...options, estado: 'adoptado' });
    } catch (error) {
      console.error('Error en obtenerAdoptadas:', error);
      throw error;
    }
  }
}

module.exports =  MascotaService;