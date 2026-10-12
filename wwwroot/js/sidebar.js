/*
 * Left sidebar toggle.
 *
 * Desktop: the toggle collapses the sidebar to an icon rail.
 * Phone (<=768px): the sidebar is off-canvas, so the same button opens and
 * closes it as a drawer over the content, with a backdrop.
 *
 * Both states are classes on the shell, so the CSS decides the appearance
 * at each width rather than JS measuring and setting styles.
 *
 * Differs from the loan application's in one respect, as live-validation.js
 * does: Blazor replaces the page it prerendered with the live one once the
 * circuit is up, so a listener bound to the button when the document loaded
 * is left on a button nobody can see, and the menu never opened at any width.
 * Clicks are caught at the document instead and the shell is looked up when
 * it is needed, and the stored preference is put back on whichever shell is
 * the one showing.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'kuleni.sidebar.collapsed';
    var MOBILE_QUERY = '(max-width: 768px)';

    var isMobile = function () { return window.matchMedia(MOBILE_QUERY).matches; };
    var shell = function () { return document.getElementById('appShell'); };
    var toggle = function () { return document.getElementById('sidebarToggle'); };

    // On the body, which Blazor does not render, so it is never replaced.
    var backdrop = null;
    function getBackdrop() {
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.className = 'app-backdrop';
            backdrop.hidden = true;
            backdrop.addEventListener('click', function () { setDrawer(false); });
            document.body.appendChild(backdrop);
        }
        return backdrop;
    }

    function setDrawer(open) {
        var s = shell(), t = toggle();
        if (s) s.classList.toggle('is-open', open);
        getBackdrop().hidden = !open;
        if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function setCollapsed(collapsed) {
        var s = shell(), t = toggle();
        if (s) s.classList.toggle('is-collapsed', collapsed);
        if (t) t.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    }

    // Restore the desktop preference only; the drawer always starts closed
    // so a phone never loads with the menu covering the page. Once for each
    // shell — the prerendered one, then the live one that takes its place.
    function restore() {
        var s = shell();
        if (!s || s.hasAttribute('data-sidebar-ready')) return;
        s.setAttribute('data-sidebar-ready', '');

        var stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
        if (stored === 'true' && !isMobile()) setCollapsed(true);
    }

    document.addEventListener('click', function (e) {
        if (!(e.target instanceof Element)) return;

        if (e.target.closest('#sidebarToggle')) {
            var s = shell();
            if (!s) return;
            if (isMobile()) {
                setDrawer(!s.classList.contains('is-open'));
                return;
            }
            var collapsed = !s.classList.contains('is-collapsed');
            setCollapsed(collapsed);
            try { localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false'); } catch (e2) { /* ignore */ }
            return;
        }

        // Following a link should not leave the drawer covering the new page.
        if (isMobile() && e.target.closest('#appSidebar a')) setDrawer(false);
    });

    document.addEventListener('keydown', function (e) {
        var s = shell();
        if (e.key === 'Escape' && s && s.classList.contains('is-open')) setDrawer(false);
    });

    // Crossing the breakpoint must not strand the drawer open.
    window.matchMedia(MOBILE_QUERY).addEventListener('change', function () {
        setDrawer(false);
    });

    document.addEventListener('DOMContentLoaded', function () {
        restore();
        new MutationObserver(restore).observe(document.body, { childList: true, subtree: true });
    });
})();
