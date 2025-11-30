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
        
        // Manejar el logo (brand) - redirigir según rol
        const brandLink = shadow.querySelector('a.brand[data-nav]');
        if (brandLink) {
            brandLink.addEventListener('click', (e) => {
                e.preventDefault();
                const token = localStorage.getItem('token');
                const usuarioRaw = localStorage.getItem('usuario');
                
                let targetPath;
                if (token && usuarioRaw) {
                    try {
                        const usuario = JSON.parse(usuarioRaw);
                        const rol = usuario.rol;
                        
                        if (rol === 'administrador') {
                            targetPath = isStandalonePage 
                                ? '../pages/home-administrador.html' 
                                : '/frontend/src/pages/home-administrador.html';
                        } else if (rol === 'empleado') {
                            targetPath = isStandalonePage 
                                ? '../pages/home-empresas.html' 
                                : '/frontend/src/pages/home-empresas.html';
                        } else {
                            // Cliente: ir a home de productos
                            targetPath = isStandalonePage 
                                ? '../pages/home-productos.html' 
                                : '/frontend/src/pages/home-productos.html';
                        }
                    } catch (error) {
                        // Si hay error, ir a index
                        targetPath = isStandalonePage ? '../../index.html' : '/frontend/index.html';
                    }
                } else {
                    // Sin sesión: ir a index
                    targetPath = isStandalonePage ? '../../index.html' : '/frontend/index.html';
                }
                
                window.location.href = targetPath;
            });
        }

        // Manejar todos los enlaces con data-nav
        shadow.querySelectorAll('a[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('data-nav');
                if (target) {
                    // Verificar si es el enlace de perfil/usuario
                    if (target === 'perfil-usuario-page.html') {
                        const token = localStorage.getItem('token');
                        const usuarioRaw = localStorage.getItem('usuario');
                        
                        // Si no hay sesión activa, redirigir a login
                        if (!token || !usuarioRaw) {
                            const loginPath = isStandalonePage 
                                ? '../pages/login-page.html' 
                                : '/frontend/src/pages/login-page.html';
                            window.location.href = loginPath;
                            return;
                        }
                        
                        // Si hay sesión activa, SIEMPRE ir a perfil de usuario (no importa el rol)
                        // El logo (brand) es el que redirige según el rol, no el icono de usuario
                        const perfilPath = isStandalonePage 
                            ? '../pages/perfil-usuario-page.html' 
                            : '/frontend/src/pages/perfil-usuario-page.html';
                        window.location.href = perfilPath;
                        return;
                    }
                    
                    // Para otros enlaces (como index.html)
                    if (target === 'index.html') {
                        // Desde pages/ ir a ../../index.html
                        window.location.href = '../../index.html';
                    } else {
                        // Navegar a otra página
                        window.location.href = `../pages/${target}`;
                    }
                }
            });
        });

        // Manejar formulario de búsqueda
        const searchForm = shadow.querySelector('.search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchInput = shadow.querySelector('.search-input');
                const query = searchInput ? searchInput.value.trim() : '';
                if (query) {
                    // Redirigir a página de búsqueda o realizar búsqueda
                    if (isStandalonePage) {
                        window.location.href = `../pages/search-page.html?q=${encodeURIComponent(query)}`;
                    } else {
                        window.location.href = `/search?q=${encodeURIComponent(query)}`;
                    }
                }
            });
        }
    }

    #addStyles(shadow) {
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', '/frontend/src/components/header/header.component.css');
        shadow.appendChild(link);
    }
}