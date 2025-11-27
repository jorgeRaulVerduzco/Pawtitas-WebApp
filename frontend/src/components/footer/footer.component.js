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
        <a href="/" class="brand" data-nav="index.html">
            <img src="/frontend/src/assets/images/Logo2.png" alt="Pawtitas Logo" class="brand-logo">
            <span class="brand-text">Pawtitas</span>
        </a>
    </div>

    <div class="center">
        <p>&copy; 2025 Pawtitas, todos los derechos reservados</p>
    </div>
</footer>
		`;
		
		// Interceptar clics para navegación compatible con Live Server
		this.#setupNavigation(shadow);
	}
	
	#setupNavigation(shadow) {
		const currentPath = window.location.pathname;
		const isStandalonePage = currentPath.includes('/pages/') || 
		                         (currentPath.includes('.html') && !currentPath.endsWith('/index.html') && !currentPath.endsWith('/'));
		
		shadow.querySelectorAll('a[data-nav]').forEach(link => {
			link.addEventListener('click', (e) => {
				const target = link.getAttribute('data-nav');
				if (isStandalonePage && target) {
					e.preventDefault();
					if (target === 'index.html') {
						window.location.href = '../../index.html';
					} else {
						window.location.href = `../pages/${target}`;
					}
				}
			});
		});
	}

	#addStyles(shadow) {
		let link = document.createElement("link");
		link.setAttribute("rel", "stylesheet");
		link.setAttribute("href", "/frontend/src/components/footer/footer.component.css");
		shadow.appendChild(link);
	}

}