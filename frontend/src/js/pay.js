import DireccionService from '../services/direccion.service.js';
import VentaService from '../services/venta.service.js';

function readCheckout() {
  try {
    const raw = localStorage.getItem('checkout');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error parseando checkout:', e);
    return null;
  }
}

function formatPrice(value) {
  const num = Number(value) || 0;
  return `$${num.toFixed(2)}`;
}

function renderItems(items) {
  const summaryCard = document.querySelector('.checkout-summary .summary-details');
  console.debug('pay.js: renderItems called, items:', items);
  if (!summaryCard) return;

  // Crear contenedor de items encima del summary
  let itemsContainer = document.querySelector('.checkout-items');
  if (!itemsContainer) {
    itemsContainer = document.createElement('div');
    itemsContainer.className = 'checkout-items card';
    itemsContainer.style.marginBottom = '12px';
    summaryCard.parentNode.insertBefore(itemsContainer, summaryCard);
  }

  if (!items || !items.length) {
    itemsContainer.innerHTML = '<p>No hay items en el checkout.</p>';
    return;
  }

  itemsContainer.innerHTML = items.map(it => `
    <div class="checkout-item" style="display:flex; gap:12px; align-items:center; padding:8px 0; border-bottom:1px solid #eee;">
      <img src="${it.imagen || ''}" alt="${it.nombre}" style="width:64px;height:64px;object-fit:cover;border-radius:6px" />
      <div style="flex:1">
        <div style="font-weight:600">${it.nombre}</div>
        <div style="color:#666">Cantidad: ${it.cantidad}</div>
      </div>
      <div style="font-weight:700">${it.formattedLineTotal ? it.formattedLineTotal : formatPrice((Number(it.precio)||0) * (Number(it.cantidad)||1))}</div>
    </div>
  `).join('');
}

async function fillAddress() {
  const addressTextEl = document.querySelector('.address-text');
  if (!addressTextEl) return;

  // Intentar obtener direcciones vía API (requiere token si el usuario está logueado)
  try {
    const res = await DireccionService.obtenerTodas();
    const direcciones = res && res.data ? res.data : res;
    if (Array.isArray(direcciones) && direcciones.length) {
      const first = direcciones[0];
      // Componer un texto legible
      const parts = [];
      if (first.calle) parts.push(first.calle);
      if (first.numero) parts.push(`#${first.numero}`);
      if (first.colonia) parts.push(first.colonia);
      if (first.municipio) parts.push(first.municipio);
      if (first.codigoPostal) parts.push(first.codigoPostal);
      addressTextEl.textContent = parts.join(', ');
      return;
    }
  } catch (err) {
    console.warn('No se pudieron obtener direcciones desde la API:', err.message || err);
  }

  // Fallback: si hay direcciones guardadas en localStorage bajo 'direcciones' o 'direccion'
  try {
    const raw = localStorage.getItem('direcciones') || localStorage.getItem('direccion');
    if (raw) {
      const parsed = JSON.parse(raw);
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      if (first) {
        const parts = [];
        if (first.calle) parts.push(first.calle);
        if (first.numero) parts.push(`#${first.numero}`);
        if (first.colonia) parts.push(first.colonia);
        if (first.municipio) parts.push(first.municipio);
        if (first.codigoPostal) parts.push(first.codigoPostal);
        addressTextEl.textContent = parts.join(', ');
        return;
      }
    }
  } catch (e) {
    console.warn('No hay direcciones en localStorage o están mal formateadas');
  }

  // Si no se encontró ninguna dirección, avisar al usuario y redirigir a la página de direcciones
  addressTextEl.innerHTML = '<strong>No tienes una dirección guardada.</strong> Serás redirigido para agregar una.';
  // pequeña espera para que el usuario vea el mensaje
  setTimeout(() => {
    window.location.href = '/frontend/src/pages/direcciones-page.html';
  }, 1500);
}

function renderSummary(checkout) {
  console.debug('pay.js: renderSummary called, checkout:', checkout);

  // Seleccionar todos los spans que representan los valores finales en el resumen.
  const valueSpans = Array.from(document.querySelectorAll('.summary-details .summary-row span:last-child'));

  // Intentar obtener total por selector específico también
  const totalSpecific = document.querySelector('.summary-details .summary-row.total span:last-child');

  if (!valueSpans.length) {
    console.warn('pay.js: no se encontraron spans de valores en .summary-details. Selectors may be wrong.');
    return;
  }

  // Si el selector general encontró al menos 3, usarlos por orden: subtotal, entrega, total
  if (checkout) {
    const formattedSubtotal = checkout.formattedSubtotal ? checkout.formattedSubtotal : formatPrice(checkout.subtotal || 0);
    const formattedEntrega = checkout.formattedEntrega ? checkout.formattedEntrega : formatPrice(checkout.entrega || 0);
    const formattedTotal = checkout.formattedTotal ? checkout.formattedTotal : formatPrice(checkout.total || 0);

    if (valueSpans.length >= 3) {
      valueSpans[0].textContent = formattedSubtotal;
      valueSpans[1].textContent = formattedEntrega;
      valueSpans[2].textContent = formattedTotal;
    } else if (totalSpecific) {
      // Si no hay suficientes spans, asignar subtotal/entrega al primer span y total al selector específico
      if (valueSpans[0]) valueSpans[0].textContent = formattedSubtotal;
      if (valueSpans[1]) valueSpans[1].textContent = formattedEntrega;
      totalSpecific.textContent = formattedTotal;
    } else {
      // Fallback: aplicar al primer span si existe
      if (valueSpans[0]) valueSpans[0].textContent = formattedTotal;
    }

    console.debug('pay.js: applied formatted values:', { formattedSubtotal, formattedEntrega, formattedTotal });
    return;
  }

  // Fallback: calcular desde el carrito en localStorage
  const rawCart = localStorage.getItem('cart');
  let cart = [];
  try {
    cart = rawCart ? JSON.parse(rawCart) : [];
  } catch (e) {
    console.error('pay.js: error parseando cart in renderSummary fallback:', e);
    cart = [];
  }
  const subtotal = cart.reduce((s,it) => s + (Number(it.precio)||0)*(Number(it.cantidad)||1), 0);
  const entrega = subtotal > 0 ? 100.0 : 0.0;
  const formattedSubtotal = formatPrice(subtotal);
  const formattedEntrega = formatPrice(entrega);
  const formattedTotal = formatPrice(subtotal + entrega);

  if (valueSpans.length >= 3) {
    valueSpans[0].textContent = formattedSubtotal;
    valueSpans[1].textContent = formattedEntrega;
    valueSpans[2].textContent = formattedTotal;
  } else if (totalSpecific) {
    if (valueSpans[0]) valueSpans[0].textContent = formattedSubtotal;
    totalSpecific.textContent = formattedTotal;
  } else if (valueSpans[0]) {
    valueSpans[0].textContent = formattedTotal;
  }

  console.debug('pay.js: applied fallback values from cart:', { formattedSubtotal, formattedEntrega, formattedTotal });
}

document.addEventListener('DOMContentLoaded', async () => {
  console.info('pay.js loaded — comprobando localStorage.checkout');
  const checkout = readCheckout();
  console.debug('pay.js: checkout from localStorage:', checkout);
  if (checkout && checkout.items) {
    renderItems(checkout.items);
    renderSummary(checkout);
  } else {
    // si no hay checkout, usar el cart como fallback
    const rawCart = localStorage.getItem('cart') || '[]';
    let cart = [];
    try {
      cart = JSON.parse(rawCart);
    } catch (e) {
      console.error('pay.js: error parseando cart from localStorage:', e, rawCart);
      cart = [];
    }
    console.debug('pay.js: cart fallback:', cart);
    renderItems(cart);
    const subtotal = cart.reduce((s,it) => s + (Number(it.precio)||0)*(Number(it.cantidad)||1), 0);
    const entrega = subtotal>0?100:0;
    const total = subtotal + entrega;
    // Construir campos formateados para el fallback
    const formattedSubtotal = formatPrice(subtotal);
    const formattedEntrega = formatPrice(entrega);
    const formattedTotal = formatPrice(total);
    // Añadir formattedLineTotal a cada item si no existe
    const itemsWithFormatted = (cart || []).map(it => {
      const cantidad = Number(it.cantidad) || 1;
      const precio = Number(it.precio) || 0;
      const lineTotal = precio * cantidad;
      return Object.assign({}, it, { lineTotal, formattedLineTotal: it.formattedLineTotal ? it.formattedLineTotal : formatPrice(lineTotal) });
    });
    renderItems(itemsWithFormatted);
    renderSummary({ items: itemsWithFormatted, subtotal, entrega, total, formattedSubtotal, formattedEntrega, formattedTotal });
  }

  await fillAddress();
});

// Configurar botón de pago - sin validación de tarjeta
function setupPayButton() {
  const payBtn = document.querySelector('.btn-pay');
  if (payBtn) {
    // Habilitar botón por defecto (no requiere validación de tarjeta)
    payBtn.disabled = false;
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Ejecutar el proceso de pago/venta directamente (sin validar tarjeta)
      try {
        payBtn.disabled = true;
        payBtn.textContent = 'Procesando...';
        await processCheckoutAndPay();
      } catch (err) {
        console.error('Error procesando pago:', err);
        alert('Ocurrió un error procesando el pago: ' + (err.message || err));
        payBtn.disabled = false;
        payBtn.textContent = 'Pagar ahora';
      }
    });
  }
}

// Agregar handlers cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPayButton);
} else {
  setupPayButton();
}

// --- Proceso de pago que llama al backend para crear venta/pago/items ---
async function processCheckoutAndPay() {
  // Obtener items desde checkout o cart
  const checkout = readCheckout();
  let itemsSource = [];
  if (checkout && Array.isArray(checkout.items) && checkout.items.length) {
    itemsSource = checkout.items;
  } else {
    try {
      const raw = localStorage.getItem('cart') || '[]';
      itemsSource = JSON.parse(raw) || [];
    } catch (e) {
      itemsSource = [];
    }
  }

  if (!itemsSource || !itemsSource.length) {
    throw new Error('No hay items para procesar en la compra');
  }

  // Mapear al formato que espera el backend: { productoId, cantidad }
  const items = itemsSource.map(it => ({ productoId: it.id ?? it.productoId ?? it.producto?.id, cantidad: Number(it.cantidad) || 1 }));

  // Calcular totales (subtotal + entrega si aplica)
  const subtotal = itemsSource.reduce((s,it) => s + ((Number(it.precio)||0) * (Number(it.cantidad)||1)), 0);
  const entrega = subtotal>0 ? 100.0 : 0.0;
  const total = subtotal + entrega;

  // Determinar método de pago según selección del usuario o usar 'tarjeta' por defecto
  const metodoSeleccionado = document.querySelector('input[name="payment"]:checked');
  const metodo = metodoSeleccionado && metodoSeleccionado.id === 'paypal' ? 'transferencia' : 'tarjeta';

  // Preparar datos de pago (aprobado directamente, como en las clases test)
  const pago = {
    monto: total.toFixed ? total.toFixed(2) : String(total),
    metodoPago: metodo,
    referencia: null,
    estado: 'aprobado'
  };

  // Requerir que el usuario esté autenticado (ruta del backend usa validateJWT)
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirigir a login para que obtenga token y vuelva a intentar
    window.alert('Debes iniciar sesión para realizar el pago');
    window.location.href = '/frontend/src/pages/login-page.html';
    return;
  }

  const ventaData = { items, pago };
  const result = await VentaService.crearVentaCompleta(ventaData);

  // Si la venta se creó correctamente, limpiar carrito y checkout y redirigir
  if (result && (result.data?.venta || result.data?.venta || result.data)) {
    try { localStorage.removeItem('cart'); } catch(e){}
    try { localStorage.removeItem('checkout'); } catch(e){}
    // Redirigir a historial de calificaciones/ventas
    window.location.href = '/frontend/src/pages/historial-calificacion-productos-page.html';
    return;
  }

  // Si no está en el formato esperado, lanzar error
  throw new Error((result && result.message) ? result.message : 'Respuesta inesperada del servidor al crear la venta');
}
