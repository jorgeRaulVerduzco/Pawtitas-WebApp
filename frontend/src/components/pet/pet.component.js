export class PetComponent extends HTMLElement {

	constructor() {
		super();
	}

	connectedCallback() {
		this.shadow = this.attachShadow({ mode: "open" });
		this.#agregaEstilo(this.shadow);
		this.#render(this.shadow);
	}

	#render(shadow) {
		const name = this.getAttribute('name') || 'Sin nombre';
		const image = this.getAttribute('imagen') || '/frontend/src/assets/images/dog.png';
		const age = this.getAttribute('edad') || '';
		const petId = this.getAttribute('pet-id') || '';

		shadow.innerHTML += `
		<div class="card">
			<a href="./perfil-mascota.html?id=${petId}" class="pet-link" data-id="${petId}">
				<div class="image-container">
					<img src="${image}" alt="${name}">
				</div>
				<div class="card-details">
					<h1>${name}</h1>
					<div class="meta">
						<p class="age">${age}</p>
				</div>
			</a>
		</div>
		`;
	}

	#agregaEstilo(shadow) {
		let link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", "/frontend/src/components/pet/pet.component.css");
		shadow.appendChild(link);
	}
}
