// services/centroAdopcionService.js

const API_URL = 'http://localhost:3002/api/centros';

class CentroAdopcionService {
  /**
   * Obtener token almacenado
   */
  static getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Headers con autenticación opcional
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
   * Crear nuevo centro de adopción (requiere autenticación)
   * POST /api/centros/
   */
  static async crear(centroData) {
    try {
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: this.getHeaders(true),
        body: JSON.stringify(centroData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear centro de adopción');
      }

      return data;
    } catch (error) {
      console.error('Error en crear:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los centros de adopción
   * GET /api/centros/all
   */
  static async obtenerTodos() {
    try {
      const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener centros');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      throw error;
    }
  }

  /**
   * Obtener centro por ID
   * GET /api/centros/:id
   */
  static async obtenerPorId(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener centro');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Buscar centros por nombre
   * GET /api/centros/search?nombre=texto
   */
  static async buscarPorNombre(nombre) {
    try {
      const response = await fetch(`${API_URL}/search?nombre=${encodeURIComponent(nombre)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al buscar centros');
      }

      return data;
    } catch (error) {
      console.error('Error en buscarPorNombre:', error);
      throw error;
    }
  }

  /**
   * Obtener centro con sus mascotas
   */
  static async obtenerConMascotas(id) {
    try {
      // El endpoint obtenerPorId ya incluye las mascotas
      return await this.obtenerPorId(id);
    } catch (error) {
      console.error('Error en obtenerConMascotas:', error);
      throw error;
    }
  }

  /**
   * Obtener centros con mascotas disponibles
   */
  static async obtenerConMascotasDisponibles() {
    try {
      const response = await this.obtenerTodos();
      
      // Filtrar solo centros que tengan mascotas disponibles
      if (response.centros) {
        response.centros = response.centros.filter(centro => 
          centro.mascotas && centro.mascotas.some(m => m.estado === 'disponible')
        );
      }

      return response;
    } catch (error) {
      console.error('Error en obtenerConMascotasDisponibles:', error);
      throw error;
    }
  }
}

module.exports =  CentroAdopcionService;