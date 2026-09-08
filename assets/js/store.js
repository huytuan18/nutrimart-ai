(function () {
  'use strict';

  var products = NM.getProducts();
  var cart = NM.getCart();
  var visibleCount = 12;
  var activeCategory = 'all';
  var toastTimer = null;
  var countdownTimer = null;
  var paymentSettings = {
    enabled: false,
    bankCode: '',
    bankName: '',
    accountNumber: '',
    accountName: '',
    shippingFee: 30000,
    freeShippingThreshold: 499000
  };

  var productGrid = document.getElementById('product-grid');
  var productEmpty = document.getElementById('product-empty');
  var categoryFilter = document.getElementById('category-filter');
  var productSearch = document.getElementById('product-search');
  var headerSearch = document.getElementById('header-search-input');
  var sortProducts = document.getElementById('sort-products');
  var loadMore = document.getElementById('load-more');
  var cartDrawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('overlay');
  var checkoutModal = document.getElementById('checkout-modal');
  var paymentModal = document.getElementById('payment-modal');

  function productPhoto(product, className) {
    return '<span class="' + className + '" style="background:' + product.color + '"><img src="' +
      NM.escape(product.image || '') + '" alt="' + NM.escape(product.name) + '" loading="lazy" ' +
      'onerror="this.hidden=true;this.nextElementSibling.hidden=false"><i hidden>' +
      (product.emoji || '🥗') + '</i></span>';
  }

  function showToast(text, type) {
    var toast = document.getElementById('toast');
    toast.textContent = text;
    toast.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.className = 'toast';
    }, 3200);
  }

  function cartDetails() {
    return cart.map(function (line) {
      var product = products.find(function (item) {
        return item.id === line.id;
      });
      return product ? Object.assign({}, product, { quantity: line.quantity }) : null;
    }).filter(Boolean);
  }

  function subtotal() {
    return cartDetails().reduce(function (sum, item) {
      return sum + item.price * item.quantity;
    }, 0);
  }

  function shippingFee(amount) {
    if (!amount || amount >= Number(paymentSettings.freeShippingThreshold || 499000)) return 0;
    return Number(paymentSettings.shippingFee || 30000);
  }

  function renderAccount() {
    var user = NMAuth.current();
    var guest = document.getElementById('guest-actions');
    var menu = document.getElementById('account-menu');
    guest.hidden = Boolean(user);
    menu.hidden = !user;
    if (!user) return;
    var initials = String(user.name || 'KH').trim().split(/\s+/).slice(-2).map(function (part) {
      return part.charAt(0);
    }).join('').toUpperCase();
    document.getElementById('header-avatar').textContent = initials;
    document.getElementById('header-user-name').textContent = user.name;
    var workspace = document.getElementById('header-workspace');
    workspace.hidden = user.role === 'customer';
    workspace.href = user.role === 'staff' ? 'sale/#/' : 'man/#/DashBoard';
    workspace.textContent = user.role === 'staff' ? 'Màn hình bán hàng' : 'Trang quản lý';
  }

  function renderCategories() {
    var grid = document.getElementById('category-grid');
    grid.innerHTML = NM.categories.map(function (category) {
      return '<button class="category-card" data-category="' + category.slug + '"><span style="background:' +
        category.color + '"><img src="' + NM.escape(category.image) +
        '" alt="" loading="lazy" onerror="this.hidden=true"><i>' + category.emoji +
        '</i></span><strong>' + NM.escape(category.name) + '</strong><small>' +
        category.count + ' sản phẩm</small></button>';
    }).join('');

    categoryFilter.innerHTML = '<option value="all">Tất cả danh mục</option>' +
      NM.categories.map(function (category) {
        return '<option value="' + category.slug + '">' + NM.escape(category.name) + '</option>';
      }).join('');

    grid.addEventListener('click', function (event) {
      var button = event.target.closest('[data-category]');
      if (!button) return;
      activeCategory = button.dataset.category;
      categoryFilter.value = activeCategory;
      visibleCount = 12;
      renderProducts();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  }

  function filteredProducts() {
    var search = productSearch.value.trim().toLocaleLowerCase('vi');
    var result = products.filter(function (product) {
      var matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      var haystack = (product.name + ' ' + product.sku).toLocaleLowerCase('vi');
      return product.status === 'active' && matchesCategory && (!search || haystack.indexOf(search) !== -1);
    });
    if (sortProducts.value === 'price-asc') result.sort(function (a, b) { return a.price - b.price; });
    if (sortProducts.value === 'price-desc') result.sort(function (a, b) { return b.price - a.price; });
    if (sortProducts.value === 'protein') result.sort(function (a, b) { return b.protein - a.protein; });
    if (sortProducts.value === 'featured') {
      result.sort(function (a, b) {
        return Number(b.healthy) - Number(a.healthy) || a.id - b.id;
      });
    }
    return result;
  }

  function renderProducts() {
    var filtered = filteredProducts();
    var shown = filtered.slice(0, visibleCount);
    productGrid.innerHTML = shown.map(function (product, index) {
      var badge = product.healthy ? 'LÀNH MẠNH' : (index < 3 ? 'NỔI BẬT' : '');
      return '<article class="product-card"><div class="product-image" style="--product-bg:' +
        product.color + '"><img src="' + NM.escape(product.image || '') + '" alt="' +
        NM.escape(product.name) + '" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false">' +
        '<span class="product-image-fallback" hidden>' + product.emoji + '</span>' +
        (badge ? '<b class="product-badge">' + badge + '</b>' : '') +
        '</div><div class="product-body"><span class="product-category">' +
        NM.escape(product.categoryName) + '</span><h3>' + NM.escape(product.name) + '</h3>' +
        '<p class="product-stock">Còn ' + product.stock + ' sản phẩm</p>' +
        '<div class="nutrition-chips"><span>' + product.calories + ' kcal</span><span>' +
        product.protein + 'g đạm</span><span>' + product.fiber + 'g chất xơ</span></div>' +
        '<div class="product-foot"><div class="price"><strong>' + NM.formatMoney(product.price) +
        '</strong>' + (product.oldPrice ? '<small>' + NM.formatMoney(product.oldPrice) + '</small>' : '') +
        '</div><button class="add-cart" data-add-cart="' + product.id +
        '" type="button" aria-label="Thêm ' + NM.escape(product.name) + ' vào giỏ">Thêm</button></div></div></article>';
    }).join('');
    productEmpty.hidden = filtered.length > 0;
    loadMore.style.display = filtered.length > visibleCount ? 'flex' : 'none';
    document.getElementById('product-result-count').textContent =
      'Hiển thị ' + shown.length + ' / ' + filtered.length + ' sản phẩm';
  }

  function addToCart(id) {
    var product = products.find(function (item) { return item.id === id; });
    if (!product || product.stock < 1) {
      showToast('Sản phẩm hiện đã hết hàng.', 'error');
      return;
    }
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) existing.quantity = Math.min(existing.quantity + 1, product.stock);
    else cart.push({ id: product.id, quantity: 1 });
    saveCart();
    showToast('Đã thêm “' + product.name + '” vào giỏ hàng.', 'success');
  }

  function saveCart() {
    NM.setCart(cart);
    renderCart();
  }

  function renderCart() {
    var details = cartDetails();
    var quantity = details.reduce(function (sum, item) { return sum + item.quantity; }, 0);
    var amount = details.reduce(function (sum, item) { return sum + item.price * item.quantity; }, 0);
    var delivery = shippingFee(amount);
    var threshold = Number(paymentSettings.freeShippingThreshold || 499000);
    var percent = Math.min(100, Math.round(amount / threshold * 100));

    document.getElementById('cart-badge').textContent = quantity;
    document.getElementById('drawer-count').textContent = quantity + ' sản phẩm';
    document.getElementById('cart-subtotal').textContent = NM.formatMoney(amount);
    document.getElementById('cart-shipping').textContent = amount ? (delivery ? NM.formatMoney(delivery) : 'Miễn phí') : 'Tính khi thanh toán';
    document.getElementById('cart-total').textContent = NM.formatMoney(amount + delivery);
    document.getElementById('shipping-percent').textContent = percent + '%';
    document.getElementById('shipping-progress').style.width = percent + '%';
    document.getElementById('shipping-message').textContent = !amount ?
      'Thêm sản phẩm để nhận ưu đãi giao hàng' :
      (delivery ? 'Mua thêm ' + NM.formatMoney(threshold - amount) + ' để được miễn phí giao hàng' : 'Đơn hàng đã được miễn phí giao hàng');

    var mobileBar = document.getElementById('mobile-cart-bar');
    mobileBar.hidden = quantity === 0;
    document.getElementById('mobile-cart-count').textContent = quantity;
    document.getElementById('mobile-cart-total').textContent = NM.formatMoney(amount + delivery);

    var container = document.getElementById('cart-items');
    var checkout = document.getElementById('checkout-button');
    checkout.disabled = details.length === 0;
    if (!details.length) {
      container.innerHTML = '<div class="cart-empty"><div><span>🧺</span><h3>Giỏ hàng đang trống</h3><p>Thêm vài món tươi ngon cho bữa ăn hôm nay.</p></div></div>';
      return;
    }
    container.innerHTML = details.map(function (item) {
      return '<div class="cart-line" data-cart-line="' + item.id + '">' +
        productPhoto(item, 'cart-line-icon') + '<div><span class="cart-line-meta">' +
        NM.escape(item.sku) + ' · ' + NM.escape(item.categoryName) + '</span><h4>' +
        NM.escape(item.name) + '</h4><span class="cart-line-price">' +
        NM.formatMoney(item.price * item.quantity) + '</span><div class="qty-control">' +
        '<button data-qty="minus" type="button" aria-label="Giảm số lượng">−</button><b>' +
        item.quantity + '</b><button data-qty="plus" type="button" aria-label="Tăng số lượng">+</button>' +
        '</div></div><button class="remove-cart" data-qty="remove" type="button" aria-label="Xóa sản phẩm">×</button></div>';
    }).join('');
  }

  function openCart() {
    cartDrawer.classList.add('open');
    overlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }

  async function loadPaymentSettings() {
    if (!NMAuth.getPaymentSettings) {
      updatePaymentOption();
      return paymentSettings;
    }
    try {
      var remoteSettings = await NMAuth.getPaymentSettings();
      if (remoteSettings) paymentSettings = remoteSettings;
    } catch (error) {
      paymentSettings.enabled = false;
    }
    updatePaymentOption();
    renderCart();
    return paymentSettings;
  }

  function updatePaymentOption() {
    var option = document.getElementById('bank-payment-option');
    var input = option.querySelector('input');
    var ready = Boolean(paymentSettings.enabled && paymentSettings.bankCode &&
      paymentSettings.accountNumber && paymentSettings.accountName);
    input.disabled = !ready;
    document.getElementById('bank-payment-hint').textContent = ready ?
      'Quét QR, số tiền và mã đơn được điền sẵn' :
      'Cửa hàng chưa bật thông tin nhận chuyển khoản';
    if (!ready && input.checked) {
      document.querySelector('input[name="payment"][value="cod"]').checked = true;
      selectPaymentOption();
    }
  }

  function selectPaymentOption() {
    document.querySelectorAll('.payment-option').forEach(function (option) {
      var input = option.querySelector('input');
      option.classList.toggle('selected', Boolean(input && input.checked));
    });
  }

  function renderCheckoutSummary() {
    var details = cartDetails();
    var amount = subtotal();
    var delivery = shippingFee(amount);
    document.getElementById('checkout-items').innerHTML = details.map(function (item) {
      return '<div class="checkout-item"><span><img src="' + NM.escape(item.image || '') +
        '" alt="' + NM.escape(item.name) + '"></span><div><h4>' + NM.escape(item.name) +
        '</h4><p>' + item.quantity + ' × ' + NM.formatMoney(item.price) + '</p></div><strong>' +
        NM.formatMoney(item.quantity * item.price) + '</strong></div>';
    }).join('');
    document.getElementById('checkout-subtotal').textContent = NM.formatMoney(amount);
    document.getElementById('checkout-shipping').textContent = delivery ? NM.formatMoney(delivery) : 'Miễn phí';
    document.getElementById('checkout-total').textContent = NM.formatMoney(amount + delivery);
  }

  async function openCheckout() {
    try {
      await NMAuth.ready;
    } catch (error) {
      location.href = NMAuth.loginUrl('checkout', 'config');
      return;
    }
    var user = NMAuth.current();
    if (!user) {
      location.href = NMAuth.loginUrl('checkout');
      return;
    }
    await loadPaymentSettings();
    var form = document.getElementById('checkout-form');
    form.elements.name.value = user.name || '';
    form.elements.phone.value = user.phone || '';
    form.elements.email.value = user.email || '';
    form.elements.address.value = user.address || '';
    renderCheckoutSummary();
    selectPaymentOption();
    closeCart();
    checkoutModal.showModal();
    document.body.classList.add('no-scroll');
  }

  function closeCheckout() {
    checkoutModal.close();
    document.body.classList.remove('no-scroll');
  }
  function paymentCode(orderId) {
    return ('NMAI ' + orderId).replace(/[^A-Z0-9 ]/gi, '').toUpperCase();
  }

  function buildVietQrUrl(order) {
    var bank = encodeURIComponent(String(paymentSettings.bankCode || '').trim());
    var account = encodeURIComponent(String(paymentSettings.accountNumber || '').replace(/\s+/g, ''));
    var query = new URLSearchParams({
      amount: String(Math.round(order.total)),
      addInfo: order.paymentCode,
      accountName: String(paymentSettings.accountName || '').trim()
    });
    return 'https://img.vietqr.io/image/' + bank + '-' + account + '-compact2.png?' + query.toString();
  }

  function startPaymentCountdown() {
    clearInterval(countdownTimer);
    var remaining = 15 * 60;
    var element = document.getElementById('payment-countdown');
    function render() {
      var minutes = Math.floor(remaining / 60);
      var seconds = remaining % 60;
      element.textContent = String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
      if (remaining <= 0) {
        clearInterval(countdownTimer);
        element.textContent = 'Đã hết thời gian';
        return;
      }
      remaining -= 1;
    }
    render();
    countdownTimer = setInterval(render, 1000);
  }

  function showPaymentSuccess(order) {
    var bankPanel = document.getElementById('bank-payment-panel');
    document.getElementById('success-order-id').textContent = order.id;
    document.getElementById('payment-success-title').textContent =
      order.paymentMethod === 'bank-transfer' ? 'Quét mã để thanh toán' : 'Cảm ơn bạn đã đặt hàng';
    document.getElementById('payment-success-message').textContent =
      order.paymentMethod === 'bank-transfer' ?
        'Đơn hàng đã được ghi nhận và đang chờ chuyển khoản.' :
        'Cửa hàng sẽ xác nhận và giao đơn trong thời gian sớm nhất.';

    bankPanel.hidden = order.paymentMethod !== 'bank-transfer';
    if (order.paymentMethod === 'bank-transfer') {
      var qrImage = document.getElementById('payment-qr');
      qrImage.hidden = false;
      qrImage.src = buildVietQrUrl(order);
      qrImage.onerror = function () {
        qrImage.hidden = true;
        showToast('Không tải được mã QR. Bạn vẫn có thể dùng thông tin chuyển khoản bên cạnh.', 'error');
      };
      document.getElementById('payment-bank-name').textContent =
        paymentSettings.bankName || paymentSettings.bankCode;
      document.getElementById('payment-account').textContent = paymentSettings.accountNumber;
      document.getElementById('payment-account-name').textContent = paymentSettings.accountName;
      document.getElementById('payment-amount').textContent = NM.formatMoney(order.total);
      document.getElementById('payment-amount').dataset.copyValue = String(Math.round(order.total));
      document.getElementById('payment-content').textContent = order.paymentCode;
      startPaymentCountdown();
    } else {
      clearInterval(countdownTimer);
    }

    checkoutModal.close();
    paymentModal.showModal();
    document.body.classList.add('no-scroll');
  }

  async function submitOrder(event) {
    event.preventDefault();
    var submitButton = event.currentTarget.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.querySelector('span').textContent = 'Đang tạo đơn...';
    try {
      await NMAuth.ready;
      var details = cartDetails();
      var sessionUser = NMAuth.current();
      if (!sessionUser) {
        location.href = NMAuth.loginUrl('checkout');
        return;
      }
      if (!details.length) throw new Error('Giỏ hàng đang trống.');

      var data = new FormData(event.currentTarget);
      var method = String(data.get('payment') || 'cod');
      if (method === 'bank-transfer' && !paymentSettings.enabled) {
        throw new Error('Chuyển khoản VietQR chưa được cửa hàng kích hoạt.');
      }

      var now = new Date();
      var amount = subtotal();
      var delivery = shippingFee(amount);
      var orderId = 'NM' + String(now.getTime()).slice(-8);
      var order = {
        id: orderId,
        createdAt: now.toISOString(),
        userId: sessionUser.id,
        customer: {
          name: data.get('name'),
          phone: data.get('phone'),
          email: data.get('email'),
          address: data.get('address')
        },
        payment: method === 'bank-transfer' ? 'Chuyển khoản VietQR' : 'Thanh toán khi nhận hàng',
        paymentMethod: method,
        paymentCode: paymentCode(orderId),
        paymentStatus: method === 'bank-transfer' ? 'awaiting-payment' : 'cod',
        status: 'on-hold',
        source: 'Website',
        note: data.get('note'),
        items: details.map(function (item) {
          return {
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            emoji: item.emoji,
            image: item.image
          };
        }),
        subtotal: amount,
        shippingFee: delivery,
        total: amount + delivery
      };

      var orders = NM.getOrders();
      orders.unshift(order);
      NM.setOrders(orders);
      details.forEach(function (line) {
        var product = products.find(function (item) { return item.id === line.id; });
        if (product) product.stock = Math.max(0, product.stock - line.quantity);
      });
      NM.setProducts(products);
      cart = [];
      saveCart();
      renderProducts();
      event.currentTarget.reset();
      selectPaymentOption();
      showPaymentSuccess(order);
    } catch (error) {
      showToast(error.message || 'Không thể tạo đơn hàng.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.querySelector('span').textContent = 'Đặt hàng ngay';
    }
  }

  function changeCartQuantity(id, action) {
    var line = cart.find(function (item) { return item.id === id; });
    var product = products.find(function (item) { return item.id === id; });
    if (!line) return;
    if (action === 'remove') {
      cart = cart.filter(function (item) { return item.id !== id; });
    } else if (action === 'minus') {
      line.quantity -= 1;
      if (line.quantity < 1) cart = cart.filter(function (item) { return item.id !== id; });
    } else if (action === 'plus' && product) {
      if (line.quantity >= product.stock) {
        showToast('Số lượng đã đạt mức tồn kho hiện tại.', 'error');
        return;
      }
      line.quantity += 1;
    }
    saveCart();
  }

  function copyValue(targetId, raw) {
    var target = document.getElementById(targetId);
    if (!target) return;
    var value = raw && target.dataset.copyValue ? target.dataset.copyValue : target.textContent.trim();
    function done() { showToast('Đã sao chép: ' + value, 'success'); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(value).then(done).catch(function () {
        showToast('Không thể sao chép tự động.', 'error');
      });
      return;
    }
    var input = document.createElement('textarea');
    input.value = value;
    input.setAttribute('readonly', '');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      done();
    } catch (error) {
      showToast('Không thể sao chép tự động.', 'error');
    }
    input.remove();
  }

  function analyzeNutrition(event) {
    event.preventDefault();
    var data = new FormData(event.currentTarget);
    var age = Number(data.get('age'));
    var height = Number(data.get('height'));
    var weight = Number(data.get('weight'));
    var activity = Number(data.get('activity'));
    var gender = data.get('gender');
    var goal = data.get('goal');
    var bmi = weight / Math.pow(height / 100, 2);
    var bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'male' ? 5 : -161);
    var target = bmr * activity + (goal === 'lose' ? -350 : goal === 'muscle' ? 250 : 0);
    var protein = goal === 'muscle' ? weight * 1.8 : weight * 1.4;
    var bmiLabel = bmi < 18.5 ? 'Thiếu cân' : bmi < 23 ? 'Cân đối' : bmi < 25 ? 'Thừa cân nhẹ' : 'Cần kiểm soát';
    var result = document.getElementById('ai-result');
    result.innerHTML = '<h4>Kết quả tham khảo · ' + bmiLabel + '</h4><div class="ai-result-grid">' +
      '<div><strong>' + bmi.toFixed(1) + '</strong><small>BMI</small></div>' +
      '<div><strong>' + Math.round(bmr) + '</strong><small>BMR kcal</small></div>' +
      '<div><strong>' + Math.max(1200, Math.round(target)) + '</strong><small>Mục tiêu kcal/ngày</small></div>' +
      '<div><strong>' + Math.round(protein) + 'g</strong><small>Protein gợi ý</small></div></div>';
    result.hidden = false;
  }

  function bindEvents() {
    productGrid.addEventListener('click', function (event) {
      var button = event.target.closest('[data-add-cart]');
      if (button) addToCart(Number(button.dataset.addCart));
    });

    [productSearch, sortProducts].forEach(function (control) {
      control.addEventListener(control === productSearch ? 'input' : 'change', function () {
        visibleCount = 12;
        renderProducts();
      });
    });
    categoryFilter.addEventListener('change', function () {
      activeCategory = categoryFilter.value;
      visibleCount = 12;
      renderProducts();
    });
    headerSearch.addEventListener('input', function () {
      productSearch.value = headerSearch.value;
      visibleCount = 12;
      renderProducts();
    });
    headerSearch.addEventListener('keydown', function (event) {
      if (event.key !== 'Enter') return;
      event.preventDefault();
      productSearch.value = headerSearch.value;
      renderProducts();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
    document.getElementById('search-focus').addEventListener('click', function () {
      headerSearch.focus();
    });
    loadMore.addEventListener('click', function () {
      visibleCount += 12;
      renderProducts();
    });

    document.getElementById('open-cart').addEventListener('click', openCart);
    document.getElementById('close-cart').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);
    document.querySelector('[data-open-cart]').addEventListener('click', openCart);
    document.getElementById('cart-items').addEventListener('click', function (event) {
      var button = event.target.closest('[data-qty]');
      var line = event.target.closest('[data-cart-line]');
      if (button && line) changeCartQuantity(Number(line.dataset.cartLine), button.dataset.qty);
    });
    document.getElementById('checkout-button').addEventListener('click', openCheckout);
    document.getElementById('close-checkout').addEventListener('click', closeCheckout);
    checkoutModal.addEventListener('cancel', function (event) {
      event.preventDefault();
      closeCheckout();
    });
    document.querySelectorAll('input[name="payment"]').forEach(function (input) {
      input.addEventListener('change', selectPaymentOption);
    });
    document.getElementById('checkout-form').addEventListener('submit', submitOrder);

    document.getElementById('close-payment').addEventListener('click', function () {
      paymentModal.close();
      document.body.classList.remove('no-scroll');
      clearInterval(countdownTimer);
    });
    document.getElementById('continue-shopping').addEventListener('click', function () {
      paymentModal.close();
      document.body.classList.remove('no-scroll');
      clearInterval(countdownTimer);
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
    paymentModal.addEventListener('cancel', function () {
      document.body.classList.remove('no-scroll');
      clearInterval(countdownTimer);
    });
    document.querySelectorAll('[data-copy-target]').forEach(function (button) {
      button.addEventListener('click', function () {
        copyValue(button.dataset.copyTarget, button.dataset.copyRaw === 'true');
      });
    });

    document.getElementById('ai-form').addEventListener('submit', analyzeNutrition);
    document.getElementById('newsletter-form').addEventListener('submit', function (event) {
      event.preventDefault();
      event.currentTarget.reset();
      showToast('Đăng ký bản tin thành công. Cảm ơn bạn!', 'success');
    });

    var menuToggle = document.getElementById('menu-toggle');
    var mainNav = document.getElementById('main-nav');
    menuToggle.addEventListener('click', function () {
      var opened = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(opened));
    });
    mainNav.addEventListener('click', function (event) {
      if (!event.target.closest('a')) return;
      mainNav.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    });

    var accountMenu = document.getElementById('account-menu');
    document.getElementById('account-menu-button').addEventListener('click', function (event) {
      event.stopPropagation();
      var opened = accountMenu.classList.toggle('open');
      event.currentTarget.setAttribute('aria-expanded', String(opened));
    });
    document.addEventListener('click', function (event) {
      if (!event.target.closest('#account-menu')) accountMenu.classList.remove('open');
    });
    document.getElementById('header-logout').addEventListener('click', async function () {
      await NMAuth.logout();
      renderAccount();
      showToast('Bạn đã đăng xuất.', 'success');
    });
    window.addEventListener('storage', function () {
      products = NM.getProducts();
      cart = NM.getCart();
      renderProducts();
      renderCart();
    });
  }

  async function initializeStore() {
    renderCategories();
    renderProducts();
    renderCart();
    selectPaymentOption();
    bindEvents();
    try {
      await NMAuth.ready;
      renderAccount();
      await loadPaymentSettings();
      var query = new URLSearchParams(location.search);
      if (query.get('resumeCheckout') === '1' && cart.length) openCheckout();
    } catch (error) {
      renderAccount();
      updatePaymentOption();
    }
  }

  initializeStore();
}());
