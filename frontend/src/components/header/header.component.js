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
      <a href="/" class="brand">
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
      <a href="/help" class="action">
        <img src="/frontend/src/assets/images/circle-question-mark.svg" alt="Ayuda">
        <span>Ayuda</span>
      </a>
      <a href="/cart" class="action">
        <img src="/frontend/src/assets/images/shopping-cart.svg" alt="Carrito">
        <span>Carrito</span>
      </a>
      <a href="/profile" class="action">
        <img src="/frontend/src/assets/images/user.svg" alt="Mi cuenta">
        <span>Mi cuenta</span>
      </a>
    </div>
  </div>
</header>
        `;
    }

    #addStyles(shadow) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', './header.component.css');
        shadow.appendChild(link);
    }
}