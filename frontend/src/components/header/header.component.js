export class HeaderComponent extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const shadow = this.attachShadow({ mode: 'open' });
        this.#addStyles(shadow);
        this.#render(shadow);
    }

    #render(shadow) {
        shadow.innerHTML += `
            <header>
  <div class="header-content">
    <div class="left">
      <a href="/" class="brand" data-nav="index.html">
        <img src="/frontend/src/assets/images/Logo2.png" alt="Pawtitas Logo" class="brand-logo">
        <span class="brand-text">Pawtitas</span>
      </a>
    </div>

    <div class="center">
      <form class="search-form" action="/search" method="get">
        <input type="search" name="q" class="search-input" placeholder="Buscar..." aria-label="Buscar">
        <button type="submit" class="search-btn" aria-label="Buscar">
          <img src="/frontend/src/assets/images/search.svg" alt="Buscar" />
        </button>
      </form>
    </div>

    <div class="right">
      <a href="https://www.youtube.com/watch?v=oo6NoWGdrH4" class="action">
        <img src="/frontend/src/assets/images/circle-question-mark.svg" alt="Ayuda">
        <span>Ayuda</span>
      </a>
      <a href="/cart" class="action" data-nav="cart-page.html">
        <img src="/frontend/src/assets/images/shopping-cart.svg" alt="Carrito">
        <span>Carrito</span>
      </a>
      <a href="/profile" class="action" data-nav="perfil-usuario-page.html">
        <img src="/frontend/src/assets/images/user.svg" alt="Mi cuenta">
        <span>Mi cuenta</span>
      </a>
    </div>
  </div>
</header>
        `;
        
        // Interceptar clics para navegación compatible con Live Server
        this.#setupNavigation(shadow);
    }
    
    #setupNavigation(shadow) {
        // Detectar si estamos en una página HTML standalone (no en index.html)
        const currentPath = window.location.pathname;
        const isStandalonePage = currentPath.includes('/pages/') || 
                                 (currentPath.includes('.html') && !currentPath.endsWith('/index.html') && !currentPath.endsWith('/'));
        
        shadow.querySelectorAll('a[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.getAttribute('data-nav');
                if (isStandalonePage && target) {
                    e.preventDefault();
                    if (target === 'index.html') {
                        // Desde pages/ ir a ../../index.html
                        window.location.href = '../../index.html';
                    } else {
                        // Navegar a otra página
                        window.location.href = `../pages/${target}`;
                    }
                }
                // Si no es página standalone, dejar que el enlace funcione normalmente (SPA con page.js)
            });
        });
    }

    #addStyles(shadow) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', '/frontend/src/components/header/header.component.css');
        shadow.appendChild(link);
    }
}