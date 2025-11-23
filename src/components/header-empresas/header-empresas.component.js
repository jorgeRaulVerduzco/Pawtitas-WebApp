export class HeaderEmpresasComponent extends HTMLElement {
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
        <img src="/src/assets/images/Logo2.png" alt="Pawtitas Logo" class="brand-logo">
        <span class="brand-text">Pawtitas</span>
      </a>
    </div>

    <div class="center">
      <h1 class="titulo">Cuenta de empresa</h1>
    </div>
  </div>
</header>
        `;
    }

    #addStyles(shadow) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', '/src/components/header/header.component.css');
        shadow.appendChild(link);
    }
}