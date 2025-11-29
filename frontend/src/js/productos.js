// frontend/src/js/productos.js
import CategoriaService from '../services/categoria.service.js';
import ProductoService from '../services/producto.service.js';

document.addEventListener('DOMContentLoaded', async () => {
	try {
		// Pedimos las categorías incluyendo los productos para obtener el conteo
		const res = await CategoriaService.obtenerTodas(true);
		const categorias = res && res.data ? res.data : [];

		const ul = document.querySelector('.categoria-list');
		if (!ul) return;

		ul.innerHTML = '';

		if (!categorias.length) {
			const li = document.createElement('li');
			li.textContent = 'No hay categorías.';
			ul.appendChild(li);
			return;
		}

		categorias.forEach(cat => {
			const li = document.createElement('li');
			const a = document.createElement('a');
			a.href = '#';
			a.className = 'categoria-producto';
			a.dataset.id = cat.id;
			const count = Array.isArray(cat.productos) ? cat.productos.length : 0;
			a.innerHTML = `<span class="categoria-nombre">${cat.nombre}</span> <span class="numero-product">(${count})</span>`;

			a.addEventListener('click', async (e) => {
				e.preventDefault();
				const id = e.currentTarget.dataset.id;

				const hostResultados = document.querySelector('.resultados-adopcion');
				if (!hostResultados) return;

				hostResultados.innerHTML = '';

				try {
					const resp = await ProductoService.filtrarPorCategoria(id);
					const productos = resp && resp.data ? resp.data : [];

					if (!productos.length) {
						hostResultados.textContent = 'No hay productos para esta categoría.';
						return;
					}

					productos.forEach(p => {
						const el = document.createElement('product-info');
						if (p.id) el.setAttribute('product-id', p.id);
						if (p.nombre) el.setAttribute('name', p.nombre);
						if (p.imagen) el.setAttribute('image', p.imagen);
						if (typeof p.calificacion !== 'undefined') el.setAttribute('calificacion', p.calificacion);
						if (typeof p.precio !== 'undefined') el.setAttribute('price', `$${Number(p.precio).toFixed(2)}`);
						hostResultados.appendChild(el);
					});
				} catch (err) {
					console.error('Error filtrando productos por categoría:', err);
					hostResultados.textContent = 'Error al filtrar productos.';
				}
			});

			li.appendChild(a);
			ul.appendChild(li);
		});
	} catch (err) {
		console.error('Error cargando categorías en productos.js', err);
	}
});