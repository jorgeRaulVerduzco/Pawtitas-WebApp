// services/productoService.js

const API_URL = "http://localhost:3002/api/productos";

class ProductoService {
  /**
   * Obtener token almacenado
   */
  static getToken() {
    return localStorage.getItem("token");
  }

  /**
   * Headers con autenticación opcional
   */
  static getHeaders(includeAuth = false) {
    const headers = {
      "Content-Type": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Obtener todos los productos
   * GET /api/productos/all?limit=10&offset=0
   */
  static async obtenerTodos(limit = 10, offset = 0) {
    try {
      const response = await fetch(
        `${API_URL}/all?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener productos");
      }

      return data;
    } catch (error) {
      console.error("Error en obtenerTodos:", error);
      throw error;
    }
  }

  /**
   * Obtener producto por ID
   * GET /api/productos/:id?includeCategorias=true
   */
  static async obtenerPorId(id, includeCategorias = false) {
    try {
      const url = includeCategorias
        ? `${API_URL}/${id}?includeCategorias=true`
        : `${API_URL}/${id}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener producto");
      }

      return data;
    } catch (error) {
      console.error("Error en obtenerPorId:", error);
      throw error;
    }
  }

  /**
   * Crear nuevo producto (requiere autenticación)
   * POST /api/productos/
   */
  static async crear(productoData) {
    try {
      const response = await fetch(`${API_URL}/`, {
        method: "POST",
        headers: this.getHeaders(true),
        body: JSON.stringify(productoData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al crear producto");
      }

      return data;
    } catch (error) {
      console.error("Error en crear:", error);
      throw error;
    }
  }

  /**
   * Actualizar producto (requiere autenticación)
   * PUT /api/productos/:id
   */
  static async actualizar(id, cambios) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: this.getHeaders(true),
        body: JSON.stringify(cambios),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al actualizar producto");
      }

      return data;
    } catch (error) {
      console.error("Error en actualizar:", error);
      throw error;
    }
  }

  /**
   * Eliminar producto (requiere autenticación)
   * DELETE /api/productos/:id
   */
  static async eliminar(id) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: this.getHeaders(true),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al eliminar producto");
      }

      return data;
    } catch (error) {
      console.error("Error en eliminar:", error);
      throw error;
    }
  }

  /**
   * Buscar productos por nombre
   * GET /api/productos/search?nombre=texto
   */
  static async buscarPorNombre(nombre) {
    try {
      const response = await fetch(
        `${API_URL}/buscar?nombre=${encodeURIComponent(nombre)}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al buscar productos");
      }

      return data;
    } catch (error) {
      console.error("Error en buscarPorNombre:", error);
      throw error;
    }
  }

  /**
   * Filtrar productos por categoría
   * GET /api/productos/filter?idCategoria=1
   */
  static async filtrarPorCategoria(idCategoria) {
    try {
      const response = await fetch(
        `${API_URL}/filter?idCategoria=${idCategoria}`,
        {
          method: "GET",
          headers: this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al filtrar productos");
      }

      return data;
    } catch (error) {
      console.error("Error en filtrarPorCategoria:", error);
      throw error;
    }
  }

  /**
   * Calificar producto
   * GET /api/productos/cali/:id (con body)
   */
  static async calificar(id, calificacion) {
    try {
      const response = await fetch(`${API_URL}/cali/${id}`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ calificacion }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al calificar producto");
      }

      return data;
    } catch (error) {
      console.error("Error en calificar:", error);
      throw error;
    }
  }

  /**
   * Obtener categorías de un producto
   * GET /api/productos/search?id=1
   */
  static async obtenerCategorias(id) {
    try {
      const response = await fetch(`${API_URL}/search?id=${id}`, {
        method: "GET",
        headers: this.getHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Error al obtener categorías");
      }

      return data;
    } catch (error) {
      console.error("Error en obtenerCategorias:", error);
      throw error;
    }
  }


  static async filtrarPorCategoria(idCategoria) {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Usuario no autenticado.');

        // Se usa la ruta /filter con un query parameter
        const response = await fetch(`${API_URL}/filter?idCategoria=${encodeURIComponent(idCategoria)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error al filtrar productos por categoría');
        }

        return data; // Contiene status, results y data (la lista de productos)
    } catch (error) {
        console.error('Error en filtrarPorCategoria:', error.message);
        throw error;
    }
}
}

export default ProductoService;