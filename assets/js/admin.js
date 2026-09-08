(async function () {
  'use strict';

  var authorizedUser = await NMAuth.requireRole(['admin'],'man');
  if (!authorizedUser) return;

  var titles = {
    dashboard: ['Tổng quan', 'Theo dõi tình hình kinh doanh của cửa hàng.'],
    products: ['Hàng hóa', 'Quản lý danh mục, giá bán và thông tin dinh dưỡng.'],
    inventory: ['Tồn kho', 'Kiểm soát số lượng hàng hóa tại cửa hàng.'],
    purchases: ['Mua hàng', 'Quản lý phiếu nhập, đặt hàng và công nợ nhà cung cấp.'],
    orders: ['Đơn hàng', 'Theo dõi hóa đơn từ website và quầy thu ngân.'],
    customers: ['Khách hàng', 'Quản lý khách hàng và lịch sử mua hàng.'],
    staff: ['Nhân viên', 'Quản lý nhân viên, lịch làm việc và chấm công.'],
    cashbook: ['Sổ quỹ', 'Theo dõi toàn bộ phiếu thu, phiếu chi.'],
    reports: ['Báo cáo', 'Phân tích doanh thu và hàng hóa bán chạy.'],
    online: ['Bán hàng online', 'Theo dõi website và các kênh bán trực tuyến.'],
    accounting: ['Thuế & Kế toán', 'Tổng hợp chứng từ và số liệu thuế minh họa.'],
    settings: ['Thiết lập', 'Cấu hình cửa hàng và dữ liệu trình diễn.']
  };

  var products = [];
  var orders = [];
  var customers = [];
  var cashbook = [];
  var activeOrderStatus = 'all';
  var dashboardPeriod = 'today';
  var toastTimer;
  var adminApp = document.getElementById('admin-app');

  function imageThumb(url, emoji, className, alt) {
    return '<span class="' + className + '"><img src="' + NM.escape(url || '') + '" alt="' +
      NM.escape(alt || '') + '" loading="lazy" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><i hidden>' +
      (emoji || '🥗') + '</i></span>';
  }

  function setupCurrentUser() {
    var user = NMAuth.current();
    if (!user) return;
    var userInitials = initials(user.name);
    document.getElementById('admin-user-avatar').textContent = userInitials;
    document.getElementById('admin-user-name').textContent = user.name;
    document.getElementById('admin-user-role').textContent = NMAuth.roleLabel(user.role) + ' · Chi nhánh trung tâm';
  }

  function loadState() {
    products = NM.getProducts();
    orders = NM.getOrders();
    customers = NM.getCustomers();
    cashbook = NM.getCashbook ? NM.getCashbook() : [];
    renderAll();
  }

  function saveProducts() {
    NM.setProducts(products);
    renderAll();
  }

  function saveOrders() {
    NM.setOrders(orders);
    renderAll();
  }

  function saveCustomers() {
    NM.setCustomers(customers);
    renderAll();
  }

  function saveCashbook() {
    if (NM.setCashbook) NM.setCashbook(cashbook);
    renderAll();
  }

  function dateKey(value) {
    var date = new Date(value);
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  }

  function shortDate(value) {
    return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value));
  }

  function dateTime(value) {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(value));
  }

  function initials(name) {
    return String(name || 'K').trim().split(/\s+/).slice(-2).map(function (part) {
      return part.charAt(0);
    }).join('').toUpperCase();
  }

  function validOrders() {
    return orders.filter(function (order) {
      return order.status !== 'cancelled';
    });
  }

  function totalRevenue(list) {
    return list.reduce(function (sum, order) {
      return sum + Number(order.total || 0);
    }, 0);
  }

  function showToast(message, type) {
    var toast = document.getElementById('admin-toast');
    toast.textContent = message;
    toast.className = 'admin-toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.className = 'admin-toast';
    }, 2800);
  }

  function navigate(page) {
    if (!titles[page]) page = 'dashboard';
    document.querySelectorAll('.admin-page').forEach(function (section) {
      section.classList.toggle('active', section.dataset.adminPage === page);
    });
    document.querySelectorAll('[data-page]').forEach(function (button) {
      button.classList.toggle('active', button.dataset.page === page);
    });
    document.getElementById('page-title').textContent = titles[page][0];
    document.getElementById('page-subtitle').textContent = titles[page][1];
    document.getElementById('breadcrumb-current').textContent = titles[page][0];
    document.title = 'NutriMart AI - ' + titles[page][0];
    location.hash = page;
    adminApp.classList.remove('menu-open');
    if (page === 'dashboard' || page === 'reports' || page === 'cashbook') renderAll();
  }

  document.addEventListener('click', function (event) {
    var pageButton = event.target.closest('[data-page]');
    var goButton = event.target.closest('[data-go]');
    var demoButton = event.target.closest('[data-demo-action]');
    if (pageButton) navigate(pageButton.dataset.page);
    if (goButton) navigate(goButton.dataset.go);
    if (demoButton) showToast(demoButton.dataset.demoAction, 'success');
  });

  var demoFooterClose = document.querySelector('.demo-footer > button');
  if (demoFooterClose) {
    demoFooterClose.addEventListener('click', function () {
      document.querySelector('.demo-footer').remove();
      document.getElementById('admin-app').style.paddingBottom = '0';
    });
  }

  window.addEventListener('hashchange', function () {
    navigate(location.hash.slice(1));
  });

  document.getElementById('sidebar-toggle').addEventListener('click', function () {
    adminApp.classList.toggle('menu-open');
  });

  document.getElementById('sidebar-overlay').addEventListener('click', function () {
    adminApp.classList.remove('menu-open');
  });

  document.getElementById('admin-user-button').addEventListener('click', function (event) {
    event.stopPropagation();
    document.querySelector('.utility-user-wrap').classList.toggle('open');
  });
  document.getElementById('admin-logout').addEventListener('click', async function () {
    await NMAuth.logout();
    window.top.location.replace(NMAuth.rootUrl('auth.html'));
  });
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.utility-user-wrap')) document.querySelector('.utility-user-wrap').classList.remove('open');
  });

  document.querySelectorAll('.period-tabs button').forEach(function (button, index) {
    button.addEventListener('click', function () {
      dashboardPeriod = ['today', 'yesterday', 'week'][index];
      document.querySelectorAll('.period-tabs button').forEach(function (item) {
        item.classList.toggle('active', item === button);
      });
      renderDashboard();
    });
  });

  function statusHtml(status) {
    return '<span class="status ' + (NM.orderStatusClass[status] || 'gray') + '">' +
      NM.escape(NM.orderStatus[status] || status) + '</span>';
  }

  function productCell(product) {
    return '<div class="product-cell">' + imageThumb(product.image, product.emoji, 'product-cell-icon', product.name) +
      '<div><strong>' + NM.escape(product.name) + '</strong><small>' +
      NM.escape(product.sku) + '</small></div></div>';
  }

  function statCard(color, icon, label, value, note) {
    return '<article class="stat-card"><span class="stat-icon ' + color + '">' + icon +
      '</span><div><small>' + label + '</small><strong>' + value + '</strong><em>' + note + '</em></div></article>';
  }

  function lastSevenDays() {
    var result = [];
    for (var index = 6; index >= 0; index -= 1) {
      var date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - index);
      var key = dateKey(date);
      var dayOrders = validOrders().filter(function (order) {
        return dateKey(order.createdAt) === key;
      });
      result.push({
        date: date,
        key: key,
        label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
        orders: dayOrders,
        revenue: totalRevenue(dayOrders),
        items: dayOrders.reduce(function (sum, order) {
          return sum + order.items.reduce(function (quantity, item) {
            return quantity + item.quantity;
          }, 0);
        }, 0)
      });
    }
    return result;
  }

  function chartHtml(days) {
    var max = Math.max.apply(null, days.map(function (day) {
      return day.revenue;
    }).concat([1]));
    return days.map(function (day) {
      var height = Math.max(4, Math.round(day.revenue / max * 100));
      return '<div class="chart-column"><b style="height:' + height + '%"><i>' +
        NM.formatMoney(day.revenue) + '</i></b><span>' + day.label + '</span></div>';
    }).join('');
  }

  function periodOrders() {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dashboardPeriod === 'today') {
      return validOrders().filter(function (order) {
        return dateKey(order.createdAt) === dateKey(today);
      });
    }
    if (dashboardPeriod === 'yesterday') {
      var yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return validOrders().filter(function (order) {
        return dateKey(order.createdAt) === dateKey(yesterday);
      });
    }
    var firstDay = new Date(today);
    firstDay.setDate(firstDay.getDate() - 6);
    return validOrders().filter(function (order) {
      return new Date(order.createdAt) >= firstDay;
    });
  }

  function renderDashboard() {
    var selectedOrders = periodOrders();
    var pending = orders.filter(function (order) {
      return order.status === 'on-hold' || order.status === 'processing';
    }).length;
    var sold = selectedOrders.reduce(function (sum, order) {
      return sum + order.items.reduce(function (quantity, item) {
        return quantity + item.quantity;
      }, 0);
    }, 0);
    var periodLabel = dashboardPeriod === 'today' ? 'Trong ngày hôm nay' : dashboardPeriod === 'yesterday' ? 'Trong ngày hôm qua' : 'Trong 7 ngày gần nhất';

    document.getElementById('today-label').textContent = new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date());
    document.getElementById('pending-badge').textContent = pending;
    document.getElementById('dashboard-stats').innerHTML =
      statCard('blue', '₫', 'Doanh thu', NM.formatMoney(totalRevenue(selectedOrders)), periodLabel) +
      statCard('green', '▤', 'Hóa đơn', selectedOrders.length, pending + ' hóa đơn cần xử lý') +
      statCard('violet', '▣', 'Hàng hóa bán', sold, 'Tổng số lượng đã bán') +
      statCard('amber', '♙', 'Khách hàng', customers.length, 'Hồ sơ đang quản lý');

    document.getElementById('revenue-chart').innerHTML = chartHtml(lastSevenDays());
    var lowStock = products.filter(function (product) {
      return product.stock <= 20;
    }).sort(function (first, second) {
      return first.stock - second.stock;
    }).slice(0, 6);
    document.getElementById('low-stock-list').innerHTML = lowStock.map(function (product) {
      return '<div class="mini-list-item">' + imageThumb(product.image, product.emoji, 'mini-icon', product.name) + '<div><strong>' +
        NM.escape(product.name) + '</strong><small>' + NM.escape(product.sku) + ' · ' +
        NM.escape(product.categoryName) + '</small></div><b>' + product.stock + '</b></div>';
    }).join('') || '<div class="no-results">Tồn kho đang ổn định.</div>';

    document.getElementById('recent-orders').innerHTML = orders.slice(0, 7).map(function (order) {
      return '<tr><td><strong>#' + NM.escape(order.id) + '</strong></td><td><strong>' +
        NM.escape(order.customer.name) + '</strong><small>' + NM.escape(order.customer.phone || '') +
        '</small></td><td>' + dateTime(order.createdAt) + '</td><td>' + NM.escape(order.source) +
        '</td><td><strong>' + NM.formatMoney(order.total) + '</strong></td><td>' +
        statusHtml(order.status) + '</td></tr>';
    }).join('');
  }

  function categoryOptions(selected) {
    return NM.categories.map(function (category) {
      return '<option value="' + category.slug + '" ' + (selected === category.slug ? 'selected' : '') + '>' +
        NM.escape(category.name) + '</option>';
    }).join('');
  }

  function renderCategoryOptions() {
    var filter = document.getElementById('admin-category-filter');
    var current = filter.value || 'all';
    filter.innerHTML = '<option value="all">Tất cả nhóm hàng</option>' + categoryOptions(current);
    filter.value = current;
    document.getElementById('product-category-input').innerHTML = categoryOptions();
  }

  function renderProductsTable() {
    var term = document.getElementById('product-admin-search').value.trim().toLocaleLowerCase('vi');
    var category = document.getElementById('admin-category-filter').value;
    var filtered = products.filter(function (product) {
      return (category === 'all' || product.category === category) &&
        (!term || (product.name + ' ' + product.sku).toLocaleLowerCase('vi').includes(term));
    });
    document.getElementById('product-table-count').textContent = filtered.length + ' hàng hóa';
    document.getElementById('products-table').innerHTML = filtered.map(function (product) {
      return '<tr><td>' + productCell(product) + '</td><td>' + NM.escape(product.sku) +
        '</td><td>' + NM.escape(product.categoryName) + '</td><td><strong>' +
        NM.formatMoney(product.price) + '</strong></td><td><strong>' + product.stock +
        '</strong></td><td><span class="status ' + (product.status === 'active' ? 'green' : 'gray') + '">' +
        (product.status === 'active' ? 'Đang kinh doanh' : 'Ngừng kinh doanh') +
        '</span></td><td><button class="row-action" type="button" data-edit-product="' +
        product.id + '">Chi tiết</button></td></tr>';
    }).join('') || '<tr><td colspan="7"><div class="no-results">Không tìm thấy hàng hóa.</div></td></tr>';
  }

  document.getElementById('product-admin-search').addEventListener('input', renderProductsTable);
  document.getElementById('admin-category-filter').addEventListener('change', renderProductsTable);

  var productModal = document.getElementById('product-modal');

  function openProductModal(product) {
    var form = document.getElementById('product-form');
    form.reset();
    form.elements.id.value = product ? product.id : '';
    document.getElementById('product-modal-title').textContent = product ? 'Cập nhật hàng hóa' : 'Thêm hàng hóa';
    if (product) {
      ['name', 'sku', 'category', 'price', 'stock', 'calories', 'protein', 'fiber', 'emoji', 'image'].forEach(function (key) {
        form.elements[key].value = product[key];
      });
    } else {
      form.elements.category.value = NM.categories[0].slug;
      form.elements.emoji.value = '🥗';
      form.elements.image.value = NM.categories[0].image || '';
    }
    productModal.showModal();
  }

  document.getElementById('add-product-button').addEventListener('click', function () {
    openProductModal(null);
  });

  document.getElementById('products-table').addEventListener('click', function (event) {
    var button = event.target.closest('[data-edit-product]');
    if (button) {
      openProductModal(products.find(function (product) {
        return product.id === Number(button.dataset.editProduct);
      }));
    }
  });

  document.getElementById('product-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(event.currentTarget);
    var id = Number(data.get('id'));
    var category = NM.categories.find(function (item) {
      return item.slug === data.get('category');
    });
    var product = id ? products.find(function (item) {
      return item.id === id;
    }) : null;
    var duplicate = products.some(function (item) {
      return item.sku.toLocaleLowerCase('vi') === String(data.get('sku')).toLocaleLowerCase('vi') && item.id !== id;
    });
    if (duplicate) {
      showToast('Mã hàng đã tồn tại.', 'error');
      return;
    }
    var values = {
      name: data.get('name'),
      sku: data.get('sku'),
      category: category.slug,
      categoryName: category.name,
      color: category.color,
      emoji: data.get('emoji'),
      image: data.get('image') || category.image,
      price: Number(data.get('price')),
      stock: Number(data.get('stock')),
      calories: Number(data.get('calories')),
      protein: Number(data.get('protein')),
      fiber: Number(data.get('fiber')),
      carbs: product ? product.carbs : 0,
      fat: product ? product.fat : 0,
      healthy: product ? product.healthy : true,
      goal: product ? product.goal : 'healthy',
      oldPrice: product ? product.oldPrice : 0,
      status: 'active'
    };
    if (product) {
      Object.assign(product, values);
    } else {
      products.unshift(Object.assign({
        id: Math.max.apply(null, products.map(function (item) { return item.id; }).concat([0])) + 1
      }, values));
    }
    saveProducts();
    productModal.close();
    showToast('Đã lưu hàng hóa thành công.', 'success');
  });

  function renderInventory() {
    var totalQuantity = products.reduce(function (sum, product) {
      return sum + product.stock;
    }, 0);
    var low = products.filter(function (product) {
      return product.stock > 0 && product.stock <= 20;
    }).length;
    var out = products.filter(function (product) {
      return product.stock === 0;
    }).length;
    document.getElementById('inventory-stats').innerHTML =
      statCard('blue', '▣', 'Tổng tồn kho', totalQuantity.toLocaleString('vi-VN'), products.length + ' mã hàng') +
      statCard('amber', '!', 'Sắp hết hàng', low, 'Còn tối đa 20 đơn vị') +
      statCard('red', '×', 'Hết hàng', out, 'Cần nhập thêm');

    var term = document.getElementById('inventory-search').value.trim().toLocaleLowerCase('vi');
    var filtered = products.filter(function (product) {
      return !term || (product.name + ' ' + product.sku).toLocaleLowerCase('vi').includes(term);
    }).sort(function (first, second) {
      return first.stock - second.stock;
    });
    document.getElementById('inventory-table').innerHTML = filtered.map(function (product) {
      var level = product.stock === 0 ? ['red', 'Hết hàng'] : product.stock <= 20 ? ['amber', 'Sắp hết'] : ['green', 'Ổn định'];
      return '<tr><td>' + productCell(product) + '</td><td>' + NM.escape(product.sku) +
        '</td><td>' + NM.escape(product.categoryName) + '</td><td><strong>' + product.stock +
        '</strong></td><td><span class="status ' + level[0] + '">' + level[1] +
        '</span></td><td>' + NM.formatMoney(product.stock * product.price) +
        '</td><td><button class="row-action" type="button" data-inventory-edit="' + product.id +
        '">Cập nhật</button></td></tr>';
    }).join('');
  }

  document.getElementById('inventory-search').addEventListener('input', renderInventory);
  document.getElementById('inventory-table').addEventListener('click', function (event) {
    var button = event.target.closest('[data-inventory-edit]');
    if (button) {
      openProductModal(products.find(function (product) {
        return product.id === Number(button.dataset.inventoryEdit);
      }));
    }
  });

  function renderOrders() {
    var term = document.getElementById('order-search').value.trim().toLocaleLowerCase('vi');
    var filtered = orders.filter(function (order) {
      var text = (order.id + ' ' + order.customer.name + ' ' + order.customer.phone).toLocaleLowerCase('vi');
      return (activeOrderStatus === 'all' || order.status === activeOrderStatus) && (!term || text.includes(term));
    });
    document.getElementById('orders-table').innerHTML = filtered.map(function (order) {
      return '<tr><td><strong>#' + NM.escape(order.id) + '</strong></td><td><strong>' +
        NM.escape(order.customer.name) + '</strong><small>' + NM.escape(order.customer.phone || '') +
        '</small></td><td>' + dateTime(order.createdAt) + '</td><td>' + NM.escape(order.source) +
        '</td><td>' + NM.escape(order.payment) + '</td><td><strong>' + NM.formatMoney(order.total) +
        '</strong></td><td>' + statusHtml(order.status) +
        '</td><td><button class="row-action" type="button" data-view-order="' + NM.escape(order.id) +
        '">Mở</button></td></tr>';
    }).join('') || '<tr><td colspan="8"><div class="no-results">Không có hóa đơn phù hợp.</div></td></tr>';
  }

  document.getElementById('order-search').addEventListener('input', renderOrders);
  document.getElementById('order-tabs').addEventListener('click', function (event) {
    var button = event.target.closest('[data-status]');
    if (!button) return;
    activeOrderStatus = button.dataset.status;
    document.querySelectorAll('#order-tabs button').forEach(function (item) {
      item.classList.toggle('active', item === button);
    });
    renderOrders();
  });

  var orderModal = document.getElementById('order-modal');

  function openOrder(id) {
    var order = orders.find(function (item) {
      return item.id === id;
    });
    if (!order) return;
    document.getElementById('order-detail').innerHTML =
      '<div class="order-detail-head"><div><h2>Hóa đơn #' + NM.escape(order.id) +
      '</h2><small>' + dateTime(order.createdAt) + ' · ' + NM.escape(order.source) +
      '</small></div>' + statusHtml(order.status) + '</div>' +
      '<div class="order-info-grid"><div><span>Khách hàng</span><strong>' +
      NM.escape(order.customer.name) + '</strong></div><div><span>Số điện thoại</span><strong>' +
      NM.escape(order.customer.phone || '—') + '</strong></div><div><span>Địa chỉ</span><strong>' +
      NM.escape(order.customer.address || 'Mua tại quầy') + '</strong></div><div><span>Thanh toán</span><strong>' +
      NM.escape(order.payment) + '</strong></div></div>' +
      '<div class="order-detail-items">' + order.items.map(function (item) {
        return '<div class="order-detail-line"><span class="order-detail-product">' + imageThumb(item.image, item.emoji, 'order-detail-thumb', item.name) + '<b>' + NM.escape(item.name) +
          ' × ' + item.quantity + '</b></span><strong>' + NM.formatMoney(item.price * item.quantity) + '</strong></div>';
      }).join('') + '</div><div class="order-detail-total"><span>Tổng thanh toán</span><strong>' +
      NM.formatMoney(order.total) + '</strong></div><div class="order-status-actions">' +
      '<button type="button" data-set-order="on-hold" data-id="' + NM.escape(order.id) + '">Chờ xác nhận</button>' +
      '<button type="button" data-set-order="processing" data-id="' + NM.escape(order.id) + '">Đang xử lý</button>' +
      '<button type="button" data-set-order="completed" data-id="' + NM.escape(order.id) + '">Hoàn thành</button>' +
      '<button type="button" data-set-order="cancelled" data-id="' + NM.escape(order.id) + '">Hủy hóa đơn</button></div>';
    orderModal.showModal();
  }

  document.getElementById('orders-table').addEventListener('click', function (event) {
    var button = event.target.closest('[data-view-order]');
    if (button) openOrder(button.dataset.viewOrder);
  });

  document.getElementById('order-detail').addEventListener('click', function (event) {
    var button = event.target.closest('[data-set-order]');
    if (!button) return;
    var order = orders.find(function (item) {
      return item.id === button.dataset.id;
    });
    if (order) {
      order.status = button.dataset.setOrder;
      saveOrders();
      orderModal.close();
      showToast('Đã cập nhật trạng thái hóa đơn.', 'success');
    }
  });

  function customerOrders(customer) {
    return orders.filter(function (order) {
      return (order.customer.phone && order.customer.phone === customer.phone) || order.customer.name === customer.name;
    });
  }

  function renderCustomers() {
    var term = document.getElementById('customer-search').value.trim().toLocaleLowerCase('vi');
    var filtered = customers.filter(function (customer) {
      return !term || (customer.name + ' ' + customer.phone + ' ' + customer.email).toLocaleLowerCase('vi').includes(term);
    });
    document.getElementById('customers-table').innerHTML = filtered.map(function (customer) {
      var list = customerOrders(customer);
      return '<tr><td><div class="customer-cell"><span class="customer-avatar">' + initials(customer.name) +
        '</span><div><strong>' + NM.escape(customer.name) + '</strong><small>Mã KH' +
        String(customer.id).padStart(4, '0') + '</small></div></div></td><td>' +
        NM.escape(customer.phone || '—') + '</td><td>' + NM.escape(customer.email || '—') +
        '</td><td>' + NM.escape(customer.address || '—') + '</td><td><strong>' + list.length +
        '</strong></td><td><strong>' + NM.formatMoney(totalRevenue(list)) +
        '</strong></td><td><button class="row-action" type="button" data-delete-customer="' +
        customer.id + '">Xóa</button></td></tr>';
    }).join('') || '<tr><td colspan="7"><div class="no-results">Chưa có khách hàng.</div></td></tr>';
  }

  document.getElementById('customer-search').addEventListener('input', renderCustomers);
  var customerModal = document.getElementById('customer-modal');

  document.getElementById('add-customer-button').addEventListener('click', function () {
    document.getElementById('customer-form').reset();
    customerModal.showModal();
  });

  document.getElementById('customer-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(event.currentTarget);
    customers.unshift({
      id: Math.max.apply(null, customers.map(function (item) { return item.id; }).concat([0])) + 1,
      name: data.get('name'),
      phone: data.get('phone'),
      email: data.get('email'),
      address: data.get('address'),
      createdAt: new Date().toISOString()
    });
    saveCustomers();
    customerModal.close();
    showToast('Đã thêm khách hàng.', 'success');
  });

  document.getElementById('customers-table').addEventListener('click', function (event) {
    var button = event.target.closest('[data-delete-customer]');
    if (button && confirm('Xóa khách hàng này?')) {
      customers = customers.filter(function (item) {
        return item.id !== Number(button.dataset.deleteCustomer);
      });
      saveCustomers();
    }
  });

  async function renderAccounts() {
    var users;
    try {
      users = await NMAuth.getUsers();
    } catch (error) {
      document.getElementById('accounts-table').innerHTML = '<tr><td colspan="6"><div class="no-results">' + NM.escape(error.message) + '</div></td></tr>';
      return;
    }
    var roleClass = {admin:'blue',staff:'green',customer:'violet'};
    var staffUsers = users.filter(function (user) { return user.role === 'admin' || user.role === 'staff'; });
    document.getElementById('staff-grid').innerHTML = staffUsers.map(function (user) {
      return '<article class="staff-card"><span class="staff-avatar ' + roleClass[user.role] + '">' + initials(user.name) +
        '</span><div><h3>' + NM.escape(user.name) + '</h3><p>' + NMAuth.roleLabel(user.role) + '</p><small>@' +
        NM.escape(user.username) + ' · ' + NM.escape(user.email) + '</small></div><b class="status ' +
        (user.active ? 'green' : 'gray') + '">' + (user.active ? 'Đang hoạt động' : 'Đã khóa') + '</b></article>';
    }).join('');
    document.getElementById('accounts-table').innerHTML = users.map(function (user) {
      return '<tr><td><div class="customer-cell"><span class="customer-avatar">' + initials(user.name) +
        '</span><div><strong>' + NM.escape(user.name) + '</strong><small>' + NM.escape(user.id) +
        '</small></div></div></td><td><strong>@' + NM.escape(user.username) + '</strong></td><td>' +
        NM.escape(user.email) + '</td><td><select class="role-select" data-account-role="' + NM.escape(user.id) + '" ' +
        (user.id === authorizedUser.id ? 'disabled' : '') + '><option value="customer" ' + (user.role === 'customer' ? 'selected' : '') +
        '>Khách hàng</option><option value="staff" ' + (user.role === 'staff' ? 'selected' : '') +
        '>Nhân viên</option><option value="admin" ' + (user.role === 'admin' ? 'selected' : '') + '>Quản trị viên</option></select></td><td><span class="status ' + (user.active ? 'green' : 'gray') + '">' +
        (user.active ? 'Hoạt động' : 'Đã khóa') + '</span></td><td><button class="row-action" type="button" data-toggle-account="' +
        NM.escape(user.id) + '" data-active="' + String(user.active) + '" ' + (user.id === authorizedUser.id ? 'disabled' : '') + '>' +
        (user.active ? 'Khóa' : 'Mở khóa') + '</button></td></tr>';
    }).join('');
  }

  document.getElementById('add-account-button').addEventListener('click', function () {
    renderAccounts();
    showToast('Đã tải lại tài khoản từ Supabase.', 'success');
  });
  document.getElementById('accounts-table').addEventListener('change', async function (event) {
    var select = event.target.closest('[data-account-role]');
    if (!select) return;
    select.disabled = true;
    try {
      await NMAuth.updateAccount(select.dataset.accountRole,{role:select.value});
      await renderAccounts();
      showToast('Đã cập nhật quyền tài khoản.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
      await renderAccounts();
    }
  });
  document.getElementById('accounts-table').addEventListener('click', async function (event) {
    var button = event.target.closest('[data-toggle-account]');
    if (!button || button.disabled) return;
    try {
      await NMAuth.updateAccount(button.dataset.toggleAccount,{active:button.dataset.active !== 'true'});
      await renderAccounts();
      showToast('Đã cập nhật trạng thái tài khoản.', 'success');
    } catch (error) {
      showToast(error.message, 'error');
    }
  });

  function renderCashbook() {
    var income = cashbook.filter(function (entry) {
      return entry.type === 'income';
    }).reduce(function (sum, entry) {
      return sum + Number(entry.amount);
    }, 0);
    var expense = cashbook.filter(function (entry) {
      return entry.type === 'expense';
    }).reduce(function (sum, entry) {
      return sum + Number(entry.amount);
    }, 0);
    document.getElementById('cashbook-stats').innerHTML =
      statCard('green', '+', 'Tổng thu', NM.formatMoney(income), 'Tất cả phiếu thu') +
      statCard('red', '−', 'Tổng chi', NM.formatMoney(expense), 'Tất cả phiếu chi') +
      statCard('blue', '₫', 'Tồn quỹ', NM.formatMoney(income - expense), cashbook.length + ' phiếu');

    var term = document.getElementById('cashbook-search').value.trim().toLocaleLowerCase('vi');
    var filtered = cashbook.filter(function (entry) {
      return !term || (entry.id + ' ' + entry.partner + ' ' + entry.reason).toLocaleLowerCase('vi').includes(term);
    });
    document.getElementById('cashbook-table').innerHTML = filtered.map(function (entry) {
      var isIncome = entry.type === 'income';
      return '<tr><td><strong>' + NM.escape(entry.id) + '</strong></td><td>' +
        dateTime(entry.createdAt) + '</td><td><span class="status ' + (isIncome ? 'green' : 'red') + '">' +
        (isIncome ? 'Phiếu thu' : 'Phiếu chi') + '</span></td><td>' + NM.escape(entry.partner) +
        '</td><td>' + NM.escape(entry.reason) + '</td><td><strong style="color:' +
        (isIncome ? '#159967' : '#d94b5b') + '">' + (isIncome ? '+' : '−') +
        NM.formatMoney(entry.amount) + '</strong></td><td><button class="row-action" type="button" data-delete-cash="' +
        NM.escape(entry.id) + '">Hủy phiếu</button></td></tr>';
    }).join('') || '<tr><td colspan="7"><div class="no-results">Chưa có phiếu thu chi.</div></td></tr>';
  }

  var cashbookModal = document.getElementById('cashbook-modal');

  function openCashbookModal(type) {
    var form = document.getElementById('cashbook-form');
    form.reset();
    form.elements.type.value = type;
    document.getElementById('cashbook-modal-title').textContent = type === 'income' ? 'Lập phiếu thu' : 'Lập phiếu chi';
    cashbookModal.showModal();
  }

  document.getElementById('add-income-button').addEventListener('click', function () {
    openCashbookModal('income');
  });

  document.getElementById('add-expense-button').addEventListener('click', function () {
    openCashbookModal('expense');
  });

  document.getElementById('cashbook-form').addEventListener('submit', function (event) {
    event.preventDefault();
    var data = new FormData(event.currentTarget);
    var type = data.get('type');
    cashbook.unshift({
      id: (type === 'income' ? 'PT' : 'PC') + String(Date.now()).slice(-6),
      type: type,
      createdAt: new Date().toISOString(),
      partner: data.get('partner'),
      reason: data.get('reason'),
      amount: Number(data.get('amount'))
    });
    saveCashbook();
    cashbookModal.close();
    showToast('Đã lưu phiếu vào sổ quỹ.', 'success');
  });

  document.getElementById('cashbook-search').addEventListener('input', renderCashbook);
  document.getElementById('cashbook-table').addEventListener('click', function (event) {
    var button = event.target.closest('[data-delete-cash]');
    if (button && confirm('Hủy phiếu thu chi này?')) {
      cashbook = cashbook.filter(function (entry) {
        return entry.id !== button.dataset.deleteCash;
      });
      saveCashbook();
    }
  });

  function renderReports() {
    var days = lastSevenDays();
    var revenue = days.reduce(function (sum, day) {
      return sum + day.revenue;
    }, 0);
    var count = days.reduce(function (sum, day) {
      return sum + day.orders.length;
    }, 0);
    var items = days.reduce(function (sum, day) {
      return sum + day.items;
    }, 0);
    document.getElementById('report-stats').innerHTML =
      statCard('blue', '₫', 'Doanh thu thuần', NM.formatMoney(revenue), '7 ngày gần nhất') +
      statCard('green', '▤', 'Hóa đơn', count, 'Không gồm hóa đơn hủy') +
      statCard('violet', '▣', 'Hàng hóa bán', items, 'Tổng số lượng');
    document.getElementById('report-chart').innerHTML = chartHtml(days);
    document.getElementById('report-table').innerHTML = days.slice().reverse().map(function (day) {
      return '<tr><td><strong>' + shortDate(day.date) + '</strong></td><td>' + day.orders.length +
        '</td><td>' + day.items + '</td><td><strong>' + NM.formatMoney(day.revenue) +
        '</strong></td><td>' + NM.formatMoney(day.orders.length ? day.revenue / day.orders.length : 0) + '</td></tr>';
    }).join('');

    var totals = {};
    validOrders().forEach(function (order) {
      order.items.forEach(function (item) {
        if (!totals[item.id]) {
          totals[item.id] = { id: item.id, name: item.name, emoji: item.emoji, image:item.image, quantity: 0, total: 0 };
        }
        totals[item.id].quantity += item.quantity;
        totals[item.id].total += item.quantity * item.price;
      });
    });
    document.getElementById('top-products').innerHTML = Object.values(totals)
      .sort(function (first, second) { return second.quantity - first.quantity; })
      .slice(0, 6)
      .map(function (item) {
        return '<div class="mini-list-item">' + imageThumb(item.image, item.emoji, 'mini-icon', item.name) +
          '<div><strong>' + NM.escape(item.name) + '</strong><small>' +
          NM.formatMoney(item.total) + '</small></div><b>' + item.quantity + ' bán</b></div>';
      }).join('');
  }

  document.getElementById('store-settings').addEventListener('submit', function (event) {
    event.preventDefault();
    showToast('Đã lưu thông tin cửa hàng.', 'success');
  });

  document.getElementById('reset-data').addEventListener('click', function () {
    if (confirm('Khôi phục dữ liệu mẫu? Các thay đổi trên trình duyệt này sẽ bị xóa.')) {
      NM.reset();
      loadState();
      showToast('Đã khôi phục dữ liệu mẫu.', 'success');
    }
  });

  document.querySelectorAll('[data-close-modal]').forEach(function (button) {
    button.addEventListener('click', function () {
      button.closest('dialog').close();
    });
  });

  document.getElementById('global-search').addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    var term = event.currentTarget.value.trim();
    if (!term) return;
    var product = products.find(function (item) {
      return (item.name + ' ' + item.sku).toLocaleLowerCase('vi').includes(term.toLocaleLowerCase('vi'));
    });
    if (product) {
      navigate('products');
      document.getElementById('product-admin-search').value = term;
      renderProductsTable();
    } else {
      navigate('orders');
      document.getElementById('order-search').value = term;
      renderOrders();
    }
  });

  window.addEventListener('storage', loadState);

  function renderAll() {
    renderCategoryOptions();
    renderDashboard();
    renderProductsTable();
    renderInventory();
    renderOrders();
    renderCustomers();
    renderCashbook();
    renderReports();
    renderAccounts();
    document.getElementById('setting-products').textContent = products.length;
    document.getElementById('setting-orders').textContent = orders.length;
    document.getElementById('setting-customers').textContent = customers.length;
  }

  setupCurrentUser();
  loadState();
  navigate((location.hash || '#dashboard').slice(1));
}());
