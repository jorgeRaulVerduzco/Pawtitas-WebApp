import ProductoService from "../services/producto.service.js";

function getProductIdFromUrl() {
	const params = new URLSearchParams(window.location.search);

	// Buscar por varios nombres comunes de parámetro usados en la app
	const candidates = ["id", "product", "producto", "productId", "product-id"];
	for (const name of candidates) {
		const v = params.get(name);
		if (v) return v;
	}

	// También aceptar fragmentos como #123
	if (window.location.hash) {
		const hash = window.location.hash.replace(/^#/, "").trim();
		if (hash && !Number.isNaN(Number(hash))) return hash;
	}

	// Fallback: intentar obtener id desde la ruta (último segmento numérico)
	const parts = window.location.pathname.split("/").filter(Boolean);
	const last = parts[parts.length - 1];
	if (last && !Number.isNaN(Number(last))) return last;

	return null;
}

function renderRating(container, value) {
	if (!container) return;
	const max = 5;
	const rounded = Math.round(Number(value) || 0);
	let html = "";
	for (let i = 1; i <= max; i++) {
		if (i <= rounded) {
			html += `<i class=\"f\"><img class=\"paw\" src=\"/frontend/src/assets/images/paw-purple.svg\" alt=\"Paw\"></i>`;
		} else {
			html += `<i class=\"f\"><img class=\"paw\" src=\"/frontend/src/assets/images/paw-gray.svg\" alt=\"Paw\"></i>`;
		}
	}
	container.innerHTML = html;
}

function formatPrice(value) {
	const num = Number(value);
	if (Number.isNaN(num)) return "$0.00";
	return `$${num.toFixed(2)}`;
}

async function loadAndRenderProduct() {
	const id = getProductIdFromUrl();
	if (!id) {
		console.error("No se encontró ID de producto en la URL");
		showErrorInPage("Producto no especificado.");
		return;
	}

	// Elementos del DOM
	const imgEl = document.querySelector(".product-content img");
	const titleEl = document.querySelector(".product-details h1");
	const descEl = document.querySelector(".product-details .descripcion");
	const ratingEl = document.querySelector(".product-details .rating");
	const priceEl = document.querySelector(".price-container .price");
	const priceContainer = document.querySelector(".price-container");
	const stockLabelEl = priceContainer ? priceContainer.querySelector(".stock") : null;
	const stockCountEl = priceContainer
		? Array.from(priceContainer.querySelectorAll("p")).find((p) => !p.classList.contains("stock"))
		: null;
	const addToCartBtn = document.querySelector(".add-to-cart-button");

	showLoading(true);

	try {
		// Pedir al servicio (incluimos categorias por si se necesitan)
		const data = await ProductoService.obtenerPorId(id, true);

		// El controlador devuelve { status, data } normalmente
		const product = data && data.data ? data.data : data;

		if (!product) {
			console.error("Producto no encontrado para id:", id);
			showErrorInPage("Producto no encontrado.");
			return;
		}

		// Imagen (puede ser URL o base64)
		try {
			if (product.imagen && imgEl) imgEl.src = product.imagen;
            
			if (titleEl) titleEl.textContent = product.nombre || "Sin nombre";
			if (descEl) descEl.textContent = product.descripcion || "Descripción no disponible.";

			if (ratingEl) renderRating(ratingEl, product.calificacion);

			if (priceEl) priceEl.textContent = formatPrice(product.precio);

			if (stockLabelEl) stockLabelEl.textContent = "Stock:";
			if (stockCountEl) stockCountEl.textContent = `${product.cantidadStock ?? 0} unidades`;

			if (addToCartBtn) {
				if (product.activo === false || (product.cantidadStock || 0) <= 0) {
					addToCartBtn.disabled = true;
					addToCartBtn.textContent = "No disponible";
				} else {
					addToCartBtn.disabled = false;
					addToCartBtn.textContent = "Agregar al carrito";
				}

				// Añadir comportamiento: alerta y volver a la lista de productos
				if (!addToCartBtn.dataset.handlerAttached) {
					addToCartBtn.addEventListener('click', (e) => {
						e.preventDefault();
						try {
							// Leer carrito desde localStorage
							const raw = localStorage.getItem('cart') || '[]';
							const cart = JSON.parse(raw);
							// Buscar si ya existe el producto
							const existing = cart.find((it) => Number(it.id) === Number(product.id));
							if (existing) {
								existing.cantidad = (existing.cantidad || 1) + 1;
							} else {
								cart.push({
									id: product.id,
									nombre: product.nombre,
									precio: Number(product.precio) || 0,
									imagen: product.imagen || '/frontend/src/assets/images/dawg.png',
									cantidad: 1
								});
							}
							localStorage.setItem('cart', JSON.stringify(cart));
							window.alert('Producto agregado al carrito');
							// Ir al carrito
							window.location.href = '/src/pages/cart-page.html';
						} catch (err) {
							console.error('Error agregando al carrito:', err);
							window.alert('No se pudo agregar el producto. Revisa la consola.');
						}
					});
					addToCartBtn.dataset.handlerAttached = '1';
				}
			}
		} catch (innerErr) {
			console.error("Error actualizando el DOM del producto:", innerErr);
		}
	} catch (error) {
		console.error("Error cargando producto:", error);
		showErrorInPage("Error al cargar el producto. Revisa la consola para más detalles.");
	}
	finally {
		showLoading(false);
	}
}

document.addEventListener("DOMContentLoaded", () => {
	loadAndRenderProduct();
});

// Helpers visuales
function showLoading(on = true) {
	const main = document.querySelector(".main-content");
	if (!main) return;
	let loader = document.querySelector("#producto-loader");
	if (on) {
		if (!loader) {
			loader = document.createElement("div");
			loader.id = "producto-loader";
			loader.style.cssText = "padding:20px; text-align:center; font-weight:600;";
			loader.textContent = "Cargando producto...";
			main.prepend(loader);
		}
	} else {
		if (loader) loader.remove();
	}
}

function showErrorInPage(message) {
	const main = document.querySelector(".main-content");
	if (!main) return;
	let err = document.querySelector("#producto-error");
	if (!err) {
		err = document.createElement("div");
		err.id = "producto-error";
		err.style.cssText = "padding:20px; margin:20px; background:#ffe6e6; color:#800; border-radius:8px;";
		main.prepend(err);
	}
	err.textContent = message;
}

