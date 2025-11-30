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
      <a href="/" class="brand" data-nav="index.html">
        <img src="/frontend/src/assets/images/Logo2.png" alt="Pawtitas Logo" class="brand-logo">
        <span class="brand-text">Pawtitas</span>
      </a>
    </div>

    <div class="center">
      <h1 class="titulo">Cuenta de empresa</h1>
    </div>

    <div class="right">
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
                        const perfilPath = isStandalonePage 
                            ? '../pages/perfil-usuario-page.html' 
                            : '/frontend/src/pages/perfil-usuario-page.html';
                        window.location.href = perfilPath;
                        return;
                    }
                    
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
        let link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', '/frontend/src/components/header/header.component.css');
        shadow.appendChild(link);
    }
}