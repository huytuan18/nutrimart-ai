(async function () {
  'use strict';

  var user = await NMAuth.requireRole(['admin','staff','customer'],'account');
  if (!user) return;
  var allOrders = NM.getOrders();
  var toastTimer;

  function initials(name) {
    return String(name || 'KH').trim().split(/\s+/).slice(-2).map(function (part) { return part.charAt(0); }).join('').toUpperCase();
  }

  function ownOrders() {
    return allOrders.filter(function (order) {
      return order.userId === user.id ||
        (user.phone && order.customer && order.customer.phone === user.phone) ||
        (user.email && order.customer && order.customer.email === user.email);
    });
  }

  function status(statusCode) {
    return '<span class="status ' + (NM.orderStatusClass[statusCode] || 'blue') + '">' + NM.escape(NM.orderStatus[statusCode] || statusCode) + '</span>';
  }

  function orderHtml(order) {
    var photos = order.items.slice(0, 3).map(function (item) {
      return item.image ? '<img src="' + NM.escape(item.image) + '" alt="">' : '<span>' + (item.emoji || '🥗') + '</span>';
    }).join('');
    if (order.items.length > 3) photos += '<span>+' + (order.items.length - 3) + '</span>';
    return '<article class="order-card"><div class="order-code"><strong>#' + NM.escape(order.id) + '</strong><small>' +
      new Intl.DateTimeFormat('vi-VN',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(order.createdAt)) +
      ' · ' + NM.escape(order.payment) + '</small></div><div class="order-products">' + photos + '</div><div class="order-summary">' +
      status(order.status) + '<strong>' + NM.formatMoney(order.total) + '</strong></div></article>';
  }

  function emptyHtml() {
    return '<div class="empty-orders"><span>🧺</span><h3>Bạn chưa có đơn hàng</h3><p>Hãy chọn sản phẩm tại cửa hàng và đặt đơn đầu tiên.</p></div>';
  }

  function renderOrders() {
    var orders = ownOrders();
    document.getElementById('order-count-badge').textContent = orders.length;
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-spent').textContent = NM.formatMoney(orders.filter(function (order) { return order.status !== 'cancelled'; }).reduce(function (sum, order) { return sum + Number(order.total); }, 0));
    document.getElementById('stat-pending').textContent = orders.filter(function (order) { return order.status === 'on-hold' || order.status === 'processing'; }).length;
    document.getElementById('recent-account-orders').innerHTML = orders.length ? orders.slice(0, 4).map(orderHtml).join('') : emptyHtml();
    var selected = document.getElementById('account-order-filter').value;
    var filtered = orders.filter(function (order) { return selected === 'all' || order.status === selected; });
    document.getElementById('all-account-orders').innerHTML = filtered.length ? filtered.map(orderHtml).join('') : emptyHtml();
  }

  function showTab(tab) {
    document.querySelectorAll('[data-account-tab]').forEach(function (button) { button.classList.toggle('active', button.dataset.accountTab === tab); });
    document.querySelectorAll('[data-account-view]').forEach(function (view) { view.classList.toggle('active', view.dataset.accountView === tab); });
  }

  function showToast(message) {
    var toast = document.getElementById('account-toast');
    toast.textContent = message;
    toast.className = 'account-toast show';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.className = 'account-toast'; }, 2800);
  }

  function fillProfile() {
    document.getElementById('welcome-name').textContent = user.name;
    document.getElementById('welcome-avatar').textContent = initials(user.name);
    document.getElementById('welcome-role').textContent = NMAuth.roleLabel(user.role);
    var form = document.getElementById('profile-form');
    form.elements.name.value = user.name || '';
    form.elements.username.value = user.username || '';
    form.elements.email.value = user.email || '';
    form.elements.phone.value = user.phone || '';
    form.elements.address.value = user.address || '';
    var workspace = document.getElementById('workspace-link');
    if (user.role === 'admin') { workspace.hidden = false; workspace.href = 'man/#/DashBoard'; workspace.textContent = 'Trang quản lý'; }
    if (user.role === 'staff') { workspace.hidden = false; workspace.href = 'sale/#/'; workspace.textContent = 'Màn hình bán hàng'; }
  }

  document.querySelectorAll('[data-account-tab]').forEach(function (button) { button.addEventListener('click', function () { showTab(button.dataset.accountTab); }); });
  document.querySelector('[data-show-orders]').addEventListener('click', function () { showTab('orders'); });
  document.getElementById('account-order-filter').addEventListener('change', renderOrders);
  document.getElementById('profile-form').addEventListener('submit', async function (event) {
    event.preventDefault();
    try {
      user = await NMAuth.updateProfile({name:event.currentTarget.elements.name.value,phone:event.currentTarget.elements.phone.value,address:event.currentTarget.elements.address.value});
      fillProfile();
      showToast('Đã lưu thông tin cá nhân.');
    } catch (error) {
      showToast(error.message);
    }
  });
  document.getElementById('account-logout').addEventListener('click', async function () { await NMAuth.logout(); location.replace('index.html'); });
  window.addEventListener('storage', function () { allOrders = NM.getOrders(); renderOrders(); });

  fillProfile();
  renderOrders();
}());
