export class PetComponent extends HTMLElement {

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
            <a href="/pet-id" class="pet-link">
            <div class="image-container">
                <img src="./src/assets/images/dog.png" alt="Muchachon">
            </div>
            <div class="card-details">
                <h1>Muchachon</h1>
                <div class="age">
                    <p>2 años</p>
                </div>
            </div>
            </a>
        </div>
		`;
	}

	#agregaEstilo(shadow) {
		let link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", "./src/components/pet/pet.component.css");
		shadow.appendChild(link);
	}
}
