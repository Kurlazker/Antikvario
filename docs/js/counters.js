// ============================================
// СЧЁТЧИКИ + ЗАЩИТА ДАННЫХ + БУРГЕР-МЕНЮ
// (работает на ВСЕХ страницах)
// ============================================

// --------------------------------------------
// 1. БУРГЕР-МЕНЮ (создаётся автоматически)
// --------------------------------------------
(function () {
    const BREAKPOINT = 992;

    function initBurger() {
        const header = document.querySelector('.header');
        if (!header || document.querySelector('.burger')) return;
        const content = header.querySelector('.header__content') || header;

        const burger = document.createElement('button');
        burger.className = 'burger';
        burger.setAttribute('aria-label', 'Открыть меню');
        burger.innerHTML = '<span></span><span></span><span></span>';
        content.appendChild(burger);

        const overlay = document.createElement('div');
        overlay.className = 'burger-overlay';

        const menu = document.createElement('nav');
        menu.className = 'mobile-menu';
        menu.innerHTML = '<button class="mobile-menu__close" aria-label="Закрыть меню">✕</button>';

        // Ссылки из .header__nav, а если её нет — из всей шапки
        let links = Array.from(header.querySelectorAll('.header__nav a'));
        if (!links.length) {
            links = Array.from(header.querySelectorAll('a'));
        }
        links = links.filter(a =>
            !a.classList.contains('header__logo') &&
            !a.classList.contains('nav__icon-link') &&
            !a.querySelector('.header-icon') &&
            !a.querySelector('.logo__text')
        );
        links.forEach(link => {
            const clone = link.cloneNode(true);
            clone.classList.add('mobile-menu__link');
            menu.appendChild(clone);
        });

        document.body.appendChild(overlay);
        document.body.appendChild(menu);

        const open = function () {
            document.body.classList.add('burger-open');
            menu.classList.add('active');
            overlay.classList.add('active');
            burger.classList.add('active');
        };
        const close = function () {
            document.body.classList.remove('burger-open');
            menu.classList.remove('active');
            overlay.classList.remove('active');
            burger.classList.remove('active');
        };

        burger.addEventListener('click', function () {
            menu.classList.contains('active') ? close() : open();
        });
        overlay.addEventListener('click', close);
        menu.querySelector('.mobile-menu__close').addEventListener('click', close);
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a')) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });
        window.addEventListener('resize', function () {
            if (window.innerWidth > BREAKPOINT) close();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBurger);
    } else {
        initBurger();
    }
})();

// --------------------------------------------
// 2. СИНХРОНИЗАЦИЯ localStorage С АВТОРИЗАЦИЕЙ
//    (данные аккаунта не остаются после выхода)
// --------------------------------------------
(function syncStorageOnAuth() {
    const OWNER_KEY = 'antique_owner';

    document.addEventListener('click', function (e) {
        if (e.target.closest('a[href="/logout"]')) {
            localStorage.removeItem('antique_cart');
            localStorage.removeItem('antique_favorites');
            localStorage.setItem(OWNER_KEY, 'guest');
        }
    });

    if (typeof window.IS_LOGGED_IN === 'undefined') return;

    if (window.IS_LOGGED_IN) {
        localStorage.setItem(OWNER_KEY, 'logged');
    } else if (localStorage.getItem(OWNER_KEY) === 'logged') {
        localStorage.removeItem('antique_cart');
        localStorage.removeItem('antique_favorites');
        localStorage.setItem(OWNER_KEY, 'guest');
    }
})();

// --------------------------------------------
// 3. СЧЁТЧИКИ КОРЗИНЫ И ИЗБРАННОГО
// --------------------------------------------
function updateCartBadge() {
    const data = localStorage.getItem('antique_cart');
    const cart = data ? JSON.parse(data) : {};
    const count = Object.values(cart).reduce((sum, item) => sum + (item.quantity || 1), 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function updateFavBadge() {
    const data = localStorage.getItem('antique_favorites');
    const favs = data ? JSON.parse(data) : [];
    const count = Array.isArray(favs) ? favs.length : 0;
    const badge = document.getElementById('favCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    updateCartBadge();
    updateFavBadge();
});