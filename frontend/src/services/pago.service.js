// services/pagoService.js

const API_URL = 'http://localhost:3002/api/pagos';

class PagoService {
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
   * Crear nuevo pago
   * POST /api/pagos/
   */
  static async crear(pagoData) {
    try {
      const response = await fetch(`${API_URL}/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(pagoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear pago');
      }

      return data;
    } catch (error) {
      console.error('Error en crear:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los pagos
   * GET /api/pagos/all
   */
  static async obtenerTodos() {
    try {
      const response = await fetch(`${API_URL}/all`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pagos');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      throw error;
    }
  }

  /**
   * Obtener pago por ID
   * GET /api/pagos/:id
   */
  static async obtenerPorId(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pago');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Obtener pagos de una venta
   * GET /api/pagos/venta/:ventaId
   */
  static async obtenerPorVenta(ventaId) {
    try {
      const response = await fetch(`${API_URL}/venta/${ventaId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener pagos de la venta');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorVenta:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de un pago
   * PUT /api/pagos/:id
   */
  static async actualizarEstado(id, nuevoEstado) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ nuevoEstado })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar estado del pago');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      throw error;
    }
  }

  /**
   * Eliminar pago
   * DELETE /api/pagos/:id
   */
  static async eliminar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar pago');
      }

      return data;
    } catch (error) {
      console.error('Error en eliminar:', error);
      throw error;
    }
  }
}


