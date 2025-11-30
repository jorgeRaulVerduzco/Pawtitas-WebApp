import ProductoService from "../../services/producto.service.js";

export class ProductComponent extends HTMLElement {
    constructor() {
        super();
        this.productService = ProductoService;
        this.shadow = this.attachShadow({ mode: 'open' });

        // Propiedades del producto por defecto
        this.image = '';
        this.name = '';
        this.price = '';
        this.productData = null;
        this.productId = null;
        this.calificacion = 0;
    }

	connectedCallback() {
        this.productId = this.getAttribute('product-id') || null;

        if (this.productId) {
            this.#agregaEstilo(this.shadow);
            this.#loadProduct(this.productId).then(() => this.#render(this.shadow.getElementById('card') || this.shadow));
        } else {
            this.#agregaEstilo(this.shadow);
            this.#loadAllProducts();
        }
	}

        async #loadAllProducts() {
        try {
            // Pedir todos los productos
            const res = await this.productService.obtenerTodos();
            const productos = res && res.data ? res.data : [];

            // Asegurarnos de tener el contenedor
            let container = this.shadow.getElementById('list');
            if (!container) {
                container = document.createElement('div');
                container.id = 'list';
                container.className = 'product-list';
                this.shadow.appendChild(container);
            }
            container.innerHTML = '';

            if (!productos.length) {
                container.textContent = 'No hay productos para mostrar.';
                return;
            }

            // Eliminar duplicados por id por si el backend los devuelve
            const vistos = new Set();
            const unicos = [];
            productos.forEach(p => {
                if (!p || typeof p.id === 'undefined' || p.id === null) return;
                if (vistos.has(p.id)) return;
                vistos.add(p.id);
                unicos.push(p);
            });

            // Crear un elemento <product-info> por producto único
            // Intentar renderizar en el DOM 'light' dentro de la sección `.resultados-adopcion`
            const hostResultados = this.closest('.resultados-adopcion') || document.querySelector('.resultados-adopcion');
            if (hostResultados) {
                unicos.forEach(p => {
                    const el = document.createElement('product-info');
                    if (p.id) el.setAttribute('product-id', p.id);
                    if (p.nombre) el.setAttribute('name', p.nombre);
                    if (p.imagen) el.setAttribute('image', p.imagen);
                    if (typeof p.calificacion !== 'undefined') el.setAttribute('calificacion', p.calificacion);
                    if (typeof p.precio !== 'undefined') el.setAttribute('price', `$${Number(p.precio).toFixed(2)}`);
                    hostResultados.appendChild(el);
                });
                // Hemos volcado los elementos directamente en la sección principal; eliminar este wrapper
                // para evitar dejar un elemento extra en la grid
                this.remove();
                return;
            }
            // Si no encontramos la sección principal, renderizamos en el shadow por compatibilidad
            unicos.forEach(p => {
                const el = document.createElement('product-info');
                if (p.id) el.setAttribute('product-id', p.id);
                if (p.nombre) el.setAttribute('name', p.nombre);
                if (p.imagen) el.setAttribute('image', p.imagen);
                if (typeof p.calificacion !== 'undefined') el.setAttribute('calificacion', p.calificacion);
                if (typeof p.precio !== 'undefined') el.setAttribute('price', `$${Number(p.precio).toFixed(2)}`);
                container.appendChild(el);
            });
        } catch (err) {
            console.error('Error cargando productos en product-list:', err);
            const container = this.shadow.getElementById('list');
            if (container) container.textContent = 'Error al cargar productos.';
        }
    }

    async #loadProduct(id) {
        try {
            const res = await this.productService.obtenerPorId(id, true);
            if (res && res.data) {
                this.productData = res.data;
                console.log('ProductComponent #loadProduct -> productData:', this.productData);
                this.name = this.productData.nombre || this.name;
                this.image = this.productData.imagen || this.image;
                // Asegurar que precio y calificacion sean numéricos (Sequelize DECIMAL suele venir como string)
                const precioNum = Number(this.productData.precio);
                this.price = `$${(Number.isFinite(precioNum) ? precioNum : 0).toFixed(2)}`;
                const cal = Number(this.productData.calificacion);
                this.calificacion = Number.isFinite(cal) ? cal : 0;
            }
        } catch (err) {
            console.error('Error cargando producto en componente:', err);
        }
    }
    

    #render(container) {
        const parent = container || this.shadow;
        // Navegar directamente a la página estática `producto-page.html` con query param
        // Esto hace que el navegador cargue la página al hacer clic en el producto
        const productUrl = this.productId ? `/src/pages/producto-page.html?product=${this.productId}` : '/src/pages/producto-page.html';
        parent.innerHTML += `
        <div class="card">
            <a href="${productUrl}" class="product-link">
                <div class="image-container">
                    <img src="${this.image}" alt="${this.name}" class="product-image"/>
                </div>
                <div class="card-details">
                <h3>${this.name}</h3>
                <div class="rating">
                    ${this.#getRatingHtml(Math.round(this.calificacion))}
                </div>
                <div class="price">${this.price}</div>
                </div>
            </a>
        </div>
        `;

        // Asegurar navegación fuera del Shadow DOM: redirigir directamente
        // usando `window.location.href` para cargar `producto-page.html`.
        try {
            const link = parent.querySelector('.product-link');
            if (link) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = productUrl;
                });
            }
        } catch (err) {
            console.error('Error al enlazar navegación del producto:', err);
        }
    }

    #getRatingHtml(score) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            const src = i <= score ? '/frontend/src/assets/images/paw-purple.svg' : '/frontend/src/assets/images/paw-gray.svg';
            html += `<img class="paw-icon" src="${src}" alt="${i <= score ? 'Patita activa' : 'Patita inactiva'}" data-score="${i}" style="width:20px;height:20px;margin-right:6px;vertical-align:middle;">`;
        }
        return html;
    }

	#agregaEstilo(shadow) {
        let link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "/src/components/product/product.component.css");
        shadow.appendChild(link);
	}
}
