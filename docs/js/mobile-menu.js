// ============================================
// БУРГЕР-МЕНЮ (ТЕЛЕФОНЫ И ПЛАНШЕТЫ)
// Создаётся автоматически на всех страницах
// ============================================
(function () {
    const BREAKPOINT = 992;

    function initBurger() {
        const header = document.querySelector('.header');
        const nav = document.querySelector('.header__nav');
        const content = header && header.querySelector('.header__content');
        if (!header || !nav || !content) return;
        if (document.querySelector('.burger')) return; // уже создано

        // ---------- Кнопка-бургер ----------
        const burger = document.createElement('button');
        burger.className = 'burger';
        burger.setAttribute('aria-label', 'Открыть меню');
        burger.innerHTML = '<span></span><span></span><span></span>';
        content.appendChild(burger);

        // ---------- Затемнение и выезжающая панель ----------
        const overlay = document.createElement('div');
        overlay.className = 'burger-overlay';

        const menu = document.createElement('nav');
        menu.className = 'mobile-menu';
        menu.innerHTML = '<button class="mobile-menu__close" aria-label="Закрыть меню">✕</button>';

        // Клонируем текстовые ссылки и кнопки входа/выхода
        // (иконки корзины/избранного остаются в шапке — без дублей id)
        nav.querySelectorAll('.nav__link:not(.nav__icon-link)').forEach(link => {
            const clone = link.cloneNode(true);
            clone.classList.add('mobile-menu__link');
            menu.appendChild(clone);
        });

        document.body.appendChild(overlay);
        document.body.appendChild(menu);

        // ---------- Открытие / закрытие ----------
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
            if (e.target.closest('a')) close(); // закрытие при переходе по ссылке
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