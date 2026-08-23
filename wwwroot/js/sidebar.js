/*
 * Left sidebar toggle.
 *
 * Desktop: the toggle collapses the sidebar to an icon rail.
 * Phone (<=768px): the sidebar is off-canvas, so the same button opens and
 * closes it as a drawer over the content, with a backdrop.
 *
 * Both states are classes on the shell, so the CSS decides the appearance
 * at each width rather than JS measuring and setting styles.
 */
(function () {
    'use strict';

    var STORAGE_KEY = 'kuleni.sidebar.collapsed';
    var MOBILE_QUERY = '(max-width: 768px)';

    document.addEventListener('DOMContentLoaded', function () {
        var shell = document.getElementById('appShell');
        var toggle = document.getElementById('sidebarToggle');
        var sidebar = document.getElementById('appSidebar');
        if (!shell || !toggle) return;

        var isMobile = function () { return window.matchMedia(MOBILE_QUERY).matches; };

        var backdrop = document.createElement('div');
        backdrop.className = 'app-backdrop';
        backdrop.hidden = true;
        document.body.appendChild(backdrop);

        function setDrawer(open) {
            shell.classList.toggle('is-open', open);
            backdrop.hidden = !open;
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        }

        function setCollapsed(collapsed) {
            shell.classList.toggle('is-collapsed', collapsed);
            toggle.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
        }

        // Restore the desktop preference only; the drawer always starts closed
        // so a phone never loads with the menu covering the page.
        var stored = null;
        try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* private mode */ }
        if (stored === 'true' && !isMobile()) setCollapsed(true);

        toggle.addEventListener('click', function () {
            if (isMobile()) {
                setDrawer(!shell.classList.contains('is-open'));
                return;
            }
            var collapsed = !shell.classList.contains('is-collapsed');
            setCollapsed(collapsed);
            try { localStorage.setItem(STORAGE_KEY, collapsed ? 'true' : 'false'); } catch (e) { /* ignore */ }
        });

        backdrop.addEventListener('click', function () { setDrawer(false); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && shell.classList.contains('is-open')) setDrawer(false);
        });

        // Following a link should not leave the drawer covering the new page.
        if (sidebar) {
            sidebar.addEventListener('click', function (e) {
                if (isMobile() && e.target.closest('a')) setDrawer(false);
            });
        }

        // Crossing the breakpoint must not strand the drawer open.
        window.matchMedia(MOBILE_QUERY).addEventListener('change', function () {
            setDrawer(false);
        });
    });
})();
