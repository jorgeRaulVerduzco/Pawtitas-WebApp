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
    window.location.href = '/src/pages/direcciones-page.html';
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

// --- Toggle del formulario de tarjeta según método de pago ---
// Habilita/deshabilita inputs y marca/desmarca required
function toggleCreditForm(enable) {
  const form = document.querySelector('.credit-card-form');
  if (!form) return;
  const inputs = form.querySelectorAll('input, select, textarea, button');
  inputs.forEach(inp => {
    if (enable) {
      inp.removeAttribute('disabled');
      // aplicar required solo a campos de texto (input-field) para forzar llenado
      if (inp.classList && inp.classList.contains('input-field')) inp.setAttribute('required', '');
    } else {
      inp.setAttribute('disabled', '');
      inp.removeAttribute('required');
    }
  });
  form.classList.toggle('disabled', !enable);
}

function setupPaymentMethodToggle() {
  const radios = Array.from(document.querySelectorAll('input[name="payment"]'));
  if (!radios || !radios.length) return;

  // Inicializar estado según el radio seleccionado
  const checked = radios.find(r => r.checked) || radios[0];
  toggleCreditForm(checked && checked.id === 'tarjeta-credito');

  radios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isCard = e.target && e.target.id === 'tarjeta-credito';
      toggleCreditForm(isCard);
    });
  });
}

// Intentar configurar el toggle al cargar el módulo (si el DOM ya está listo será llamada sin problema)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupPaymentMethodToggle);
} else {
  setupPaymentMethodToggle();
}

// --- Validaciones y formateo para inputs de tarjeta ---
function sanitizeDigits(value, maxLen) {
  return (value || '').replace(/\D/g, '').slice(0, maxLen);
}

function onCardNumberInput(el) {
  if (!el) return;
  const val = sanitizeDigits(el.value, 16);
  el.value = val;
  updatePayButtonState();
}

function onCvcInput(el) {
  if (!el) return;
  el.value = sanitizeDigits(el.value, 3);
  updatePayButtonState();
}

function onExpiryInput(el) {
  if (!el) return;
  // Mantener solo dígitos y luego formatear MM/YY
  const digits = sanitizeDigits(el.value, 4);
  let month = digits.slice(0, 2);
  let year = digits.slice(2, 4);

  // Ajustes: mes max 12, año mínimo 25
  if (month.length === 2) {
    const m = parseInt(month, 10);
    if (isNaN(m) || m < 1) month = '01';
    else if (m > 12) month = '12';
    else if (month.length === 1) month = '0' + month; // never mind but safe
  }

  if (year.length === 2) {
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 25) year = '25';
  }

  el.value = month + (year ? '/' + year : '');
  updatePayButtonState();
}

function isExpiryValid(value) {
  if (!value) return false;
  const m = value.split('/');
  if (m.length !== 2) return false;
  const month = parseInt(m[0], 10);
  const year = parseInt(m[1], 10);
  if (isNaN(month) || isNaN(year)) return false;
  if (month < 1 || month > 12) return false;
  if (year < 25) return false;
  return true;
}

function isCreditFormValid() {
  const checked = document.querySelector('input[name="payment"]:checked');
  // Si no se seleccionó tarjeta como método, consideramos válido (no bloquear)
  if (!checked || checked.id !== 'tarjeta-credito') return true;

  const cardEl = document.getElementById('card-number');
  const expiryEl = document.getElementById('card-expiry');
  const cvcEl = document.getElementById('card-cvc');
  if (!cardEl || !expiryEl || !cvcEl) return false;

  const cardDigits = sanitizeDigits(cardEl.value, 16);
  const cvcDigits = sanitizeDigits(cvcEl.value, 3);
  return cardDigits.length === 16 && isExpiryValid(expiryEl.value) && cvcDigits.length === 3;
}

function updatePayButtonState() {
  const btn = document.querySelector('.btn-pay');
  if (!btn) return;
  btn.disabled = !isCreditFormValid();
}

function attachCardInputHandlers() {
  const cardEl = document.getElementById('card-number');
  const expiryEl = document.getElementById('card-expiry');
  const cvcEl = document.getElementById('card-cvc');
  const payBtn = document.querySelector('.btn-pay');

  if (cardEl) {
    cardEl.addEventListener('input', () => onCardNumberInput(cardEl));
    cardEl.addEventListener('blur', () => onCardNumberInput(cardEl));
  }
  if (expiryEl) {
    expiryEl.addEventListener('input', () => onExpiryInput(expiryEl));
    expiryEl.addEventListener('blur', () => onExpiryInput(expiryEl));
  }
  if (cvcEl) {
    cvcEl.addEventListener('input', () => onCvcInput(cvcEl));
    cvcEl.addEventListener('blur', () => onCvcInput(cvcEl));
  }

  if (payBtn) {
    // Estado inicial
    updatePayButtonState();
    payBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isCreditFormValid()) {
        alert('Por favor completa correctamente los datos de la tarjeta (16 dígitos, MM/YY válido y CVC de 3 dígitos).');
        return false;
      }

      // Ejecutar el proceso de pago/venta
      try {
        payBtn.disabled = true;
        payBtn.textContent = 'Procesando...';
        await processCheckoutAndPay();
      } catch (err) {
        console.error('Error procesando pago:', err);
        alert('Ocurrió un error procesando el pago: ' + (err.message || err));
      } finally {
        payBtn.disabled = false;
        payBtn.textContent = 'Pagar ahora';
      }
    });
  }

  // También actualizar estado cuando se cambie el método de pago
  const radios = Array.from(document.querySelectorAll('input[name="payment"]'));
  radios.forEach(r => r.addEventListener('change', updatePayButtonState));
}

// Agregar handlers cuando el DOM esté listo (si ya lo está, ejecuta inmediatamente)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', attachCardInputHandlers);
} else {
  attachCardInputHandlers();
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

  // Determinar método de pago (enviar siempre 'tarjeta' para cumplir ENUM del backend)
  const metodo = 'tarjeta';

  // Preparar datos de pago (simulamos aprobado para marcar la venta como completada)
  const pago = {
    monto: total.toFixed ? total.toFixed(2) : String(total),
    metodoPago: metodo,
    referencia: null,
    estado: 'aprobado'
  };

  // Llamar al servicio de ventas (requiere token en headers si el usuario está autenticado)
  if (typeof VentaService === 'undefined' || !VentaService.crearVentaCompleta) {
    throw new Error('VentaService no está disponible. Asegúrate de incluir ../services/venta.service.js en la página');
  }

  // Requerir que el usuario esté autenticado (ruta del backend usa validateJWT)
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirigir a login para que obtenga token y vuelva a intentar
    window.alert('Debes iniciar sesión para realizar el pago');
    window.location.href = '/src/pages/login-page.html';
    return;
  }

  const ventaData = { items, pago };
  const result = await VentaService.crearVentaCompleta(ventaData);

  // Si la venta se creó correctamente, limpiar carrito y checkout y redirigir
  if (result && (result.data?.venta || result.data?.venta || result.data)) {
    try { localStorage.removeItem('cart'); } catch(e){}
    try { localStorage.removeItem('checkout'); } catch(e){}
    // Redirigir a historial de calificaciones/ventas
    window.location.href = '/src/pages/historial-calificacion-productos-page.html';
    return;
  }

  // Si no está en el formato esperado, lanzar error
  throw new Error((result && result.message) ? result.message : 'Respuesta inesperada del servidor al crear la venta');
}
