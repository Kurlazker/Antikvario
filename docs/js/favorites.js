// ============================================
// ИЗБРАННОЕ С СИНХРОНИЗАЦИЕЙ НА СЕРВЕР
// ============================================

const FAV_KEY = 'antique_favorites';
let currentFavorites = [];

// ============================================
// ЗАГРУЗКА ИЗБРАННОГО (всегда через API если авторизован)
// ============================================
function loadFavorites() {
    console.log('❤️ Загрузка избранного');
    console.log('   Авторизован:', window.IS_LOGGED_IN);
    
    if (window.IS_LOGGED_IN) {
        // АВТОРИЗОВАННЫЙ: загружаем с сервера через API
        fetch('/api/favorites')
            .then(r => r.json())
            .then(data => {
                currentFavorites = data.favorites || [];
                console.log('   ✅ Данные с сервера:', currentFavorites);
                localStorage.setItem(FAV_KEY, JSON.stringify(currentFavorites));
                renderFavorites();
                updateFavBadge();
            })
            .catch(err => {
                console.log('   ❌ Ошибка загрузки:', err);
                currentFavorites = [];
                renderFavorites();
                updateFavBadge();
            });
    } else {
        // ГОСТЬ: используем localStorage
        const local = localStorage.getItem(FAV_KEY);
        currentFavorites = local ? JSON.parse(local) : [];
        console.log('   📦 Из localStorage:', currentFavorites);
        renderFavorites();
        updateFavBadge();
    }
}

// ============================================
// СОХРАНЕНИЕ ИЗБРАННОГО
// ============================================
function saveFavorites() {
    console.log('💾 Сохранение избранного:', currentFavorites);
    
    localStorage.setItem(FAV_KEY, JSON.stringify(currentFavorites));
    
    if (window.IS_LOGGED_IN) {
        fetch('/api/favorites/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ favorites: currentFavorites })
        })
        .then(r => r.json())
        .then(data => console.log('   ✅ Сервер:', data))
        .catch(err => console.log('   ❌ Ошибка:', err));
    }
    
    updateFavBadge();
}

// ============================================
// ПЕРЕКЛЮЧЕНИЕ ИЗБРАННОГО
// ============================================
window.toggleFavorite = function(productId, btnElement) {
    const id = parseInt(productId);
    const index = currentFavorites.indexOf(id);
    
    if (index > -1) {
        currentFavorites.splice(index, 1);
        if (btnElement) {
            btnElement.classList.remove('favorite-btn--active');
            const svg = btnElement.querySelector('svg');
            if (svg) svg.setAttribute('fill', 'none');
        }
        showToast('💔 Удалено из избранного', 'success');
    } else {
        currentFavorites.push(id);
        if (btnElement) {
            btnElement.classList.add('favorite-btn--active');
            const svg = btnElement.querySelector('svg');
            if (svg) svg.setAttribute('fill', 'currentColor');
        }
        showToast('❤️ Добавлено в избранное', 'success');
    }
    
    saveFavorites();
    
    if (document.getElementById('favoritesGrid')) {
        renderFavorites();
    }
};

// ============================================
// ОБНОВЛЕНИЕ БЕЙДЖА
// ============================================
function updateFavBadge() {
    const badge = document.getElementById('favCount');
    if (badge) {
        badge.textContent = currentFavorites.length;
        badge.style.display = currentFavorites.length > 0 ? 'flex' : 'none';
    }
}

// ============================================
// ОТРИСОВКА ИЗБРАННОГО
// ============================================
function renderFavorites() {
    const grid = document.getElementById('favoritesGrid');
    const emptyEl = document.getElementById('emptyFavorites');
    
    if (!grid) return;
    
    if (currentFavorites.length === 0) {
        grid.innerHTML = '';
        grid.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    if (emptyEl) emptyEl.style.display = 'none';
    
    Promise.all(currentFavorites.map(id => 
        fetch(`/get_product/${id}`).then(r => r.json())
    )).then(products => {
        let html = '';
        
        products.forEach(product => {
            if (product.error) return;
            
            const isFav = currentFavorites.includes(product.id);
            
            html += `
                <div class="product-card" data-id="${product.id}">
                    <div class="product-card__image" data-images="${(product.images || []).join(',')}">
                        <img src="${product.image}" alt="${product.name}" class="product-image" data-full="${product.image}">
                        <button class="favorite-btn ${isFav ? 'favorite-btn--active' : ''}" 
                                onclick="toggleFavorite(${product.id}, this)" 
                                title="В избранное">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" 
                                 fill="${isFav ? 'currentColor' : 'none'}" 
                                 stroke="currentColor" stroke-width="2">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </button>
                        <div class="zoom-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                <line x1="11" y1="8" x2="11" y2="14"></line>
                                <line x1="8" y1="11" x2="14" y2="11"></line>
                            </svg>
                        </div>
                    </div>
                    <div class="product-card__content">
                        <h3 class="product-card__title">${product.name}</h3>
                        <p class="product-card__category">${product.category}</p>
                        <p class="product-card__description">${product.description}</p>
                        <div class="product-card__footer">
                            <span class="product-card__price">${product.price} Br</span>
                            <button class="product-card__button product-card__button--cart" onclick="addToCart(${product.id})">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 5px;">
                                    <circle cx="9" cy="21" r="1"></circle>
                                    <circle cx="20" cy="21" r="1"></circle>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                                </svg>
                                В корзину
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    });
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ
// ============================================
document.addEventListener('DOMContentLoaded', loadFavorites);