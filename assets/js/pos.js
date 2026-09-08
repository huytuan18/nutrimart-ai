(async function () {
  'use strict';

  var authorizedUser = await NMAuth.requireRole(['admin','staff'],'sale');
  if (!authorizedUser) return;

  var products = NM.getProducts();
  var orders = NM.getOrders();
  var customers = NM.getCustomers();
  var cart = loadCart();
  var history = [];
  var activeCategory = 'all';
  var saleMode = localStorage.getItem('nm_pos_mode') || 'delivery';
  var shippingTab = 'gateway';
  var toastTimer;

  var app = document.getElementById('pos-app');
  var searchWrap = document.getElementById('product-search-wrap');
  var productSearch = document.getElementById('pos-product-search');
  var cartLines = document.getElementById('pos-cart-lines');
  var discountInput = document.getElementById('pos-discount');

  function photo(product, className) {
    return '<span class="' + className + '" style="background:' + (product.color || '#eef5f8') + '"><img src="' +
      NM.escape(product.image || '') + '" alt="' + NM.escape(product.name || '') + '" loading="lazy" ' +
      'onerror="this.hidden=true;this.nextElementSibling.hidden=false"><i hidden>' + (product.emoji || '🥗') + '</i></span>';
  }

  function setupCurrentUser() {
    var user = NMAuth.current();
    if (!user) return;
    var avatar = String(user.name || 'TN').trim().split(/\s+/).slice(-2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
    document.getElementById('pos-user-avatar').textContent = avatar;
    document.getElementById('pos-user-name').textContent = user.name;
    var select = document.querySelector('.order-line select');
    select.innerHTML = '<option>' + NM.escape(user.name) + '</option>';
    document.querySelector('.manager-button').hidden = user.role !== 'admin';
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('nm_pos_cart')) || {};
    } catch (error) {
      return {};
    }
  }

  function cloneCart(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function rememberCart() {
    history.push(cloneCart(cart));
    if (history.length > 20) history.shift();
  }

  function saveCart() {
    localStorage.setItem('nm_pos_cart', JSON.stringify(cart));
  }

  function showToast(message) {
    var toast = document.getElementById('pos-toast');
    toast.textContent = message;
    toast.className = 'pos-toast show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.className = 'pos-toast';
    }, 2500);
  }

  function renderClock() {
    document.getElementById('invoice-time').textContent = new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).format(new Date());
  }

  function renderCategories() {
    document.getElementById('pos-category-strip').innerHTML =
      '<button class="' + (activeCategory === 'all' ? 'active' : '') + '" type="button" data-category="all">Tất cả</button>' +
      NM.categories.map(function (category) {
        return '<button class="' + (activeCategory === category.slug ? 'active' : '') +
          '" type="button" data-category="' + category.slug + '">' + category.emoji + ' ' +
          NM.escape(category.name) + '</button>';
      }).join('');
  }

  function matchingProducts() {
    var term = productSearch.value.trim().toLocaleLowerCase('vi');
    return products.filter(function (product) {
      return product.status === 'active' &&
        (activeCategory === 'all' || product.category === activeCategory) &&
        (!term || (product.name + ' ' + product.sku + ' ' + product.categoryName).toLocaleLowerCase('vi').includes(term));
    }).slice(0, 35);
  }

  function renderProducts() {
    var filtered = matchingProducts();
    document.getElementById('pos-product-list').innerHTML = filtered.map(function (product) {
      return '<button class="product-result" type="button" data-add-product="' + product.id + '" ' +
        (product.stock < 1 ? 'disabled' : '') + '>' + photo(product,'result-icon') + '<span class="result-copy"><strong>' +
        NM.escape(product.name) + '</strong><small>' + NM.escape(product.sku) + ' · Tồn ' + product.stock +
        ' · ' + NM.escape(product.categoryName) + '</small></span><strong>' + NM.formatMoney(product.price) +
        '</strong><b>＋</b></button>';
    }).join('');
    document.getElementById('pos-product-empty').hidden = filtered.length > 0;
  }

  function cartItems() {
    return Object.keys(cart).map(function (key) { return cart[key]; });
  }

  function itemQuantity() {
    return cartItems().reduce(function (sum, item) { return sum + item.quantity; }, 0);
  }

  function subtotal() {
    return cartItems().reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
  }

  function discount() {
    return Math.min(Math.max(0, Number(discountInput.value) || 0), subtotal());
  }

  function shippingFee() {
    return saleMode === 'delivery' && shippingTab === 'gateway' && cartItems().length ? 30000 : 0;
  }

  function total() {
    return Math.max(0, subtotal() - discount() + shippingFee());
  }

  function renderCart() {
    var items = cartItems();
    cartLines.innerHTML = items.length ? items.map(function (item, index) {
      return '<div class="cart-line" data-cart-id="' + item.id + '"><span class="line-no">' + (index + 1) +
        '</span><div class="line-product">' + photo(item,'line-product-photo') +
        '<div><strong>' + NM.escape(item.name) + '</strong><small>' + NM.escape(item.sku) +
        ' · Tồn ' + item.stock + '</small></div></div><div class="quantity-control"><button type="button" data-qty="minus">−</button>' +
        '<input data-qty-input type="number" min="1" max="' + item.stock + '" value="' + item.quantity +
        '" aria-label="Số lượng"><button type="button" data-qty="plus">＋</button></div><span class="line-price">' +
        NM.formatMoney(item.price) + '</span><strong class="line-total">' + NM.formatMoney(item.price * item.quantity) +
        '</strong><button class="remove-line" type="button" data-qty="remove" aria-label="Xóa">×</button></div>';
    }).join('') : '<div class="cart-empty"><div><span>🛒</span><strong>Hóa đơn chưa có hàng hóa</strong><small>Tìm tên hoặc mã hàng trong ô F3 để bắt đầu bán</small></div></div>';

    var quantity = itemQuantity();
    var currentSubtotal = subtotal();
    var currentTotal = total();
    document.getElementById('invoice-line-count').textContent = items.length;
    document.getElementById('summary-item-count').textContent = quantity + ' sản phẩm';
    document.getElementById('pos-subtotal').textContent = NM.formatMoney(currentSubtotal);
    document.getElementById('shipping-fee').textContent = NM.formatMoney(shippingFee());
    document.getElementById('pos-grand-total').textContent = NM.formatMoney(currentTotal);
    document.getElementById('pos-payment-amount').textContent = NM.formatMoney(currentTotal);
    document.querySelectorAll('[data-pay-trigger]').forEach(function (button) {
      button.disabled = !items.length;
    });
    saveCart();
  }

  function addProduct(id) {
    var product = products.find(function (item) { return item.id === id; });
    if (!product || product.stock < 1) return;
    rememberCart();
    if (cart[id]) {
      cart[id].quantity = Math.min(cart[id].quantity + 1, product.stock);
    } else {
      cart[id] = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        emoji: product.emoji,
        image: product.image,
        color: product.color,
        price: product.price,
        stock: product.stock,
        quantity: 1
      };
    }
    renderCart();
    productSearch.value = '';
    productSearch.focus();
    renderProducts();
  }

  function setMode(mode) {
    saleMode = ['fast', 'normal', 'delivery'].includes(mode) ? mode : 'delivery';
    localStorage.setItem('nm_pos_mode', saleMode);
    app.classList.remove('mode-fast', 'mode-normal', 'mode-delivery', 'show-delivery');
    app.classList.add('mode-' + saleMode);
    document.querySelectorAll('[data-sale-mode]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.saleMode === saleMode);
    });
    document.title = 'Chi nhánh trung tâm - ' +
      (saleMode === 'fast' ? 'Bán nhanh' : saleMode === 'normal' ? 'Bán thường' : 'Bán giao hàng') +
      ' | NutriMart AI';
    renderCart();
  }

  function setShippingTab(tab) {
    shippingTab = tab === 'self' ? 'self' : 'gateway';
    document.querySelectorAll('[data-shipping-tab]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.shippingTab === shippingTab);
    });
    document.querySelectorAll('[data-shipping-content]').forEach(function (content) {
      content.classList.toggle('active', content.dataset.shippingContent === shippingTab);
    });
    renderCart();
  }

  productSearch.addEventListener('focus', function () {
    searchWrap.classList.add('open');
    renderProducts();
  });
  productSearch.addEventListener('input', function () {
    searchWrap.classList.add('open');
    renderProducts();
  });
  document.querySelector('.barcode-button').addEventListener('click', function () {
    searchWrap.classList.add('open');
    productSearch.focus();
    showToast('Sẵn sàng nhập hoặc quét mã hàng.');
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('#product-search-wrap')) searchWrap.classList.remove('open');
  });

  document.getElementById('pos-category-strip').addEventListener('click', function (event) {
    var button = event.target.closest('[data-category]');
    if (!button) return;
    activeCategory = button.dataset.category;
    renderCategories();
    renderProducts();
  });
  document.getElementById('pos-product-list').addEventListener('click', function (event) {
    var button = event.target.closest('[data-add-product]');
    if (button) addProduct(Number(button.dataset.addProduct));
  });

  cartLines.addEventListener('click', function (event) {
    var button = event.target.closest('[data-qty]');
    var line = event.target.closest('[data-cart-id]');
    if (!button || !line) return;
    var item = cart[line.dataset.cartId];
    if (!item) return;
    rememberCart();
    if (button.dataset.qty === 'plus') item.quantity = Math.min(item.quantity + 1, item.stock);
    if (button.dataset.qty === 'minus') item.quantity -= 1;
    if (button.dataset.qty === 'remove' || item.quantity < 1) delete cart[line.dataset.cartId];
    renderCart();
  });
  cartLines.addEventListener('change', function (event) {
    if (!event.target.matches('[data-qty-input]')) return;
    var line = event.target.closest('[data-cart-id]');
    var item = cart[line.dataset.cartId];
    if (!item) return;
    rememberCart();
    item.quantity = Math.max(1, Math.min(Number(event.target.value) || 1, item.stock));
    renderCart();
  });

  discountInput.addEventListener('input', renderCart);
  document.getElementById('undo-action').addEventListener('click', function () {
    if (!history.length) {
      showToast('Không có thao tác để hoàn tác.');
      return;
    }
    cart = history.pop();
    renderCart();
    showToast('Đã hoàn tác thao tác gần nhất.');
  });
  document.getElementById('clear-invoice').addEventListener('click', function () {
    if (cartItems().length && !confirm('Xóa toàn bộ hàng hóa khỏi hóa đơn?')) return;
    if (cartItems().length) rememberCart();
    clearForNewInvoice();
    showToast('Đã làm mới hóa đơn.');
  });

  document.querySelectorAll('[data-sale-mode]').forEach(function (button) {
    button.addEventListener('click', function () { setMode(button.dataset.saleMode); });
  });
  document.querySelectorAll('[data-shipping-tab]').forEach(function (button) {
    button.addEventListener('click', function () { setShippingTab(button.dataset.shippingTab); });
  });

  document.getElementById('quick-customer').addEventListener('click', function () {
    document.getElementById('pos-customer-name').value = 'Khách mẫu mới';
    document.getElementById('pos-customer-phone').value = 'DEMO-NEW';
    showToast('Đã thêm khách hàng mẫu vào hóa đơn.');
  });

  function buildOrder(status) {
    var now = new Date();
    var paymentChoice = document.querySelector('[name="pos-payment"]:checked').value;
    var isCod = saleMode === 'delivery' && document.getElementById('cod-toggle').checked;
    var customerName = document.getElementById('pos-customer-name').value.trim() || 'Khách lẻ';
    var customerPhone = document.getElementById('pos-customer-phone').value.trim();
    var receiverName = document.getElementById('receiver-name').value.trim();
    var receiverPhone = document.getElementById('receiver-phone').value.trim();
    var address = saleMode === 'delivery' ?
      (document.getElementById('receiver-address').value.trim() || 'Địa chỉ giao hàng minh họa') : 'Mua tại quầy';
    return {
      id: 'HD' + String(now.getTime()).slice(-7),
      createdAt: now.toISOString(),
      customer: {
        name: customerName,
        phone: customerPhone || receiverPhone,
        address: address,
        receiver: receiverName
      },
      payment: isCod ? 'Thu hộ COD' : paymentChoice,
      status: status,
      source: 'POS',
      saleMode: saleMode,
      staffId: NMAuth.current() ? NMAuth.current().id : '',
      staffName: NMAuth.current() ? NMAuth.current().name : '',
      shipping: saleMode === 'delivery' ? shippingTab : '',
      shippingFee: shippingFee(),
      note: document.getElementById('pos-order-note').value.trim(),
      deliveryNote: document.getElementById('delivery-note').value.trim(),
      discount: discount(),
      items: cartItems().map(function (item) {
        return { id: item.id, name: item.name, emoji: item.emoji, image:item.image, price: item.price, quantity: item.quantity };
      }),
      total: total()
    };
  }

  function rememberCustomer(order) {
    if (!order.customer.phone || order.customer.name === 'Khách lẻ') return;
    var exists = customers.some(function (customer) { return customer.phone === order.customer.phone; });
    if (!exists) {
      customers.unshift({
        id: Math.max.apply(null, customers.map(function (item) { return item.id; }).concat([0])) + 1,
        name: order.customer.name,
        phone: order.customer.phone,
        email: '',
        address: order.customer.address,
        createdAt: new Date().toISOString()
      });
      NM.setCustomers(customers);
    }
  }

  function clearForNewInvoice() {
    cart = {};
    history = [];
    ['pos-customer-name', 'pos-customer-phone', 'receiver-name', 'receiver-phone', 'receiver-address', 'pos-order-note', 'delivery-note'].forEach(function (id) {
      document.getElementById(id).value = '';
    });
    discountInput.value = 0;
    renderCart();
  }

  document.getElementById('hold-invoice').addEventListener('click', function () {
    if (!cartItems().length) {
      showToast('Hóa đơn chưa có hàng hóa.');
      return;
    }
    var order = buildOrder('on-hold');
    orders.unshift(order);
    NM.setOrders(orders);
    rememberCustomer(order);
    clearForNewInvoice();
    showToast('Đã lưu tạm hóa đơn #' + order.id + '.');
  });

  function completeSale() {
    if (!cartItems().length) return;
    var deliveryOrder = saleMode === 'delivery';
    var order = buildOrder(deliveryOrder ? 'processing' : 'completed');
    orders.unshift(order);
    order.items.forEach(function (line) {
      var product = products.find(function (item) { return item.id === line.id; });
      if (product) product.stock = Math.max(0, product.stock - line.quantity);
    });
    NM.setOrders(orders);
    NM.setProducts(products);
    rememberCustomer(order);

    if (!(deliveryOrder && order.payment === 'Thu hộ COD') && NM.getCashbook && NM.setCashbook) {
      var entries = NM.getCashbook();
      entries.unshift({
        id: 'PT' + String(Date.now()).slice(-6),
        type: 'income',
        createdAt: new Date().toISOString(),
        partner: order.customer.name,
        reason: 'Thu tiền hóa đơn #' + order.id,
        amount: order.total
      });
      NM.setCashbook(entries);
    }

    document.getElementById('receipt-title').textContent = deliveryOrder ? 'Tạo đơn giao hàng thành công' : 'Thanh toán thành công';
    document.getElementById('receipt-code').textContent = 'Hóa đơn #' + order.id + ' · ' + order.payment;
    document.getElementById('receipt-total').textContent = NM.formatMoney(order.total);
    clearForNewInvoice();
    renderProducts();
    document.getElementById('receipt-modal').showModal();
  }

  document.querySelectorAll('[data-pay-trigger]').forEach(function (button) {
    button.addEventListener('click', completeSale);
  });
  document.getElementById('new-invoice').addEventListener('click', function () {
    document.getElementById('receipt-modal').close();
    searchWrap.classList.add('open');
    productSearch.focus();
  });
  document.getElementById('print-invoice').addEventListener('click', function () {
    if (!cartItems().length) {
      showToast('Hóa đơn chưa có hàng hóa.');
      return;
    }
    window.print();
  });

  document.querySelector('.invoice-add').addEventListener('click', function () {
    if (cartItems().length && !confirm('Tạo hóa đơn mới và giữ hóa đơn hiện tại ở trạng thái tạm?')) return;
    if (cartItems().length) {
      var order = buildOrder('on-hold');
      orders.unshift(order);
      NM.setOrders(orders);
    }
    clearForNewInvoice();
    showToast('Đã mở Hóa đơn 1 mới.');
  });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'F3') {
      event.preventDefault();
      searchWrap.classList.add('open');
      productSearch.focus();
    }
    if (event.key === 'F4') {
      event.preventDefault();
      document.getElementById('pos-customer-name').focus();
    }
    if (event.key === 'F9') {
      event.preventDefault();
      completeSale();
    }
    if (event.key === 'Escape') searchWrap.classList.remove('open');
  });

  window.addEventListener('storage', function () {
    products = NM.getProducts();
    orders = NM.getOrders();
    customers = NM.getCustomers();
    renderProducts();
  });

  document.getElementById('pos-user-button').addEventListener('click', function (event) {
    event.stopPropagation();
    document.querySelector('.cashier-wrap').classList.toggle('open');
  });
  document.getElementById('pos-logout').addEventListener('click', async function () {
    await NMAuth.logout();
    window.top.location.replace(NMAuth.rootUrl('auth.html'));
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.cashier-wrap')) document.querySelector('.cashier-wrap').classList.remove('open');
  });

  setupCurrentUser();
  renderClock();
  setInterval(renderClock, 30000);
  renderCategories();
  renderProducts();
  setShippingTab('gateway');
  setMode(saleMode);
}());
