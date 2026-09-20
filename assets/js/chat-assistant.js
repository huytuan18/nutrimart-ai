(function () {
  'use strict';

  var launcher = document.getElementById('ai-chat-launcher');
  var panel = document.getElementById('ai-chat-panel');
  var closeButton = document.getElementById('ai-chat-close');
  var messages = document.getElementById('ai-chat-messages');
  var form = document.getElementById('ai-chat-form');
  var input = document.getElementById('ai-chat-input');
  var suggestions = document.getElementById('ai-chat-suggestions');
  if (!launcher || !panel || !messages || !form || !window.NM) return;

  var products = NM.getProducts().filter(function (product) { return product.status === 'active'; });
  var money = NM.formatMoney;
  var normalize = function (value) {
    return String(value || '').toLocaleLowerCase('vi').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };

  function addMessage(text, type) {
    var item = document.createElement('div');
    item.className = 'ai-chat-message ' + type;
    if (type === 'bot' && text.indexOf('<') >= 0) item.innerHTML = text;
    else item.textContent = text;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
  }

  function productList(list) {
    return list.slice(0, 3).map(function (product) {
      return '<div class="ai-product-result"><div><strong>' + NM.escape(product.name) + '</strong><small>' + money(product.price) + ' · ' + product.protein + 'g đạm · ' + product.calories + ' kcal</small></div><button type="button" data-chat-product="' + product.id + '">Xem</button></div>';
    }).join('');
  }

  function answer(question) {
    var text = normalize(question);
    var protein = text.indexOf('protein') >= 0 || text.indexOf('dam') >= 0 || text.indexOf('co bap') >= 0;
    var lowSugar = text.indexOf('it duong') >= 0 || text.indexOf('tieu duong') >= 0 || text.indexOf('duong huyet') >= 0;
    var loseWeight = text.indexOf('giam can') >= 0 || text.indexOf('giam mo') >= 0 || text.indexOf('diet') >= 0;
    var vegetarian = text.indexOf('chay') >= 0 || text.indexOf('thuc vat') >= 0;
    var result = products.slice();
    if (protein) result = result.filter(function (p) { return p.protein >= 12; }).sort(function (a, b) { return b.protein - a.protein; });
    else if (lowSugar) result = result.filter(function (p) { return p.carbs <= 10 && p.category !== 'do-uong'; }).sort(function (a, b) { return a.carbs - b.carbs; });
    else if (vegetarian) result = result.filter(function (p) { return ['rau-cu-qua', 'trai-cay', 'thuc-pham-kho', 'do-uong'].indexOf(p.category) >= 0; }).sort(function (a, b) { return Number(b.healthy) - Number(a.healthy); });
    else if (loseWeight) result = result.filter(function (p) { return p.calories <= 180 && p.fiber >= 2; }).sort(function (a, b) { return b.fiber - a.fiber; });
    else {
      result = result.filter(function (p) { return normalize(p.name + ' ' + p.categoryName).indexOf(text) >= 0; });
      if (!result.length) result = products.filter(function (p) { return p.healthy; }).sort(function (a, b) { return b.protein - a.protein; });
    }
    var intro = protein ? 'Nếu bạn muốn tăng protein, tôi gợi ý:' :
      lowSugar ? 'Các lựa chọn ít carbohydrate hơn trong cửa hàng:' :
      vegetarian ? 'Một số lựa chọn có nguồn gốc thực vật:' :
      loseWeight ? 'Để hỗ trợ giảm cân, hãy ưu tiên khẩu phần giàu chất xơ và vừa năng lượng:' :
      'Tôi tìm được các lựa chọn phù hợp nhất:';
    if (!result.length) return 'Tôi chưa tìm thấy sản phẩm phù hợp với yêu cầu này. Bạn thử hỏi theo mục tiêu như “giàu protein”, “giảm cân”, “ít đường” hoặc “ăn chay” nhé.';
    return '<span>' + intro + '</span>' + productList(result) + '<span class="ai-chat-followup">Bạn muốn tôi lọc theo ngân sách, mục tiêu hay bữa ăn cụ thể nào nữa không?</span>';
  }

  function openChat() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    document.getElementById('ai-chat').classList.add('is-open');
    input.focus();
  }
  function closeChat() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    document.getElementById('ai-chat').classList.remove('is-open');
  }

  launcher.addEventListener('click', function () { panel.hidden ? openChat() : closeChat(); });
  closeButton.addEventListener('click', closeChat);
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var question = input.value.trim();
    if (!question) return;
    addMessage(question, 'user');
    input.value = '';
    window.setTimeout(function () { addMessage(answer(question), 'bot'); }, 220);
  });
  messages.addEventListener('click', function (event) {
    var button = event.target.closest('[data-chat-product]');
    if (!button) return;
    var product = products.find(function (item) { return item.id === Number(button.dataset.chatProduct); });
    if (!product) return;
    var search = document.getElementById('product-search');
    if (search) {
      search.value = product.name;
      search.dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
    closeChat();
  });
  document.querySelectorAll('[data-open-chat]').forEach(function (button) {
    button.addEventListener('click', openChat);
  });
  suggestions.addEventListener('click', function (event) {
    var button = event.target.closest('button');
    if (!button) return;
    input.value = button.textContent;
    form.requestSubmit();
  });
  addMessage('Xin chào! Tôi là NutriBot. Bạn đang muốn ăn lành mạnh, tăng cơ, giảm cân hay tìm một sản phẩm cụ thể?', 'bot');
}());
