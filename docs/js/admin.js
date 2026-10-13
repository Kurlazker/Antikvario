// ============================================
// АДМИН-ПАНЕЛЬ: INLINE-РЕДАКТИРОВАНИЕ
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Для каждой строки таблицы настраиваем кнопки
    document.querySelectorAll('.product-row').forEach(row => {
        const editBtn = row.querySelector('.edit-trigger-btn');
        const saveBtn = row.querySelector('.save-btn');
        const cancelBtn = row.querySelector('.cancel-btn');
        const productId = row.getAttribute('data-product-id');

        // Кнопка "Редактировать" — включаем режим редактирования
        editBtn.addEventListener('click', function() {
            enableEditMode(row);
        });

        // Кнопка "Сохранить" — отправляем данные на сервер
        saveBtn.addEventListener('click', function() {
            saveProduct(row, productId);
        });

        // Кнопка "Отмена" — возвращаем как было
        cancelBtn.addEventListener('click', function() {
            disableEditMode(row);
        });
    });

    // Включить режим редактирования
    function enableEditMode(row) {
        // Скрываем ячейки просмотра, показываем ячейки редактирования
        row.querySelectorAll('.cell-view').forEach(cell => cell.style.display = 'none');
        row.querySelectorAll('.cell-edit').forEach(cell => cell.style.display = 'table-cell');
        
        // Меняем кнопки
        row.querySelector('.edit-trigger-btn').style.display = 'none';
        row.querySelector('.save-btn').style.display = 'inline-block';
        row.querySelector('.cancel-btn').style.display = 'inline-block';
        
        // Подсвечиваем строку
        row.classList.add('editing');
        
        // Фокус на первое поле
        const firstInput = row.querySelector('.edit-name');
        if (firstInput) firstInput.focus();
    }

    // Выключить режим редактирования (без сохранения)
    function disableEditMode(row) {
        row.querySelectorAll('.cell-view').forEach(cell => cell.style.display = '');
        row.querySelectorAll('.cell-edit').forEach(cell => cell.style.display = 'none');
        
        row.querySelector('.edit-trigger-btn').style.display = 'inline-block';
        row.querySelector('.save-btn').style.display = 'none';
        row.querySelector('.cancel-btn').style.display = 'none';
        
        row.classList.remove('editing');
    }

    // Сохранить изменения
    function saveProduct(row, productId) {
        const name = row.querySelector('.edit-name').value.trim();
        const category = row.querySelector('.edit-category').value;
        const price = row.querySelector('.edit-price').value;
        const badge = row.querySelector('.edit-badge').value.trim();

        // Проверка
        if (!name) {
            showToast('️ Введите название товара', 'error');
            return;
        }
        if (!price || price < 0) {
            showToast('⚠️ Введите корректную цену', 'error');
            return;
        }

        // Отправляем на сервер
        fetch('/update_product/' + productId, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name,
                category: category,
                price: parseInt(price),
                badge: badge
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Обновляем ячейки просмотра новыми значениями
                const viewCells = row.querySelectorAll('.cell-view');
                
                // Название (индекс 2 — третья ячейка, после ID и фото)
                viewCells[2].textContent = name;
                
                // Категория (индекс 3)
                viewCells[3].textContent = category;
                
                // Цена (индекс 4)
                viewCells[4].innerHTML = '<strong style="color: #C9A961;">' + parseInt(price).toLocaleString() + ' Br</strong>';
                
                // Бейдж (индекс 5)
                if (badge) {
                    viewCells[5].innerHTML = '<span class="badge-display">' + badge + '</span>';
                } else {
                    viewCells[5].innerHTML = '<span style="color: #999;">—</span>';
                }

                // Выключаем режим редактирования
                disableEditMode(row);
                showToast('✅ Товар обновлён', 'success');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showToast(' Ошибка при сохранении', 'error');
        });
    }
});

// ============================================
// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ: УВЕДОМЛЕНИЯ
// ============================================
function showToast(message, type = '') {
    // Удаляем старые уведомления
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast' + (type ? ' toast--' + type : '');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}