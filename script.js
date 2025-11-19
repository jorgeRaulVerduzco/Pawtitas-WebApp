import { HeaderComponent } from "./src/components/header/header.component.js"
import { FooterComponent } from "./src/components/footer/footer.component.js"

document.addEventListener("DOMContentLoaded", function() {
    page('/', () => showContent('home-page'));
    // Header
    page('/help', () => showContent('help-page'));
    page('/cart', () => showContent('cart-page'));
    page('/profile', () => showContent('profile-page'));
    page('/search', () => showContent('search-page'));

    page();
});

function showContent(contentId) {
    const contentContainer = document.getElementById('content');

    contentContainer.innerHTML = `<${contentId}></${contentId}>`;
}

// Components
window.customElements.define('header-info', HeaderComponent);
window.customElements.define('footer-info', FooterComponent);