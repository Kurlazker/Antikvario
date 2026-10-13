// ============================================
// КОРЗИНА С СИНХРОНИЗАЦИЕЙ НА СЕРВЕР
// ============================================

const CART_KEY = 'antique_cart';
let currentCart = {};

// ============================================
// ЗАГРУЗКА КОРЗИНЫ (всегда через API если авторизован)
// ============================================
function loadCart() {
    console.log('🛒 Загрузка корзины');
    console.log('   Авторизован:', window.IS_LOGGED_IN);
    
    if (window.IS_LOGGED_IN) {
        // АВТОРИЗОВАННЫЙ: загружаем с сервера через API
        fetch('/api/cart')
            .then(r => r.json())
            .then(data => {
                currentCart = data.cart || {};
                console.log('   ✅ Данные с сервера:', currentCart);
                localStorage.setItem(CART_KEY, JSON.stringify(currentCart));
                renderCart();
                updateCartBadge();
            })
            .catch(err => {
                console.log('   ❌ Ошибка загрузки:', err);
                currentCart = {};
                renderCart();
                updateCartBadge();
            });
    } else {
        // ГОСТЬ: используем localStorage
        const local = localStorage.getItem(CART_KEY);
        currentCart = local ? JSON.parse(local) : {};
        console.log('   📦 Из localStorage:', currentCart);
        renderCart();
        updateCartBadge();
    }
}

// ============================================
// СОХРАНЕНИЕ КОРЗИНЫ
// ============================================
function saveCart() {
    console.log(' Сохранение корзины:', currentCart);
    
    // Всегда в localStorage
    localStorage.setItem(CART_KEY, JSON.stringify(currentCart));
    
    // Если авторизован — на сервер
    if (window.IS_LOGGED_IN) {
        fetch('/api/cart/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cart: currentCart })
        })
        .then(r => r.json())
        .then(data => console.log('   ✅ Сервер:', data))
        .catch(err => console.log('   ❌ Ошибка:', err));
    }
    
    updateCartBadge();
}

// ============================================
// ДОБАВЛЕНИЕ ТОВАРА
// ============================================
window.addToCart = function(productId) {
    const id = String(productId);
    
    if (currentCart[id]) {
        currentCart[id].quantity += 1;
    } else {
        currentCart[id] = { quantity: 1 };
    }
    
    saveCart();
    
    if (document.getElementById('cartItems')) {
        renderCart();
    }
    
    showToast('✅ Товар добавлен в корзину', 'success');
};

// ============================================
// УДАЛЕНИЕ ТОВАРА
// ============================================
window.removeFromCart = function(productId) {
    const id = String(productId);
    delete currentCart[id];
    saveCart();
    renderCart();
    showToast('🗑 Товар удалён из корзины', 'success');
};

// ============================================
// ИЗМЕНЕНИЕ КОЛИЧЕСТВА
// ============================================
window.changeQuantity = function(productId, delta) {
    const id = String(productId);
    if (!currentCart[id]) return;
    
    currentCart[id].quantity += delta;
    
    if (currentCart[id].quantity <= 0) {
        delete currentCart[id];
    }
    
    saveCart();
    renderCart();
};

// ============================================
// ОБНОВЛЕНИЕ БЕЙДЖА
// ============================================
function updateCartBadge() {
    const count = Object.values(currentCart).reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCount');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// ============================================
// ОТРИСОВКА КОРЗИНЫ
// ============================================
function renderCart() {
    const cartItemsEl = document.getElementById('cartItems');
    const emptyCartEl = document.getElementById('emptyCart');
    const totalItemsEl = document.getElementById('totalItems');
    const totalPriceEl = document.getElementById('totalPrice');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const cartSummaryEl = document.querySelector('.cart-summary');
    
    if (!cartItemsEl) return;
    
    const productIds = Object.keys(currentCart);
    
    if (productIds.length === 0) {
        cartItemsEl.innerHTML = '';
        cartItemsEl.style.display = 'none';
        if (cartSummaryEl) cartSummaryEl.style.display = 'none';
        if (emptyCartEl) emptyCartEl.style.display = 'block';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
    }
    
    cartItemsEl.style.display = 'block';
    if (cartSummaryEl) cartSummaryEl.style.display = 'block';
    if (emptyCartEl) emptyCartEl.style.display = 'none';
    if (checkoutBtn) checkoutBtn.disabled = false;
    
    let totalItems = 0;
    let totalPrice = 0;
    
    Promise.all(productIds.map(id => 
        fetch(`/get_product/${id}`).then(r => r.json())
    )).then(products => {
        let html = '';
        
        products.forEach((product, index) => {
            if (product.error) return;
            
            const productId = productIds[index];
            const quantity = currentCart[productId].quantity;
            const itemTotal = product.price * quantity;
            
            totalItems += quantity;
            totalPrice += itemTotal;
            
            html += `
                <div class="cart-item">
                    <img src="${product.image}" alt="${product.name}" class="cart-item__image">
                    <div class="cart-item__info">
                        <h3 class="cart-item__title">${product.name}</h3>
                        <p class="cart-item__category">${product.category}</p>
                        <p class="cart-item__price">${product.price.toLocaleString()} Br × ${quantity} = <strong>${itemTotal.toLocaleString()} Br</strong></p>
                    </div>
                    <div class="cart-item__controls">
                        <button class="quantity-btn" onclick="changeQuantity(${productId}, -1)">−</button>
                        <span class="quantity-value">${quantity}</span>
                        <button class="quantity-btn" onclick="changeQuantity(${productId}, 1)">+</button>
                        <button class="remove-btn" onclick="removeFromCart(${productId})">Удалить</button>
                    </div>
                </div>
            `;
        });
        
        cartItemsEl.innerHTML = html;
        
        if (totalItemsEl) totalItemsEl.textContent = totalItems;
        if (totalPriceEl) totalPriceEl.textContent = totalPrice.toLocaleString() + ' Br';
        
        cartItemsEl.dataset.total = totalPrice;
    });
}

// ============================================
// ОФОРМЛЕНИЕ ЗАКАЗА
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    
    const checkoutBtn = document.getElementById('checkoutBtn');
    const checkoutForm = document.getElementById('checkoutForm');
    const cancelCheckout = document.getElementById('cancelCheckout');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (!window.IS_LOGGED_IN) {
                showToast('⚠️ Войдите в аккаунт для оформления заказа', 'error');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
                return;
            }
            
            checkoutForm.style.display = 'block';
            checkoutBtn.style.display = 'none';
            
            const cartDataInput = document.getElementById('cartDataInput');
            const totalInput = document.getElementById('totalInput');
            
           if (cartDataInput) {
    const items = Object.keys(currentCart).map(id => {
        return `${id}:${currentCart[id].quantity}`;
    });
    cartDataInput.value = JSON.stringify(items);
}
            
            if (totalInput) {
                const total = document.getElementById('cartItems').dataset.total || 0;
                totalInput.value = total;
            }
        });
    }
    
    if (cancelCheckout) {
        cancelCheckout.addEventListener('click', function() {
            checkoutForm.style.display = 'none';
            checkoutBtn.style.display = 'block';
        });
    }
});