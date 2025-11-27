document.addEventListener("DOMContentLoaded", () => {
  const categoryList = document.querySelector(".category-list");
  const form = document.querySelector(".add-category-form");
  const nombreInput = document.getElementById("cat-name");
  const feedback = document.getElementById("mensajeCategorias");

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/frontend/src/pages/login-page.html";
    return;
  }

  cargarCategorias();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nombre = nombreInput.value.trim();
    if (!nombre) {
      mostrarMensaje("Ingresa un nombre válido para la categoría.", "error");
      return;
    }

    toggleFormState(true);

    try {
      await CategoriaService.crear({ nombre });
      nombreInput.value = "";
      mostrarMensaje("Categoría agregada correctamente.", "success");
      await cargarCategorias();
    } catch (error) {
      mostrarMensaje(error.message || "No se pudo crear la categoría.", "error");
    } finally {
      toggleFormState(false);
    }
  });

  async function cargarCategorias() {
    categoryList.innerHTML =
      '<li class="category-item empty-state">Cargando categorías...</li>';

    try {
      const response = await CategoriaService.obtenerTodas();
      const categorias = response.data || [];

      if (!categorias.length) {
        categoryList.innerHTML =
          '<li class="category-item empty-state">Aún no hay categorías registradas.</li>';
        return;
      }

      categoryList.innerHTML = "";
      categorias.forEach((categoria) => {
        const item = document.createElement("li");
        item.className = "category-item";
        item.dataset.id = categoria.id;
        item.innerHTML = `
          <span class="category-name">${categoria.nombre}</span>
          <div class="item-actions">
            <button class="icon-btn edit" aria-label="Editar categoría">
              <img src="/frontend/src/assets/images/edit.svg" alt="Editar">
            </button>
            <button class="icon-btn delete" aria-label="Eliminar categoría">
              <img src="/frontend/src/assets/images/trash.svg" alt="Eliminar">
            </button>
          </div>
        `;

        const editBtn = item.querySelector(".edit");
        const deleteBtn = item.querySelector(".delete");

        editBtn.addEventListener("click", () => editarCategoria(categoria));
        deleteBtn.addEventListener("click", () => eliminarCategoria(categoria));

        categoryList.appendChild(item);
      });
    } catch (error) {
      categoryList.innerHTML =
        '<li class="category-item empty-state error">No se pudieron cargar las categorías.</li>';
      mostrarMensaje(error.message || "Error al cargar categorías.", "error");
    }
  }

  async function editarCategoria(categoria) {
    const nuevoNombre = prompt(
      "Edita el nombre de la categoría:",
      categoria.nombre
    );

    if (nuevoNombre === null) {
      return;
    }

    const valor = nuevoNombre.trim();
    if (!valor) {
      mostrarMensaje("El nombre no puede quedar vacío.", "error");
      return;
    }

    try {
      await CategoriaService.actualizar(categoria.id, { nombre: valor });
      mostrarMensaje("Categoría actualizada correctamente.", "success");
      await cargarCategorias();
    } catch (error) {
      mostrarMensaje(error.message || "No se pudo actualizar la categoría.", "error");
    }
  }

  async function eliminarCategoria(categoria) {
    const confirmar = confirm(
      `¿Deseas eliminar la categoría "${categoria.nombre}"?`
    );
    if (!confirmar) {
      return;
    }

    try {
      await CategoriaService.eliminar(categoria.id);
      mostrarMensaje("Categoría eliminada.", "success");
      await cargarCategorias();
    } catch (error) {
      mostrarMensaje(error.message || "No se pudo eliminar la categoría.", "error");
    }
  }

  function mostrarMensaje(mensaje, tipo = "info") {
    feedback.textContent = mensaje;
    feedback.dataset.type = tipo;
    feedback.hidden = false;

    clearTimeout(mostrarMensaje.timeoutId);
    mostrarMensaje.timeoutId = setTimeout(() => {
      feedback.hidden = true;
      feedback.textContent = "";
    }, 4000);
  }

  function toggleFormState(disabled) {
    form.querySelectorAll("input, button").forEach((element) => {
      element.disabled = disabled;
    });
    form.querySelector("button").textContent = disabled
      ? "Guardando..."
      : "Agregar categoría";
  }
});

