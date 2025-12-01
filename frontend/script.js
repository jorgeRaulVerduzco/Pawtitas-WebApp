import page from 'https://unpkg.com/page/page.mjs';
import { HeaderComponent } from "./src/components/header/header.component.js"
import { HeaderEmpresasComponent } from "./src/components/header-empresas/header-empresas.component.js"
import { FooterComponent } from "./src/components/footer/footer.component.js"
import { ProductComponent } from "./src/components/product/product.component.js"
import { PetComponent } from "./src/components/pet/pet.component.js"

document.addEventListener("DOMContentLoaded", function() {
    page('/', () => showContent('home-page'));
    // Header
    page('/help', () => showContent('help-page'));
    page('/cart', () => showContent('cart-page'));
    page('/profile', () => showContent('profile-page'));
    page('/search', () => showContent('search-page'));
    // Producto
    page('/product-id', ()=> showContent('product-info-page'));
    // Mascota
    page('/pet-id', ()=> showContent('pet-info-page'));
    
    page();
});

function showContent(contentId) {
    const contentContainer = document.getElementById('content');

    // Si no existe el contenedor 'content' en la página actual, no intentar cambiarlo.
    if (!contentContainer) {
        console.warn("showContent: contenedor '#content' no encontrado en esta página.");
        return;
    }

    contentContainer.innerHTML = `<${contentId}></${contentId}>`;
}

// Components
window.customElements.define('header-info', HeaderComponent);
window.customElements.define('header-empresas-info', HeaderEmpresasComponent);
window.customElements.define('footer-info', FooterComponent);
window.customElements.define('product-info', ProductComponent);
window.customElements.define('pet-info', PetComponent);

// Cargar módulos específicos de página si corresponde (evita tocar HTML de cada página)
try {
    const pathname = window.location.pathname || '';
    // si estamos en la página gestionar-documentos, importar su módulo
    if (pathname.endsWith('gestionar-documentos.html')) {
        import('./src/js/gestionar-documentos.js').catch(err => console.error('Error cargando gestionar-documentos.js', err));
    }
} catch (e) {
    console.warn('No se pudo cargar módulos de página dinámicos:', e);
}