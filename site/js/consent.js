/**
 * Google Analytics 4 on this website, behind an OPT-IN cookie banner (EasyTaxer item #2404).
 *
 * Owner's decision (2026-10-07): one GA4 property per site; an opt-in banner, so Google Analytics loads
 * only after the visitor presses Accept; Google Consent Mode v2, everything denied by default.
 *
 * WHAT THIS FILE DOES
 *   1. Reads the measurement id from `js/ga4-config.js`, a one-line file that
 *      scripts/build-pages.sh writes from pages.conf (an empty string turns analytics off).
 *   2. No valid id → it STOPS: no banner, no "Cookie settings" link, nothing stored, nothing loaded.
 *   3. A valid id → the stored choice decides: none yet = the banner (Accept and Reject side by side,
 *      equally easy); "granted" = Google's tag is loaded; "denied" = nothing. A "Cookie settings" button
 *      is added to the footer, beside "Cookie Policy", so the choice can be changed at any time.
 *   4. Loading (only ever after an Accept): the Consent Mode v2 DEFAULT is set first (every storage
 *      denied), then the visitor's UPDATE (analytics only; the advertising signals stay denied), and only
 *      then is Google's tag (gtag.js, from www.googletagmanager.com) requested.
 *   5. Withdrawing (Reject after Accept) switches GA off on the page and deletes the `_ga` cookies.
 *
 * NOTHING FROM GOOGLE BEFORE ACCEPT.
 *
 * No inline script and no style attributes (the CSP forbids both): every class used below already
 * exists in css/tailwind.css.
 */
(function () {
    'use strict';

    var SITE_NAME = 'Agile Release';
    var STORAGE_KEY = 'ar-analytics-consent';
    // The old banner stored this after saying "We use only essential cookies" — never consent to GA.
    var LEGACY_KEY = 'ar-cookie-consent';
    var CHOICE_VERSION = 1;
    var GRANTED = 'granted';
    var DENIED = 'denied';
    var ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
    var GTAG_ORIGIN = 'https://www.googletagmanager.com';
    var POLICY_HREF = 'cookie-policy.html';

    var measurementId = null;
    var gaLoaded = false;
    var returnFocusTo = null;

    function normaliseId(raw) {
        if (typeof raw !== 'string') return null;
        var id = raw.trim().toUpperCase();
        return ID_PATTERN.test(id) ? id : null;
    }

    function readChoice() {
        try {
            var raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            var parsed = JSON.parse(raw);
            if (parsed && parsed.v === CHOICE_VERSION && (parsed.analytics === GRANTED || parsed.analytics === DENIED)) {
                return parsed.analytics;
            }
        } catch (e) { /* unreadable storage = no choice yet */ }
        return null;
    }

    function writeChoice(choice) {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: CHOICE_VERSION, analytics: choice, at: new Date().toISOString() }));
        } catch (e) { /* storage blocked: the choice holds for this page view only */ }
    }

    function forgetLegacyChoice() {
        try { window.localStorage.removeItem(LEGACY_KEY); } catch (e) { /* nothing to do */ }
    }

    function gtag() {
        // gtag.js reads ARGUMENTS objects off the dataLayer, never arrays.
        window.dataLayer.push(arguments);
    }

    function loadGoogleAnalytics(id) {
        if (gaLoaded) return;
        gaLoaded = true;
        window['ga-disable-' + id] = false;
        window.dataLayer = window.dataLayer || [];
        window.gtag = gtag;
        gtag('consent', 'default', {
            ad_storage: DENIED,
            ad_user_data: DENIED,
            ad_personalization: DENIED,
            analytics_storage: DENIED
        });
        gtag('consent', 'update', { analytics_storage: GRANTED });
        gtag('js', new Date());
        gtag('config', id, { allow_google_signals: false, allow_ad_personalization_signals: false });
        var script = document.createElement('script');
        script.async = true;
        script.src = GTAG_ORIGIN + '/gtag/js?id=' + encodeURIComponent(id);
        document.head.appendChild(script);
    }

    function deleteAnalyticsCookies() {
        var names = [];
        var jar = (document.cookie || '').split(';');
        for (var i = 0; i < jar.length; i++) {
            var name = jar[i].split('=')[0].trim();
            if (/^_ga($|_)/.test(name) || name === '_gid' || /^_gat/.test(name)) names.push(name);
        }
        if (names.length === 0) return;
        var parts = String(window.location.hostname || '').split('.');
        var domains = [''];
        for (var j = 0; j < parts.length - 1; j++) domains.push('; domain=.' + parts.slice(j).join('.'));
        for (var n = 0; n < names.length; n++) {
            for (var d = 0; d < domains.length; d++) {
                document.cookie = names[n] + '=; Max-Age=0; path=/' + domains[d];
            }
        }
    }

    function stopGoogleAnalytics(id) {
        window['ga-disable-' + id] = true;
        if (gaLoaded && typeof window.gtag === 'function') {
            window.gtag('consent', 'update', { analytics_storage: DENIED });
        }
        deleteAnalyticsCookies();
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    // Classes that already exist in css/tailwind.css (consent-test.mjs checks every one).
    var BUTTON_CLASS = 'flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-800 transition';

    function closeBanner() {
        var banner = document.getElementById('cookie-banner');
        if (banner && banner.parentNode) banner.parentNode.removeChild(banner);
        if (returnFocusTo && typeof returnFocusTo.focus === 'function') returnFocusTo.focus();
        returnFocusTo = null;
    }

    function choose(choice) {
        writeChoice(choice);
        closeBanner();
        if (choice === GRANTED) loadGoogleAnalytics(measurementId);
        else stopGoogleAnalytics(measurementId);
    }

    function showBanner(focusIt) {
        if (document.getElementById('cookie-banner')) return;
        var banner = el('div', 'fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[100]');
        banner.id = 'cookie-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-labelledby', 'cookie-banner-heading');
        var card = el('div', 'bg-white rounded-2xl shadow-2xl border border-slate-200 p-6');
        var heading = el('h2', 'font-bold text-slate-900 mb-2', 'Cookies on ' + SITE_NAME);
        heading.id = 'cookie-banner-heading';
        card.appendChild(heading);
        var text = el('p', 'text-sm text-slate-500 mb-4',
            'We’d like to use Google Analytics cookies to understand how people use this website, so we can improve it. ' +
            'They are optional: we only set them if you accept. ');
        var link = el('a', 'text-brand-600 hover:underline', 'Read our Cookie Policy');
        link.setAttribute('href', POLICY_HREF);
        text.appendChild(link);
        card.appendChild(text);
        var actions = el('div', 'flex flex-col sm:flex-row gap-3');
        var accept = el('button', BUTTON_CLASS, 'Accept analytics cookies');
        accept.setAttribute('type', 'button');
        accept.id = 'cookie-accept';
        accept.addEventListener('click', function () { choose(GRANTED); });
        var reject = el('button', BUTTON_CLASS, 'Reject analytics cookies');
        reject.setAttribute('type', 'button');
        reject.id = 'cookie-reject';
        reject.addEventListener('click', function () { choose(DENIED); });
        actions.appendChild(accept);
        actions.appendChild(reject);
        card.appendChild(actions);
        banner.appendChild(card);
        document.body.appendChild(banner);
        if (focusIt && typeof accept.focus === 'function') accept.focus();
    }

    function addFooterSettingsButton() {
        if (document.getElementById('cookie-settings-link')) return;
        var footers = document.getElementsByTagName('footer');
        if (!footers || footers.length === 0) return;
        var links = footers[0].getElementsByTagName('a');
        for (var i = 0; i < links.length; i++) {
            if (links[i].getAttribute('href') !== POLICY_HREF) continue;
            var item = links[i].parentNode;
            if (!item || !item.parentNode) return;
            var li = el('li', '');
            var button = el('button', 'hover:text-brand-600 text-left', 'Cookie settings');
            button.setAttribute('type', 'button');
            button.id = 'cookie-settings-link';
            button.addEventListener('click', function () {
                closeBanner();
                returnFocusTo = button;
                showBanner(true);
            });
            li.appendChild(button);
            item.parentNode.insertBefore(li, item.nextSibling);
            return;
        }
    }

    function start(rawId) {
        measurementId = normaliseId(rawId);
        document.documentElement.setAttribute('data-analytics-consent-settled', measurementId ? 'configured' : 'off');
        if (!measurementId) return;
        forgetLegacyChoice();
        addFooterSettingsButton();
        var choice = readChoice();
        if (choice === GRANTED) loadGoogleAnalytics(measurementId);
        else if (choice === DENIED) stopGoogleAnalytics(measurementId);
        else showBanner(false);
    }

    start(window.siteGa4MeasurementId);
})();
