import ProductoService from "../services/producto.service.js";

function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch (e) {
    console.error("Error parseando carrito:", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function formatPrice(value) {
  const num = Number(value) || 0;
  return `$${num.toFixed(2)}`;
}

function renderCart() {
  const cart = getCart();
  const container = document.querySelector(".product-list");
  const summarySubtotalEl = document.querySelector(".summary-details .summary-item .summary-value")
  // Actually there are multiple .summary-value, we'll select by order later

  if (!container) return;

  // Limpiar los items existentes (el HTML de ejemplo)
  container.innerHTML = "";

  if (!cart.length) {
    container.innerHTML = `<p>Tu carrito está vacío.</p>`;
    updateSummary(0);
    return;
  }

  cart.forEach((item, idx) => {
    const itemEl = document.createElement("div");
    itemEl.className = "cart-item";
    itemEl.dataset.index = idx;
    itemEl.innerHTML = `
      <input type="checkbox" id="item_${idx}" name="selected_items" class="product-checkbox" checked>
      <div class="item-details">
        <img src="${item.imagen || ''}" alt="${item.nombre}" class="product-image">
        <p class="product-name">${item.nombre}</p>
        <div class="quantity-control">
          <button class="quantity-btn delete-btn" data-action="delete"> <img src="/frontend/src/assets/images/trash.svg" alt="Eliminar"></button>
          <div class="quantity-input-wrapper">
            <button class="quantity-btn minus-btn" data-action="minus">-</button>
            <input type="number" class="product-quantity" value="${item.cantidad}" min="1" data-index="${idx}" max="${item.cantidadStock ?? ''}">
            <button class="quantity-btn plus-btn" data-action="plus">+</button>
          </div>
        </div>
        <p class="item-price">${formatPrice(item.precio * (item.cantidad || 1))}</p>
      </div>
    `;
    container.appendChild(itemEl);
  });

  attachCartListeners();
  // Calcular subtotal solo de los items seleccionados (checkbox checked)
  const subtotalSelected = cart.reduce((s, it, idx) => {
    const checkbox = document.getElementById(`item_${idx}`);
    if (!checkbox) return s;
    if (!checkbox.checked) return s;
    return s + (Number(it.precio) || 0) * (Number(it.cantidad) || 1);
  }, 0);
  updateSummary(subtotalSelected);
}

function attachCartListeners() {
  const container = document.querySelector(".product-list");
  if (!container) return;

  container.querySelectorAll(".cart-item").forEach((el) => {
    const idx = Number(el.dataset.index);

    el.querySelectorAll("[data-action]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = btn.dataset.action;
        if (action === "delete") {
          removeItem(idx);
        } else if (action === "minus") {
          changeQuantity(idx, -1);
        } else if (action === "plus") {
          changeQuantity(idx, +1);
        }
      });
    });

    const input = el.querySelector(".product-quantity");
    if (input) {
      input.addEventListener("change", (e) => {
        const v = Number(e.target.value) || 1;
        setQuantity(idx, v);
      });
    }

    // Checkbox: cuando cambie, recalcular subtotal/summary
    const checkbox = el.querySelector('.product-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        // Recalcular subtotal considerando solo los checked
        const cart = getCart();
        const subtotalSelected = cart.reduce((s, it, i) => {
          const cb = document.getElementById(`item_${i}`);
          if (cb && cb.checked) return s + (Number(it.precio) || 0) * (Number(it.cantidad) || 1);
          return s;
        }, 0);
        updateSummary(subtotalSelected);
      });
    }
  });
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function changeQuantity(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  const current = Number(cart[index].cantidad) || 1;
  const max = cart[index].cantidadStock ?? Number.POSITIVE_INFINITY;
  const next = Math.max(1, current + delta);
  if (next > max) {
    window.alert(`No hay suficientes unidades. Stock máximo: ${max}`);
    cart[index].cantidad = max;
  } else {
    cart[index].cantidad = next;
  }
  saveCart(cart);
  renderCart();
}

function setQuantity(index, value) {
  const cart = getCart();
  if (!cart[index]) return;
  const v = Math.max(1, Number(value) || 1);
  const max = cart[index].cantidadStock ?? Number.POSITIVE_INFINITY;
  if (v > max) {
    window.alert(`No hay suficientes unidades. Stock máximo: ${max}`);
    cart[index].cantidad = max;
  } else {
    cart[index].cantidad = v;
  }
  saveCart(cart);
  renderCart();
}

function updateSummary(subtotal) {
  const values = document.querySelectorAll(".summary-value");
  const entrega = subtotal > 0 ? 100.0 : 0.0;
  const total = subtotal + entrega;
  if (values && values.length >= 3) {
    // Asumiendo orden: subtotal, entrega, total
    values[0].textContent = formatPrice(subtotal);
    values[1].textContent = formatPrice(entrega);
    values[2].textContent = formatPrice(total);
  }
}

async function renderSuggestions() {
  const suggestionsContainer = document.querySelector(".suggested-items");
  if (!suggestionsContainer) return;
  suggestionsContainer.innerHTML = "";

  try {
    const res = await ProductoService.obtenerTodos();
    const productos = res && res.data ? res.data : [];
    if (!productos.length) return;

    // Mezclar y tomar hasta 3 aleatorios
    const shuffled = productos.slice().sort(() => Math.random() - 0.5);
    const seleccion = shuffled.slice(0, Math.min(3, shuffled.length));

    seleccion.forEach((p) => {
      const el = document.createElement("div");
      el.className = "suggested-item";
      el.innerHTML = `
        <img src="${p.imagen || ''}" alt="${p.nombre}">
        <h3>${p.nombre}</h3>
        <button class="add-to-cart-button">Agregar</button>
      `;
      const btn = el.querySelector('.add-to-cart-button');
      btn.addEventListener('click', () => {
        // Añadir considerando stock
        const productToAdd = Object.assign({}, p, { cantidadStock: p.cantidadStock ?? null });
        addProductToCart(productToAdd);
        // Actualizar vista del carrito en la misma página
        window.alert('Producto agregado al carrito');
      });
      suggestionsContainer.appendChild(el);
    });
  } catch (err) {
    console.error('Error cargando sugerencias:', err);
  }
}

function addProductToCart(product) {
  try {
    const cart = getCart();
    const existing = cart.find((it) => String(it.id) === String(product.id));
    const max = product.cantidadStock ?? product.cantidadStock === 0 ? product.cantidadStock : (existing ? existing.cantidadStock : null);
    if (existing) {
      const next = (existing.cantidad || 1) + 1;
      if (existing.cantidadStock && next > existing.cantidadStock) {
        window.alert(`No hay suficientes unidades. Stock máximo: ${existing.cantidadStock}`);
        existing.cantidad = existing.cantidadStock;
      } else {
        existing.cantidad = next;
      }
    } else {
      cart.push({ id: product.id, nombre: product.nombre, precio: Number(product.precio) || 0, imagen: product.imagen, cantidad: 1, cantidadStock: product.cantidadStock ?? null });
    }
    saveCart(cart);
    renderCart();
  } catch (err) {
    console.error('Error añadiendo producto al carrito:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderSuggestions();
  attachBuyButtonListener();
});

function getSelectedItems() {
  const cart = getCart();
  const selected = [];
  cart.forEach((it, idx) => {
    const cb = document.getElementById(`item_${idx}`);
    if (cb && cb.checked) selected.push(it);
  });
  return selected;
}

function attachBuyButtonListener() {
  const buyBtn = document.querySelector('.buy-button');
  if (!buyBtn) return;
  buyBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const selected = getSelectedItems();
    if (!selected.length) {
      window.alert('Selecciona al menos un producto para continuar con la compra.');
      return;
    }

    const subtotal = selected.reduce((s, it) => s + (Number(it.precio) || 0) * (Number(it.cantidad) || 1), 0);
    const entrega = subtotal > 0 ? 100.0 : 0.0;
    const total = subtotal + entrega;

      // Añadir totales por item y campos formateados para asegurar que la página de pago
      // pueda mostrar los precios exactamente como estaban al momento de la compra.
      const itemsWithTotals = selected.map(it => {
        const cantidad = Number(it.cantidad) || 1;
        const precio = Number(it.precio) || 0;
        const lineTotal = precio * cantidad;
        return Object.assign({}, it, {
          lineTotal,
          formattedLineTotal: formatPrice(lineTotal),
        });
      });

      const payload = {
        items: itemsWithTotals,
        subtotal,
        entrega,
        total,
        // Campos formateados (útiles para mostrar directamente en pay)
        formattedSubtotal: formatPrice(subtotal),
        formattedEntrega: formatPrice(entrega),
        formattedTotal: formatPrice(total),
      };

    localStorage.setItem('checkout', JSON.stringify(payload));
    // Redirigir a la página de pago
    window.location.href = '/frontend/src/pages/pay-page.html';
  });
}
