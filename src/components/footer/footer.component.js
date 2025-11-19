export class FooterComponent extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		const shadow = this.attachShadow({ mode: "open" });
		this.#addStyles(shadow);
		this.#render(shadow);
	}

	#render(shadow) {
		shadow.innerHTML += `
			<footer>
    <div class="left">
        <a href="/" class="brand">
            <img src="/src/assets/images/Logo2.png" alt="Pawtitas Logo" class="brand-logo">
            <span class="brand-text">Pawtitas</span>
        </a>
    </div>

    <div class="center">
        <p>&copy; 2025 Pawtitas, todos los derechos reservados</p>
    </div>
</footer>
		`;
	}

	#addStyles(shadow) {
		let link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", "./src/components/footer/footer.component.css");
		shadow.appendChild(link);
	}

}