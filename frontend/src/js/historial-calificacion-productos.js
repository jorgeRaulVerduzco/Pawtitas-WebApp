import ProductoService from '../services/producto.service.js';

document.addEventListener('DOMContentLoaded', async () => {
	const purchasesCard = document.querySelector('.purchases-card');

	const token = localStorage.getItem('token');
	const usuarioRaw = localStorage.getItem('usuario');

	if (!token || !usuarioRaw) {
		window.location.href = '/frontend/src/pages/login-page.html';
		return;
	}

	const usuario = JSON.parse(usuarioRaw);

	purchasesCard.innerHTML = '<p>Cargando historial...</p>';

	try {
		const resp = await VentaService.obtenerHistorial(usuario.id);
		console.log('Respuesta obtenerHistorial:', resp);
		const ventas = resp.data || [];

		// Recolectar todos los items de todas las ventas
		const items = [];
		for (const venta of ventas) {
			if (venta.items && Array.isArray(venta.items)) {
				for (const it of venta.items) {
					items.push({ ventaId: venta.id, fechaVenta: venta.fechaVenta, ...it });
				}
			}
		}

		if (items.length === 0) {
			purchasesCard.innerHTML = '<p>No has comprado productos aún.</p>';
			return;
		}

		purchasesCard.innerHTML = '';

		items.forEach((item, idx) => {
			const el = crearElementoCompra(item);
			purchasesCard.appendChild(el);
			// Asegurar calificación desde backend si no vino en el objeto
			ensureRatingFromBackend(item, el);

			if (idx < items.length - 1) {
				const hr = document.createElement('hr');
				hr.className = 'divider';
				purchasesCard.appendChild(hr);
			}
		});

		// Delegación: manejar clicks en botones de calificar y en 'Volver comprar'
		purchasesCard.addEventListener('click', (e) => {
			// Botón Calificar -> enviar calificación al backend
			const btnRate = e.target.closest('.btn-rate');
			if (btnRate) {
				const productoId = btnRate.dataset.productoId;
				if (!productoId) {
					console.warn('btn-rate: productoId no encontrado');
					return;
				}
				// Buscar el contenedor de paws correspondiente
				const ratingContainer = btnRate.closest('.product-rating')?.querySelector('.paws-container') || document.querySelector(`.paws-container[data-producto-id="${productoId}"]`);
				const rating = ratingContainer ? Number(ratingContainer.dataset.rating || 0) : 0;
				if (!rating || rating <= 0) {
					window.alert('Por favor selecciona la calificación haciendo click en las patas.');
					return;
				}
				// Enviar al backend
				btnRate.disabled = true;
				ProductoService.calificar(productoId, rating)
					.then((res) => {
						console.log('Calificación guardada:', res);
						window.alert('Gracias por calificar el producto.');
					})
					.catch((err) => {
						console.error('Error al calificar producto:', err);
						window.alert('No se pudo enviar la calificación. Intenta más tarde.');
					})
					.finally(() => {
						btnRate.disabled = false;
					});
				return;
			}

			// Botón Volver comprar -> redirigir al detalle del producto
			const btnAction = e.target.closest('.btn-action');
			if (btnAction) {
				const productoId = btnAction.dataset.productoId || btnAction.getAttribute('data-producto-id');
				console.log('click Volver comprar - target:', e.target, 'btnAction:', btnAction, 'productoId attr:', productoId);
				if (!productoId) {
					// Intentar leer id desde el contenedor padre (data-producto-id en otra parte)
					console.warn('productoId no encontrado en atributo del botón');
					return;
				}
				const productUrl = `/src/pages/producto-page.html?product=${productoId}`;
				console.log('Redirigiendo a:', productUrl);
				window.location.href = productUrl;
			}

			// Click sobre una pata -> actualizar rating visual y atributo
			const paw = e.target.closest('.paw-icon');
			if (paw) {
				const value = Number(paw.dataset.value || 0);
				const container = paw.closest('.paws-container');
				if (!container) return;
				container.dataset.rating = value;
				const imgs = container.querySelectorAll('.paw-icon');
				imgs.forEach((p) => {
					const v = Number(p.dataset.value || 0);
					const img = p.querySelector('img');
					if (v <= value) {
						p.classList.remove('inactive');
						p.classList.add('active');
						if (img) img.src = '/frontend/src/assets/images/paw-purple.svg';
					} else {
						p.classList.remove('active');
						p.classList.add('inactive');
						if (img) img.src = '/frontend/src/assets/images/paw-gray.svg';
					}
				});
				return;
			}
		});

	} catch (error) {
		console.error('Error al cargar historial de compras:', error);
		purchasesCard.innerHTML = '<p>Error al cargar historial. Intenta más tarde.</p>';
	}

	function crearElementoCompra(item) {
		const div = document.createElement('div');
		div.className = 'purchase-item';

		const producto = item.producto || {};
		const nombre = producto.nombre || 'Producto';
		const imagen = producto.imagen || '';
		// fallback al id directo del item (ventaItem) si el objeto producto no tiene id
		const prodId = producto.id || item.productoId || item.productoId || '';
		console.log('crearElementoCompra - producto:', { prodId, nombre });
		const calificacion = parseFloat(producto.calificacion || 0);

		// Generar Paws interactivos (cada i tiene data-value)
		let pawsHtml = '';
		const initial = Math.round(calificacion) || 0;
		for (let i = 1; i <= 5; i++) {
			const active = i <= initial;
			const imgSrc = active ? '/frontend/src/assets/images/paw-purple.svg' : '/frontend/src/assets/images/paw-gray.svg';
			const cls = active ? 'active' : 'inactive';
			pawsHtml += `<i class="paw-icon ${cls}" data-value="${i}" role="button" tabindex="0"><img src="${imgSrc}" alt=""></i>`;
		}

		div.innerHTML = `
				<div class="product-image">
					<img src="${imagen}" alt="${nombre}">
				</div>
				<div class="product-details">
					<h3>${nombre}</h3>
					<p>Cantidad: ${item.cantidad}</p>
					<button class="btn-action" data-producto-id="${prodId}">Volver comprar</button>
				</div>
				<div class="product-rating">
					<div class="paws-container" data-producto-id="${prodId}" data-rating="${initial}">
						${pawsHtml}
					</div>
					<button class="btn-rate" data-producto-id="${prodId}">Calificar producto</button>
				</div>
			`;

		return div;
	}

	// Si la calificación no vino en el objeto `producto` del item, la obtenemos directamente
	async function ensureRatingFromBackend(item, el) {
		try {
			const producto = item.producto || {};
			const prodId = producto.id || item.productoId || item.productoId || '';
			if (!prodId) return;
			const container = el.querySelector('.paws-container');
			if (!container) return;
			const hasRatingInProduct = typeof producto.calificacion === 'number' && !Number.isNaN(producto.calificacion);
			if (hasRatingInProduct) return; // ya viene, no hacemos nada

			// Obtener producto desde el servicio
			const res = await ProductoService.obtenerPorId(prodId);
			const prodData = res && res.data ? res.data : res;
			const cal = prodData && typeof prodData.calificacion !== 'undefined' ? Math.round(Number(prodData.calificacion) || 0) : 0;
			console.log('ensureRatingFromBackend -> prodId, cal, prodData:', prodId, cal, prodData);
			container.dataset.rating = cal;
			const imgs = container.querySelectorAll('.paw-icon');
			imgs.forEach((p) => {
				const v = Number(p.dataset.value || 0);
				const img = p.querySelector('img');
				if (v <= cal) {
					p.classList.remove('inactive');
					p.classList.add('active');
					if (img) img.src = '/frontend/src/assets/images/paw-purple.svg';
				} else {
					p.classList.remove('active');
					p.classList.add('inactive');
					if (img) img.src = '/frontend/src/assets/images/paw-gray.svg';
				}
			});
			// Fallback: si no se actualizaron imágenes (por CSS o por estructura diferente), regenerar el HTML
			const anyActive = Array.from(container.querySelectorAll('.paw-icon img')).some(i => i.src && i.src.includes('paw-purple'));
			if (!anyActive && cal > 0) {
				container.innerHTML = generarPawsHTML(cal);
				container.dataset.rating = cal;
			}
		} catch (err) {
			console.warn('No se pudo obtener calificación desde backend para item', item, err);
		}
	}

	function generarPawsHTML(calificacion) {
		const total = 5;
		const activas = Math.round(calificacion);
		let html = '';
		for (let i = 0; i < total; i++) {
			const clase = i < activas ? 'active' : 'inactive';
			const src = i < activas ? '/frontend/src/assets/images/paw-purple.svg' : '/frontend/src/assets/images/paw-gray.svg';
			html += `<i class="paw-icon ${clase}" data-value="${i+1}"><img src="${src}" alt=""></i>`;
		}
		return html;
	}

});
