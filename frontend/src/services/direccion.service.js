const DIRECCION_API_URL = "http://localhost:3002/api/direcciones";

class DireccionService {
  static getToken() {
    return localStorage.getItem("token");
  }

  static getHeaders(includeAuth = true) {
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

  static async obtenerTodas() {
    const response = await fetch(DIRECCION_API_URL, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al obtener direcciones");
    }

    return data;
  }

  static async obtenerPorId(id) {
    const response = await fetch(`${DIRECCION_API_URL}/${id}`, {
      method: "GET",
      headers: this.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al obtener dirección");
    }

    return data;
  }

  static async crear(payload) {
    const response = await fetch(DIRECCION_API_URL, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al crear dirección");
    }

    return data;
  }

  static async actualizar(id, payload) {
    const response = await fetch(`${DIRECCION_API_URL}/${id}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al actualizar dirección");
    }

    return data;
  }

  static async eliminar(id) {
    const response = await fetch(`${DIRECCION_API_URL}/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Error al eliminar dirección");
    }

    return data;
  }
}

