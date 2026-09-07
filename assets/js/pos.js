(function () {
  'use strict';

  var products = NM.getProducts();
  var orders = NM.getOrders();
  var customers = NM.getCustomers();
  var activeCategory = 'all';
  var cart = loadCart();
  var toastTimer;

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('nm_pos_cart')) || {};
    } catch (error) {
      return {};
    }
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
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date());
  }

  function renderCategories() {
    var select = document.getElementById('pos-category-filter');
    select.innerHTML = '<option value="all">Tất cả nhóm hàng</option>' + NM.categories.map(function (category) {
      return '<option value="' + category.slug + '">' + NM.escape(category.name) + '</option>';
    }).join('');
    select.value = activeCategory;

    document.getElementById('pos-category-strip').innerHTML =
      '<button class="' + (activeCategory === 'all' ? 'active' : '') + '" type="button" data-category="all">Tất cả</button>' +
      NM.categories.map(function (category) {
        return '<button class="' + (activeCategory === category.slug ? 'active' : '') +
          '" type="button" data-category="' + category.slug + '">' + category.emoji + ' ' +
          NM.escape(category.name) + '</button>';
      }).join('');
  }

  function renderProducts() {
    var term = document.getElementById('pos-product-search').value.trim().toLocaleLowerCase('vi');
    var filtered = products.filter(function (product) {
      return product.status === 'active' &&
        (activeCategory === 'all' || product.category === activeCategory) &&
        (!term || (product.name + ' ' + product.sku).toLocaleLowerCase('vi').includes(term));
    });

    document.getElementById('pos-product-list').innerHTML = filtered.map(function (product) {
      return '<button class="product-row" type="button" data-add-product="' + product.id + '" ' +
        (product.stock < 1 ? 'disabled' : '') + '><span class="pos-product-info"><span class="pos-product-icon" style="background:' +
        product.color + '">' + product.emoji + '</span><span><strong>' + NM.escape(product.name) +
        '</strong><small>' + NM.escape(product.sku) + ' · ' + NM.escape(product.categoryName) +
        '</small></span></span><strong>' + NM.formatMoney(product.price) + '</strong><em>' +
        product.stock + '</em><b>＋</b></button>';
    }).join('');
    document.getElementById('pos-product-empty').hidden = filtered.length > 0;
  }

  function cartItems() {
    return Object.keys(cart).map(function (key) {
      return cart[key];
    });
  }

  function subtotal() {
    return cartItems().reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
  }

  function total() {
    var discount = Math.max(0, Number(document.getElementById('pos-discount').value) || 0);
    return Math.max(0, subtotal() - Math.min(discount, subtotal()));
  }

  function renderCart() {
    var items = cartItems();
    document.getElementById('pos-cart-lines').innerHTML = items.length ? items.map(function (item) {
      return '<div class="cart-line" data-cart-id="' + item.id + '"><div><strong>' +
        NM.escape(item.name) + '</strong><small>' + NM.formatMoney(item.price) +
        ' / sản phẩm</small></div><div class="quantity-control"><button type="button" data-qty="minus">−</button>' +
        '<input data-qty-input type="number" min="1" max="' + item.stock + '" value="' + item.quantity +
        '" aria-label="Số lượng"><button type="button" data-qty="plus">＋</button></div><strong class="line-total">' +
        NM.formatMoney(item.price * item.quantity) + '</strong><button class="remove-line" type="button" data-qty="remove">×</button></div>';
    }).join('') : '<div class="cart-empty"><div><span>🧺</span>Chọn hàng hóa bên trái để thêm vào hóa đơn.</div></div>';

    var currentSubtotal = subtotal();
    var currentTotal = total();
    document.getElementById('pos-subtotal').textContent = NM.formatMoney(currentSubtotal);
    document.getElementById('pos-grand-total').textContent = NM.formatMoney(currentTotal);
    document.getElementById('pos-payment-amount').textContent = NM.formatMoney(currentTotal);
    document.getElementById('complete-sale').disabled = items.length === 0;
    saveCart();
  }

  function addProduct(id) {
    var product = products.find(function (item) {
      return item.id === id;
    });
    if (!product || product.stock < 1) return;
    if (cart[id]) {
      cart[id].quantity = Math.min(cart[id].quantity + 1, product.stock);
    } else {
      cart[id] = {
        id: product.id,
        sku: product.sku,
        name: product.name,
        emoji: product.emoji,
        price: product.price,
        stock: product.stock,
        quantity: 1
      };
    }
    renderCart();
  }

  document.getElementById('pos-product-search').addEventListener('input', renderProducts);
  document.getElementById('pos-category-filter').addEventListener('change', function (event) {
    activeCategory = event.target.value;
    renderCategories();
    renderProducts();
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

  document.getElementById('pos-cart-lines').addEventListener('click', function (event) {
    var button = event.target.closest('[data-qty]');
    var line = event.target.closest('[data-cart-id]');
    if (!button || !line) return;
    var item = cart[line.dataset.cartId];
    if (!item) return;
    if (button.dataset.qty === 'plus') item.quantity = Math.min(item.quantity + 1, item.stock);
    if (button.dataset.qty === 'minus') item.quantity -= 1;
    if (button.dataset.qty === 'remove' || item.quantity < 1) delete cart[line.dataset.cartId];
    renderCart();
  });

  document.getElementById('pos-cart-lines').addEventListener('change', function (event) {
    if (!event.target.matches('[data-qty-input]')) return;
    var line = event.target.closest('[data-cart-id]');
    var item = cart[line.dataset.cartId];
    item.quantity = Math.max(1, Math.min(Number(event.target.value) || 1, item.stock));
    renderCart();
  });

  document.getElementById('pos-discount').addEventListener('input', renderCart);
  document.getElementById('clear-invoice').addEventListener('click', function () {
    if (cartItems().length && !confirm('Xóa toàn bộ hàng hóa khỏi hóa đơn?')) return;
    cart = {};
    document.getElementById('pos-discount').value = 0;
    renderCart();
  });

  function buildOrder(status) {
    var now = new Date();
    var payment = document.querySelector('[name="pos-payment"]:checked').value;
    var customerName = document.getElementById('pos-customer-name').value.trim() || 'Khách lẻ';
    var customerPhone = document.getElementById('pos-customer-phone').value.trim();
    var items = cartItems();
    return {
      id: 'HD' + String(now.getTime()).slice(-7),
      createdAt: now.toISOString(),
      customer: { name: customerName, phone: customerPhone, address: 'Mua tại quầy' },
      payment: payment,
      status: status,
      source: 'POS',
      note: document.getElementById('pos-order-note').value.trim(),
      discount: Math.max(0, Number(document.getElementById('pos-discount').value) || 0),
      items: items.map(function (item) {
        return {
          id: item.id,
          name: item.name,
          emoji: item.emoji,
          price: item.price,
          quantity: item.quantity
        };
      }),
      total: total()
    };
  }

  function rememberCustomer(order) {
    if (!order.customer.phone || order.customer.name === 'Khách lẻ') return;
    var exists = customers.some(function (customer) {
      return customer.phone === order.customer.phone;
    });
    if (!exists) {
      customers.unshift({
        id: Math.max.apply(null, customers.map(function (item) { return item.id; }).concat([0])) + 1,
        name: order.customer.name,
        phone: order.customer.phone,
        email: '',
        address: '',
        createdAt: new Date().toISOString()
      });
      NM.setCustomers(customers);
    }
  }

  function clearForNewInvoice() {
    cart = {};
    document.getElementById('pos-customer-name').value = '';
    document.getElementById('pos-customer-phone').value = '';
    document.getElementById('pos-order-note').value = '';
    document.getElementById('pos-discount').value = 0;
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

  document.getElementById('complete-sale').addEventListener('click', completeSale);

  function completeSale() {
    if (!cartItems().length) return;
    var order = buildOrder('completed');
    orders.unshift(order);
    order.items.forEach(function (line) {
      var product = products.find(function (item) {
        return item.id === line.id;
      });
      if (product) product.stock = Math.max(0, product.stock - line.quantity);
    });
    NM.setOrders(orders);
    NM.setProducts(products);
    rememberCustomer(order);

    if (NM.getCashbook && NM.setCashbook) {
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

    document.getElementById('receipt-code').textContent = 'Hóa đơn #' + order.id + ' · ' + order.payment;
    document.getElementById('receipt-total').textContent = NM.formatMoney(order.total);
    clearForNewInvoice();
    renderProducts();
    document.getElementById('receipt-modal').showModal();
  }

  document.getElementById('new-invoice').addEventListener('click', function () {
    document.getElementById('receipt-modal').close();
    document.getElementById('pos-product-search').focus();
  });

  document.getElementById('print-invoice').addEventListener('click', function () {
    if (!cartItems().length) {
      showToast('Hóa đơn chưa có hàng hóa.');
      return;
    }
    window.print();
  });

  window.addEventListener('keydown', function (event) {
    if (event.key === 'F3') {
      event.preventDefault();
      document.getElementById('pos-product-search').focus();
    }
    if (event.key === 'F9') {
      event.preventDefault();
      completeSale();
    }
  });

  window.addEventListener('storage', function () {
    products = NM.getProducts();
    orders = NM.getOrders();
    customers = NM.getCustomers();
    renderProducts();
  });

  renderClock();
  setInterval(renderClock, 30000);
  renderCategories();
  renderProducts();
  renderCart();
}());
