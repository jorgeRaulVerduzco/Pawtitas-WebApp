export class ProductComponent extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
        this.shadow = this.attachShadow({ mode: "open" });
		this.#agregaEstilo(this.shadow);
		this.#render(this.shadow);
	}

    // Solo son datos de prueba, despues se pondran los de la base de datos
	#render(shadow) {
		shadow.innerHTML += `
		<div class="card">
            <a href="/product-id" class="product-link">
                <div class="image-container">
                    <img src="/frontend/src/assets/images/dawg.png" alt="Producto">
                </div>
                <div class="card-details">
                <h3>Pedigree - High Protein, Croquetas para Perro Adulto, Sabor Res y Pollo, Alimento Completo para Perro con Alta Proteína, Vitaminas y Omega 6, 18 kg</h3>
                <div class="rating">
                    ${this.#getRatingHtml(4)}
                </div>
                <div class="price">$25.00</div>
                </div>
            </a>
        </div>
		`;
	}

    #getRatingHtml(score) {
        let html = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= score) {
                html += '<i class="fas fa-paw"><img src="/frontend/src/assets/images/paw-purple.svg" alt="Estrella"></i>';
            } else {
                html += '<i class="fas fa-paw"><img src="/frontend/src/assets/images/paw-gray.svg" alt="Sin estrella"></i>';
            }
        }
        return html;
    }

	#agregaEstilo(shadow) {
		let link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", "./product.component.css");
		shadow.appendChild(link);
	}
}
