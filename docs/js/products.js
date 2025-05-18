let allProducts = [];
let isUserInteracting = false; // Флаг для отслеживания взаимодействия пользователя с фильтрами

// Получение параметров из URL
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    country: params.get('country') || '',
    nights: params.get('nights') || '',
    tourists: params.get('tourists') || '',
    maxPrice: params.get('maxPrice') || '',
    hasExcursion: params.get('hasExcursion') || '',
    date: params.get('date') || '',
    discount: parseFloat(params.get('discount')) || 0
  };
}

// Отображение каталога товаров
function renderCatalog(productsList) {
  const container = document.getElementById('catalog-container');
  if (!container) return; 
  const { discount } = getQueryParams();
  let html = '';

  productsList.forEach(product => {
    const imageSrc = product.image || 'images/placeholder.png';
    const excursionText = product.hasExcursion ? '<p class="excursion">Экскурсия</p>' : '';
    const nightsText = product.nights ? `<p class="nights">Ночей: ${product.nights}</p>` : '';
    const touristsText = product.tourists ? `<p class="tourists">Туристы: ${product.tourists}</p>` : '';
    const dateText = product.departureDate ? `<p class="departure-date">Дата вылета: ${product.departureDate}</p>` : '';
    
    const originalPrice = product.price;
    const discountedPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : null;
    const priceHtml = discountedPrice ? 
      `<p class="price"><span class="original-price">${originalPrice}$</span><span class="discounted-price">${discountedPrice}$</span></p>` :
      `<p class="price">${originalPrice}$</p>`;

    html += `
      <div class="product-card" data-id="${product.id}">
        <img src="${imageSrc}" alt="${product.name}" class="product-image">
        <div class="information">
          <h5>${product.name}</h5>
          <p>${product.shortDesc}</p>
          ${excursionText}
          ${nightsText}
          ${touristsText}
          ${dateText}
        </div>
        ${priceHtml}
      </div>
    `;
  });

  container.innerHTML = html;

  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      const product = allProducts.find(p => p.id === id);
      if (product) openModal(product);
    });
  });
}

// Открытие модального окна
function openModal(product) {
  const modalOverlay = document.getElementById('modal-overlay');
  if (!modalOverlay) return; // Пропускаем, если не на странице tours.html
  const { discount } = getQueryParams();
  document.getElementById('modal-title').textContent = product.name;

  const originalPrice = product.price;
  const discountedPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : null;
  const priceText = discountedPrice ? 
    `Цена: <span class="original-price">${originalPrice}$</span><span class="discounted-price">${discountedPrice}$</span>` :
    `Цена: ${originalPrice}$`;
  document.getElementById('modal-price').innerHTML = priceText;

  const modalImage = document.getElementById('modal-image');
  modalImage.src = product.image || 'images/placeholder.png';
  modalImage.alt = product.name;

  const excursionText = product.hasExcursion ? 'Экскурсия' : '';
  const nightsText = product.nights ? `Ночей: ${product.nights}` : '';
  const touristsText = product.tourists ? `Туристы: ${product.tourists}` : '';
  const dateText = product.departureDate ? `Дата вылета: ${product.departureDate}` : '';

  document.getElementById('modal-description').innerHTML = `
    <p class="desc">${product.detailedDesc}</p>
    <p class="excursion">${excursionText}</p>
    <p class="nights">${nightsText}</p>
    <p class="tourists">${touristsText}</p>
    <p class="departure-date">${dateText}</p>
  `;
  document.getElementById('modal-description').style.display='block';

  modalOverlay.classList.add('active');

  const buyButton = document.getElementById('buy-button');
  const purchaseFormContainer = document.getElementById('purchase-form');

  purchaseFormContainer.innerHTML = `
    <h3>Оформление покупки</h3>
    <form id="buyForm" action="https://formspree.io/f/movdewze" method="POST">
      <input type="text" id="fullName" name="fullName" placeholder="ФИО" required>
      <input type="email" id="email" name="email" placeholder="Email" required>
      <input type="hidden" id="tourName" name="tourName" value="${product.name}">
      <input type="hidden" id="tourPrice" name="tourPrice" value="${discountedPrice || originalPrice}$">
      <input type="hidden" id="tourDescription" name="tourDescription" value="${product.departureDate || ''}">
      <input type="text" name="_gotcha" style="display:none">
      <button type="submit">Отправить</button>
    </form>
  `;
  purchaseFormContainer.style.display = 'none';
  buyButton.style.display = 'block';

  buyButton.addEventListener('click', () => {
    buyButton.style.display = 'none';
  document.getElementById('modal-description').style.display='none';
    purchaseFormContainer.style.display = 'block';
  }, { once: true });

  const buyForm = document.getElementById('buyForm');
  buyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Введите корректный email');
      return;
    }
    const formData = new FormData(buyForm);
    try {
      const response = await fetch('https://formspree.io/f/movdewze', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        alert('Заявка успешно отправлена!');
        buyForm.reset();
        modalOverlay.classList.remove('active');
        purchaseFormContainer.style.display = 'none';
        buyButton.style.display = 'block';
      } else {
        alert('Ошибка при отправке заявки. Попробуйте снова.');
      }
    } catch (error) {
      alert('Ошибка сети. Проверьте подключение и попробуйте снова.');
    }
  }, { once: true });
}

// Закрытие модального окна
function closeModal() {
  const modalOverlay = document.getElementById('modal-overlay');
  if (modalOverlay) modalOverlay.classList.remove('active');
}

// Фильтрация и сортировка товаров
function filterProducts() {
  const filterInput = document.getElementById('filterInput');
  if (!filterInput) return; 
  // Получаем значения полей фильтров
  const filterText = filterInput.value.toLowerCase();
  const minPrice = parseFloat(document.getElementById('minPrice').value) || null;
  const maxPrice = parseFloat(document.getElementById('maxPrice').value) || null;
  const nightsFilter = parseInt(document.getElementById('nightsFilter').value) || null;
  const touristsFilter = parseInt(document.getElementById('touristsFilter').value) || null;
  const dateFilter = document.getElementById('dateFilter').value || null;
  const sortValue = document.getElementById('sortSelect').value;
  const excursionFilter = document.getElementById('excursionFilter').checked;

  // Получаем параметры из URL
  const queryParams = getQueryParams();

  let filteredProducts = allProducts.filter(product => {
    let matches = true;

    // Если пользователь взаимодействовал с фильтрами, игнорируем параметры URL
    if (isUserInteracting) {
      // Фильтрация по тексту
      if (filterText && matches) {
        matches =
          product.name.toLowerCase().includes(filterText) ||
          product.shortDesc.toLowerCase().includes(filterText);
      }

      // Фильтрация по цене
      if (matches && minPrice !== null) matches = product.price >= minPrice;
      if (matches && maxPrice !== null) matches = product.price <= maxPrice;

      // Фильтрация по экскурсиям
      if (matches && excursionFilter) matches = product.hasExcursion;

      // Фильтрация по количеству ночей
      if (matches && nightsFilter !== null && product.nights) {
        if (product.nights.includes('-')) {
          const [minNights, maxNights] = product.nights.split('-').map(Number);
          matches = nightsFilter >= minNights && nightsFilter <= maxNights;
        } else {
          matches = nightsFilter === parseInt(product.nights);
        }
      } else if (nightsFilter !== null) {
        matches = false;
      }

      // Фильтрация по количеству туристов
      if (matches && touristsFilter !== null && product.tourists) {
        if (product.tourists.includes('-')) {
          const [minTourists, maxTourists] = product.tourists.split('-').map(Number);
          matches = touristsFilter >= minTourists && touristsFilter <= maxTourists;
        } else {
          matches = touristsFilter === parseInt(product.tourists);
        }
      } else if (touristsFilter !== null) {
        matches = false;
      }

      // Фильтрация по дате
      if (matches && dateFilter !== null && product.departureDate) {
        matches = product.departureDate === dateFilter;
      } else if (dateFilter !== null) {
        matches = false;
      }
    } else {
      // Если пользователь не взаимодействовал, используем параметры из URL
      if (queryParams.country && matches) {
        matches = product.name.toLowerCase().includes(queryParams.country.toLowerCase());
      }
      if (queryParams.nights && matches && product.nights) {
        if (product.nights.includes('-')) {
          const [minNights, maxNights] = product.nights.split('-').map(Number);
          matches = parseInt(queryParams.nights) >= minNights && parseInt(queryParams.nights) <= maxNights;
        } else {
          matches = parseInt(queryParams.nights) === parseInt(product.nights);
        }
      }
      if (queryParams.tourists && matches && product.tourists) {
        if (product.tourists.includes('-')) {
          const [minTourists, maxTourists] = product.tourists.split('-').map(Number);
          matches = parseInt(queryParams.tourists) >= minTourists && parseInt(queryParams.tourists) <= maxTourists;
        } else {
          matches = parseInt(queryParams.tourists) === parseInt(product.tourists);
        }
      }
      if (queryParams.hasExcursion === 'true' && matches) {
        matches = product.hasExcursion;
      }
      if (queryParams.maxPrice && matches) {
        matches = product.price <= parseFloat(queryParams.maxPrice);
      }
      if (queryParams.date && matches && product.departureDate) {
        if (queryParams.date === 'autumn') {
          const productDate = new Date(product.departureDate);
          const autumnStart = new Date('2025-09-01');
          const autumnEnd = new Date('2025-11-30');
          matches = productDate >= autumnStart && productDate <= autumnEnd;
        } else {
          matches = product.departureDate === queryParams.date;
        }
      }
    }

    return matches;
  });

  // Сортировка
  if (sortValue !== 'default') {
    filteredProducts.sort((a, b) => {
      if (sortValue === 'nameAsc') return a.name.localeCompare(b.name);
      if (sortValue === 'nameDesc') return b.name.localeCompare(a.name);
      if (sortValue === 'priceAsc') return a.price - b.price;
      if (sortValue === 'priceDesc') return b.price - a.price;
    });
  }

  renderCatalog(filteredProducts);

  // Обновляем URL при изменении фильтров, если пользователь взаимодействовал
  if (isUserInteracting) {
    const newParams = new URLSearchParams();
    if (filterText) newParams.set('country', filterText);
    if (minPrice !== null) newParams.set('minPrice', minPrice);
    if (maxPrice !== null) newParams.set('maxPrice', maxPrice);
    if (nightsFilter !== null) newParams.set('nights', nightsFilter);
    if (touristsFilter !== null) newParams.set('tourists', touristsFilter);
    if (dateFilter !== null) newParams.set('date', dateFilter);
    if (excursionFilter) newParams.set('hasExcursion', 'true');
    // Сохраняем discount только если filterText не пустое и совпадает с queryParams.country
    if (queryParams.discount && filterText && filterText.toLowerCase() === queryParams.country.toLowerCase()) {
      newParams.set('discount', queryParams.discount);
    }

    const newUrl = `${window.location.pathname}?${newParams.toString()}`;
    history.pushState({}, '', newUrl);
  }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {


  
  const queryParams = getQueryParams();

  if (document.getElementById('filter-container')) {
    // Заполняем фильтры значениями из URL только при начальной загрузке
    if (queryParams.country) document.getElementById('filterInput').value = queryParams.country;
    if (queryParams.nights) document.getElementById('nightsFilter').value = queryParams.nights;
    if (queryParams.tourists) document.getElementById('touristsFilter').value = queryParams.tourists;
    if (queryParams.maxPrice) document.getElementById('maxPrice').value = queryParams.maxPrice;
    if (queryParams.hasExcursion === 'true') document.getElementById('excursionFilter').checked = true;
    if (queryParams.date && queryParams.date !== 'autumn') document.getElementById('dateFilter').value = queryParams.date;

    fetch('xml/products.xml')
      .then(response => {
        if (!response.ok) throw new Error(`Ошибка загрузки XML: ${response.status}`);
        return response.text();
      })
      .then(xmlStr => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
        const productsXML = Array.from(xmlDoc.getElementsByTagName('product'));

        allProducts = productsXML.map(product => ({
          id: product.getAttribute('id'),
          name: product.getElementsByTagName('name')[0].textContent,
          shortDesc: product.getElementsByTagName('shortDesc')[0].textContent,
          detailedDesc: product.getElementsByTagName('detailedDesc')[0].textContent,
          price: parseFloat(product.getElementsByTagName('price')[0].textContent),
          image: product.getElementsByTagName('image')[0]?.textContent || null,
          hasExcursion: product.getElementsByTagName('hasExcursion')[0]?.textContent === 'true',
          nights: product.getElementsByTagName('nights')[0]?.textContent || null,
          tourists: product.getElementsByTagName('tourists')[0]?.textContent || null,
          departureDate: product.getElementsByTagName('departureDate')[0]?.textContent || null
        }));

        filterProducts();

        // Добавляем обработчики событий для фильтров и устанавливаем флаг isUserInteracting
        const setUserInteraction = () => { isUserInteracting = true; filterProducts(); };
        document.getElementById('filterInput').addEventListener('input', setUserInteraction);
        document.getElementById('minPrice').addEventListener('input', setUserInteraction);
        document.getElementById('maxPrice').addEventListener('input', setUserInteraction);
        document.getElementById('nightsFilter').addEventListener('input', setUserInteraction);
        document.getElementById('touristsFilter').addEventListener('input', setUserInteraction);
        document.getElementById('dateFilter').addEventListener('input', setUserInteraction);
        document.getElementById('sortSelect').addEventListener('change', setUserInteraction);
        document.getElementById('excursionFilter').addEventListener('change', setUserInteraction);
      })
      .catch(error => console.error('Ошибка:', error));

    const closeModalButton = document.getElementById('closeModal');
    const modalOverlay = document.getElementById('modal-overlay');
    if (closeModalButton) closeModalButton.addEventListener('click', closeModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }
  }
});