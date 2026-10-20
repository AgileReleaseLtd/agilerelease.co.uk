// Agile Release — static marketing site. Self-contained: mobile menu (the cookie banner is js/consent.js).
// Adapted from the EasyTaxer static-site template (site.js), with the EasyTaxer-only
// sandbox-reveal (/api/public-env) and Umami-live-host logic removed — these are
// standalone brochure drafts with no backend.
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    const button = document.getElementById('mobile-menu-button');
    const icon = document.getElementById('mobile-menu-icon');
    if (!menu || !button || !icon) return;
    const isOpen = menu.classList.toggle('hidden') === false;
    button.setAttribute('aria-expanded', String(isOpen));
    icon.classList.toggle('fa-bars', !isOpen);
    icon.classList.toggle('fa-xmark', isOpen);
}

(function () {
    const menuButton = document.getElementById('mobile-menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', toggleMobileMenu);
    }
    document.querySelectorAll('#mobile-menu a').forEach(function (link) {
        link.addEventListener('click', toggleMobileMenu);
    });

    // #2404 — the cookie banner moved to js/consent.js: it exists only when a GA4 measurement id is
    // configured (js/ga4-config.js), and asks for opt-in consent to Google Analytics.
})();
