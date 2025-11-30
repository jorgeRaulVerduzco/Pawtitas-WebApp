const CATEGORIA_API_URL = "http://localhost:3002/api/categorias";

class CategoriaService {
  static getToken() {
    return localStorage.getItem("token");
  }

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

  static async obtenerTodas(includeProductos = false) {
    const url = includeProductos
      ? `${CATEGORIA_API_URL}?includeProductos=true`
      : CATEGORIA_API_URL;

    const response = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al obtener categorías");
    }

    return data;
  }

  static async crear({ nombre, descripcion }) {
    const response = await fetch(CATEGORIA_API_URL, {
      method: "POST",
      headers: this.getHeaders(true),
      body: JSON.stringify({ nombre, descripcion }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al crear categoría");
    }

    return data;
  }

  static async actualizar(id, cambios) {
    const response = await fetch(`${CATEGORIA_API_URL}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(true),
      body: JSON.stringify(cambios),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al actualizar categoría");
    }

    return data;
  }

  static async eliminar(id) {
    const response = await fetch(`${CATEGORIA_API_URL}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al eliminar categoría");
    }

    return data;
  }
}

export default CategoriaService;
