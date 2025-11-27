// services/venta.service.js

class VentaService {
  /**
   * Obtener URL base del API
   */
  static getApiUrl() {
    return 'http://localhost:3002/api/ventas';
  }

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
   * Crear venta completa (con items y pago inicial)
   * POST /api/ventas/createSale
   */
  static async crearVentaCompleta(ventaData) {
    try {
      const response = await fetch(`${this.getApiUrl()}/createSale`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(ventaData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear venta completa');
      }

      return data;
    } catch (error) {
      console.error('Error en crearVentaCompleta:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las ventas
   * GET /api/ventas/all
   */
  static async obtenerTodas() {
    try {
      const response = await fetch(`${this.getApiUrl()}/all`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener ventas');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerTodas:', error);
      throw error;
    }
  }

  /**
   * Obtener venta por ID
   * GET /api/ventas/:id
   */
  static async obtenerPorId(id) {
    try {
      const response = await fetch(`${this.getApiUrl()}/${id}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener venta');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorId:', error);
      throw error;
    }
  }

  /**
   * Obtener ventas por cliente
   * GET /api/ventas/client/:idUser
   */
  static async obtenerPorCliente(clienteId) {
    try {
      const response = await fetch(`${this.getApiUrl()}/client/${clienteId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener ventas del cliente');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerPorCliente:', error);
      throw error;
    }
  }

  /**
   * Agregar item a una venta existente
   * POST /api/ventas/addSellItem
   */
  static async agregarItem(ventaId, productoId, cantidad) {
    try {
      const response = await fetch(`${this.getApiUrl()}/addSellItem`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ ventaId, productoId, cantidad })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al agregar item');
      }

      return data;
    } catch (error) {
      console.error('Error en agregarItem:', error);
      throw error;
    }
  }

  /**
   * Crear pago separado para una venta
   * GET /api/ventas/partPayment/:idSale
   */
  static async crearPagoSeparado(ventaId, pagoData) {
    try {
      const response = await fetch(`${this.getApiUrl()}/partPayment/${ventaId}`, {
        method: 'GET',
        headers: this.getHeaders(),
        body: JSON.stringify(pagoData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear pago');
      }

      return data;
    } catch (error) {
      console.error('Error en crearPagoSeparado:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de un pago (pagar venta)
   * PUT /api/ventas/completeSale/:idSale
   */
  static async actualizarEstadoPago(pagoId, nuevoEstado) {
    try {
      const response = await fetch(`${this.getApiUrl()}/completeSale/${pagoId}`, {
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
      console.error('Error en actualizarEstadoPago:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado de una venta
   * PUT /api/ventas/:id
   */
  static async actualizarEstado(id, nuevoEstado) {
    try {
      const response = await fetch(`${this.getApiUrl()}/${id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ nuevoEstado })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar estado de la venta');
      }

      return data;
    } catch (error) {
      console.error('Error en actualizarEstado:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de ventas de un usuario
   * GET /api/ventas/HistoryUser/:idUser
   */
  static async obtenerHistorial(usuarioId) {
    try {
      const response = await fetch(`${this.getApiUrl()}/HistoryUser/${usuarioId}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener historial');
      }

      return data;
    } catch (error) {
      console.error('Error en obtenerHistorial:', error);
      throw error;
    }
  }

  /**
   * Eliminar venta (cancelar)
   * DELETE /api/ventas/:id
   */
  static async eliminar(id) {
    try {
      const response = await fetch(`${this.getApiUrl()}/${id}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al eliminar venta');
      }

      return data;
    } catch (error) {
      console.error('Error en eliminar:', error);
      throw error;
    }
  }
}

