// ============================================
// ГЛАВНЫЙ СКРИПТ САЙТА "АНТИКВАР"
// ============================================

'use strict';

// ============================================
// 1. ШАПКА И ТИТУЛЬНИК ВСЕГДА ВИДИМЫ
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const forceHeader = function() {
        if (document.body.classList.contains('modal-open')) return; // не мешаем модалкам прятать шапку
        const header = document.querySelector('.header');
        if (!header) return;
        header.style.opacity = '1';
        header.style.visibility = 'visible';
        header.style.transform = 'none';
        header.style.display = 'block';
    };
    forceHeader();
    setInterval(forceHeader, 500); // страховка от любых попыток скрыть шапку

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.opacity = '1';
        hero.style.visibility = 'visible';
    }
});
// ============================================
// 2. УВЕДОМЛЕНИЯ (TOAST)
// ============================================
window.showToast = function(message, type = 'success') {
    console.log(' Toast:', message, type);
    
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        font-weight: 600;
        z-index: 100001;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        animation: toastSlideIn 0.3s ease;
        max-width: 350px;
        ${type === 'success' ? 'background: #27ae60;' : 'background: #e74c3c;'}
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes toastSlideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(toastStyle);

// ============================================
// 3. АНИМАЦИЯ ПЕРЕНОСА В КОРЗИНУ/ИЗБРАННОЕ
// ============================================
window.animateToIcon = function(sourceElement, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
        console.log('️ Цель анимации не найдена:', targetSelector);
        return;
    }
    
    const sourceRect = sourceElement.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    
    const flyingImg = document.createElement('div');
    flyingImg.style.cssText = `
        position: fixed;
        left: ${sourceRect.left + sourceRect.width / 2}px;
        top: ${sourceRect.top + sourceRect.height / 2}px;
        width: 50px;
        height: 50px;
        background: ${targetSelector.includes('cart') ? '#C9A961' : '#e74c3c'};
        border-radius: 50%;
        z-index: 100000;
        pointer-events: none;
        transition: all 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(flyingImg);
    
    setTimeout(() => {
        flyingImg.style.left = `${targetRect.left + targetRect.width / 2 - 25}px`;
        flyingImg.style.top = `${targetRect.top + targetRect.height / 2 - 25}px`;
        flyingImg.style.transform = 'scale(0.3) rotate(360deg)';
        flyingImg.style.opacity = '0.5';
    }, 50);
    
    setTimeout(() => {
        flyingImg.remove();
        target.style.transform = 'scale(1.3)';
        setTimeout(() => { target.style.transform = 'scale(1)'; }, 200);
    }, 850);
};

window.showProductDetails = function(productId) {
    fetch('/get_product/' + productId)
        .then(r => r.json())
        .then(product => {
            if (product.error) { showToast('Товар не найден', 'error'); return; }
            const oldModal = document.querySelector('.product-modal');
            if (oldModal) oldModal.remove();

            const images = (product.images && product.images.length) ? product.images : [product.image];
            let currentImg = 0;
            images.forEach(src => { const pre = new Image(); pre.src = src; });

            const modal = document.createElement('div');
            modal.className = 'product-modal';
            modal.innerHTML = `
                <div class="product-modal__overlay"></div>
                <div class="product-modal__content">
                    <button class="product-modal__close">✕</button>
                    <div class="product-modal__gallery">
                        <img src="${images[0]}" alt="${product.name}" class="product-modal__image">
                        ${images.length > 1 ? `
                            <button class="modal-gallery__btn modal-gallery__btn--prev">❮</button>
                            <button class="modal-gallery__btn modal-gallery__btn--next">❯</button>
                            <span class="modal-gallery__counter">1 / ${images.length}</span>
                        ` : ''}
                    </div>
                    <div class="product-modal__info">
                        <h2>${product.name}</h2>
                        <p class="product-modal__category">${product.category}</p>
                        <p class="product-modal__description">${product.description}</p>
                        <p class="product-modal__price">${product.price.toLocaleString()} Br</p>
                        <div class="product-modal__actions">
                            <button class="product-modal__add-btn" data-product-id="${product.id}">🛒 В корзину</button>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
            setTimeout(() => modal.classList.add('active'), 10);
            document.body.classList.add('modal-open');

            const mainImg = modal.querySelector('.product-modal__image');
            const counter = modal.querySelector('.modal-gallery__counter');
            const switchImage = function(delta) {
                currentImg = (currentImg + delta + images.length) % images.length;
                mainImg.style.opacity = '0';
                setTimeout(() => {
                    mainImg.src = images[currentImg];
                    mainImg.style.opacity = '1';
                    if (counter) counter.textContent = (currentImg + 1) + ' / ' + images.length;
                }, 200);
            };
            const prevBtn = modal.querySelector('.modal-gallery__btn--prev');
            const nextBtn = modal.querySelector('.modal-gallery__btn--next');
            if (prevBtn) prevBtn.addEventListener('click', () => switchImage(-1));
            if (nextBtn) nextBtn.addEventListener('click', () => switchImage(1));

            const closeModal = function() {
                modal.remove();
                document.body.classList.remove('modal-open');
            };
            modal.querySelector('.product-modal__overlay').addEventListener('click', closeModal);
            modal.querySelector('.product-modal__close').addEventListener('click', closeModal);

            modal.querySelector('.product-modal__add-btn').addEventListener('click', function() {
                const id = this.getAttribute('data-product-id');
                if (typeof window.addToCart === 'function') {
                    window.addToCart(parseInt(id));
                    const card = document.querySelector(`.product-card[data-id="${id}"]`);
                    if (card) animateToIcon(card, '.nav__icon-link[href="/cart"]');
                }
                showToast('✅ Товар добавлен в корзину', 'success');
                closeModal();
            });

            const escHandler = function(e) {
                if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
            };
            document.addEventListener('keydown', escHandler);
        })
        .catch(err => {
            console.error('Ошибка загрузки товара:', err);
            showToast('Не удалось загрузить информацию о товаре', 'error');
        });
};

window.showImageZoom = function(images, startIndex) {
    if (!Array.isArray(images)) images = [images];
    images = images.filter(Boolean);
    if (!images.length) return;
    let currentImg = Math.min(startIndex || 0, images.length - 1);
    images.forEach(src => { const pre = new Image(); pre.src = src; });

    const oldModal = document.querySelector('.image-zoom-modal');
    if (oldModal) oldModal.remove();
    const modal = document.createElement('div');
    modal.className = 'image-zoom-modal';
    modal.innerHTML = `
        <div class="image-zoom-modal__overlay"></div>
        <div class="image-zoom-modal__content">
            <button class="image-zoom-modal__close">✕</button>
            <img src="${images[currentImg]}" alt="Увеличенное изображение">
            ${images.length > 1 ? `
                <button class="modal-gallery__btn modal-gallery__btn--prev">❮</button>
                <button class="modal-gallery__btn modal-gallery__btn--next">❯</button>
                <span class="modal-gallery__counter">${currentImg + 1} / ${images.length}</span>
            ` : ''}
        </div>
    `;
    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);
    document.body.classList.add('modal-open');

    const img = modal.querySelector('.image-zoom-modal__content > img');
    const counter = modal.querySelector('.modal-gallery__counter');
    const switchImage = function(delta) {
        currentImg = (currentImg + delta + images.length) % images.length;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = images[currentImg];
            img.style.opacity = '1';
            if (counter) counter.textContent = (currentImg + 1) + ' / ' + images.length;
        }, 200);
    };
    const prevBtn = modal.querySelector('.modal-gallery__btn--prev');
    const nextBtn = modal.querySelector('.modal-gallery__btn--next');
    if (prevBtn) prevBtn.addEventListener('click', () => switchImage(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => switchImage(1));

    const closeModal = function() {
        modal.remove();
        document.body.classList.remove('modal-open');
    };
    modal.querySelector('.image-zoom-modal__overlay').addEventListener('click', closeModal);
    modal.querySelector('.image-zoom-modal__close').addEventListener('click', closeModal);
    const escHandler = function(e) {
        if (e.key === 'Escape') { closeModal(); document.removeEventListener('keydown', escHandler); }
    };
    document.addEventListener('keydown', escHandler);
};
// ============================================
// 6. ДЕЛЕГИРОВАНИЕ СОБЫТИЙ
// ============================================
document.addEventListener('click', function(e) {
    // Кнопка "Подробнее"
    const detailsBtn = e.target.closest('.product-card__button--details');
    if (detailsBtn) {
        e.preventDefault();
        e.stopPropagation();
        const productId = detailsBtn.getAttribute('data-id') || 
                         detailsBtn.closest('.product-card').getAttribute('data-id');
        console.log(' Клик по "Подробнее", ID:', productId);
        if (productId) {
            showProductDetails(parseInt(productId));
        }
        return;
    }
    
       // Иконка Zoom (лупа)
    const zoomIcon = e.target.closest('.zoom-icon');
    if (zoomIcon) {
        e.preventDefault();
        e.stopPropagation();
        const wrap = zoomIcon.closest('.product-card__image');
        const img = wrap.querySelector('img');
        const list = (wrap.dataset.images || '').split(',').map(s => s.trim()).filter(Boolean);
        const images = list.length ? list : [img.getAttribute('data-full') || img.src];
        const start = images.findIndex(u => img.src.endsWith(u));
        showImageZoom(images, start >= 0 ? start : 0);
        return;
    }
    // Клик по изображению товара
    const productImage = e.target.closest('.product-image');
    if (productImage && !e.target.closest('.favorite-btn')) {
        e.preventDefault();
        const wrap = productImage.closest('.product-card__image') || productImage.parentElement;
        const list = ((wrap.dataset && wrap.dataset.images) || '').split(',').map(s => s.trim()).filter(Boolean);
        const images = list.length ? list : [productImage.getAttribute('data-full') || productImage.src];
        const start = images.findIndex(u => productImage.src.endsWith(u));
        showImageZoom(images, start >= 0 ? start : 0);
        return;
    }
});

// ============================================
// 7. ПЛАВНАЯ ПРОКРУТКА
// ============================================
document.addEventListener('click', function(e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
        const targetId = anchor.getAttribute('href').substring(1);
        const target = document.getElementById(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});

// ============================================
// 8. АНИМАЦИЯ ПОЯВЛЕНИЯ КАРТОЧЕК "О НАС"
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏛️ Скрипт Антиквар загружен');
    
    // Проверка наличия элементов на странице
    const detailsBtns = document.querySelectorAll('.product-card__button--details');
    const zoomIcons = document.querySelectorAll('.zoom-icon');
    const productImages = document.querySelectorAll('.product-image');
    
    console.log('📊 Найдено элементов:');
    console.log('   - Кнопок "Подробнее":', detailsBtns.length);
    console.log('   - Иконок Zoom:', zoomIcons.length);
    console.log('   - Изображений товаров:', productImages.length);
    
    // Анимация карточек "О нас" при скролле
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 150);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.fade-in').forEach(el => {
        observer.observe(el);
    });
});

// ============================================
// 9. ГАЛЕРЕЯ ПРИ НАВЕДЕНИИ В КАТАЛОГЕ
// ============================================
function getCardImages(card) {
    const wrap = card.querySelector('.product-card__image');
    if (!wrap) return [];
    return (wrap.dataset.images || '').split(',').map(s => s.trim()).filter(Boolean);
}
function startHoverGallery(card) {
    const images = getCardImages(card);
    if (images.length < 2 || card._galleryTimer) return;
    const img = card.querySelector('.product-card__image img');
    if (!img) return;
    images.forEach(src => { const pre = new Image(); pre.src = src; });
    let idx = 0;
    card._galleryTimer = setInterval(() => {
        idx = (idx + 1) % images.length;
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = images[idx];
            img.style.opacity = '1';
        }, 400);
    }, 2000);
}
function stopHoverGallery(card) {
    if (!card._galleryTimer) return;
    clearInterval(card._galleryTimer);
    card._galleryTimer = null;
    const images = getCardImages(card);
    const img = card.querySelector('.product-card__image img');
    if (img && images.length) {
        img.style.opacity = '0';
        setTimeout(() => {
            img.src = images[0];
            img.style.opacity = '1';
        }, 400);
    }
}
document.addEventListener('mouseover', function(e) {
    const card = e.target.closest('.product-card');
    if (card) startHoverGallery(card);
});
document.addEventListener('mouseout', function(e) {
    const card = e.target.closest('.product-card');
    if (card && !card.contains(e.relatedTarget)) stopHoverGallery(card);
});

// ============================================
// 9. БУРГЕР-МЕНЮ (ТЕЛЕФОНЫ И ПЛАНШЕТЫ)
// ============================================
(function () {
    const BREAKPOINT = 992;

    function initBurger() {
        const header = document.querySelector('.header');
        const nav = document.querySelector('.header__nav');
        const content = header && header.querySelector('.header__content');
        if (!header || !nav || !content) return;
        if (document.querySelector('.burger')) return;

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

        nav.querySelectorAll('.nav__link:not(.nav__icon-link)').forEach(link => {
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