(function () {
  'use strict';

  var products = NM.getProducts();
  var cart = NM.getCart();
  var visibleCount = 12;
  var activeCategory = 'all';
  var productGrid = document.getElementById('product-grid');
  var productEmpty = document.getElementById('product-empty');
  var categoryFilter = document.getElementById('category-filter');
  var productSearch = document.getElementById('product-search');
  var sortProducts = document.getElementById('sort-products');
  var loadMore = document.getElementById('load-more');
  var cartDrawer = document.getElementById('cart-drawer');
  var overlay = document.getElementById('overlay');
  var toastTimer;

  function renderCategories() {
    var grid = document.getElementById('category-grid');
    grid.innerHTML = NM.categories.map(function (category) {
      return '<button class="category-card" data-category="' + category.slug + '"><span style="background:' + category.color + '">' + category.emoji + '</span><strong>' + NM.escape(category.name) + '</strong><small>' + category.count + ' sản phẩm</small></button>';
    }).join('');

    categoryFilter.innerHTML = '<option value="all">Tất cả danh mục</option>' + NM.categories.map(function (category) {
      return '<option value="' + category.slug + '">' + NM.escape(category.name) + '</option>';
    }).join('');

    grid.addEventListener('click',function (event) {
      var button = event.target.closest('[data-category]');
      if (!button) return;
      activeCategory = button.dataset.category;
      categoryFilter.value = activeCategory;
      visibleCount = 12;
      renderProducts();
      document.getElementById('products').scrollIntoView({behavior:'smooth'});
    });
  }

  function filteredProducts() {
    var search = productSearch.value.trim().toLocaleLowerCase('vi');
    var result = products.filter(function (product) {
      var matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      var haystack = (product.name + ' ' + product.sku).toLocaleLowerCase('vi');
      return product.status === 'active' && matchesCategory && (!search || haystack.indexOf(search) !== -1);
    });
    if (sortProducts.value === 'price-asc') result.sort(function (a,b) { return a.price - b.price; });
    if (sortProducts.value === 'price-desc') result.sort(function (a,b) { return b.price - a.price; });
    if (sortProducts.value === 'protein') result.sort(function (a,b) { return b.protein - a.protein; });
    if (sortProducts.value === 'featured') result.sort(function (a,b) { return Number(b.healthy) - Number(a.healthy) || a.id - b.id; });
    return result;
  }

  function renderProducts() {
    var filtered = filteredProducts();
    var shown = filtered.slice(0,visibleCount);
    productGrid.innerHTML = shown.map(function (product,index) {
      return '<article class="product-card"><div class="product-image" style="--product-bg:' + product.color + '"><span>' + product.emoji + '</span>' +
        (product.healthy ? '<b class="product-badge">HEALTHY</b>' : (index < 3 ? '<b class="product-badge">NỔI BẬT</b>' : '')) +
        '<button class="product-wish" title="Yêu thích">♡</button></div><div class="product-body"><span class="product-category">' + NM.escape(product.categoryName) + '</span><h3>' + NM.escape(product.name) + '</h3>' +
        '<div class="nutrition-chips"><span>' + product.calories + ' kcal</span><span>' + product.protein + 'g protein</span><span>' + product.fiber + 'g xơ</span></div>' +
        '<div class="product-foot"><div class="price"><strong>' + NM.formatMoney(product.price) + '</strong>' + (product.oldPrice ? '<small>' + NM.formatMoney(product.oldPrice) + '</small>' : '') + '</div>' +
        '<button class="add-cart" data-add-cart="' + product.id + '" title="Thêm vào giỏ">＋</button></div></div></article>';
    }).join('');
    productEmpty.hidden = filtered.length > 0;
    loadMore.style.display = filtered.length > visibleCount ? 'flex' : 'none';
  }

  function addToCart(id) {
    var product = products.find(function (item) { return item.id === id; });
    if (!product || product.stock < 1) return;
    var existing = cart.find(function (item) { return item.id === id; });
    if (existing) existing.quantity = Math.min(existing.quantity + 1,product.stock);
    else cart.push({id:product.id,quantity:1});
    saveCart();
    showToast('Đã thêm “' + product.name + '” vào giỏ hàng.','success');
  }

  function saveCart() {
    NM.setCart(cart);
    renderCart();
  }

  function cartDetails() {
    return cart.map(function (line) {
      var product = products.find(function (item) { return item.id === line.id; });
      return product ? Object.assign({},product,{quantity:line.quantity}) : null;
    }).filter(Boolean);
  }

  function renderCart() {
    var details = cartDetails();
    var quantity = details.reduce(function (sum,item) { return sum + item.quantity; },0);
    var total = details.reduce(function (sum,item) { return sum + item.price * item.quantity; },0);
    document.getElementById('cart-badge').textContent = quantity;
    document.getElementById('drawer-count').textContent = quantity + ' sản phẩm';
    document.getElementById('cart-total').textContent = NM.formatMoney(total);
    document.getElementById('checkout-total').textContent = NM.formatMoney(total);
    var container = document.getElementById('cart-items');
    var checkout = document.getElementById('checkout-button');
    checkout.disabled = details.length === 0;
    if (!details.length) {
      container.innerHTML = '<div class="cart-empty"><div><span>🧺</span><h3>Giỏ hàng đang trống</h3><p>Thêm vài món ngon và lành mạnh nhé.</p></div></div>';
      return;
    }
    container.innerHTML = details.map(function (item) {
      return '<div class="cart-line" data-cart-line="' + item.id + '"><div class="cart-line-icon" style="background:' + item.color + '">' + item.emoji + '</div><div><h4>' + NM.escape(item.name) + '</h4><span class="cart-line-price">' + NM.formatMoney(item.price * item.quantity) + '</span><div class="qty-control"><button data-qty="minus">−</button><b>' + item.quantity + '</b><button data-qty="plus">+</button></div></div><button class="remove-cart" data-qty="remove">×</button></div>';
    }).join('');
  }

  function openCart() {
    cartDrawer.classList.add('open');
    overlay.classList.add('open');
    cartDrawer.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    cartDrawer.classList.remove('open');
    overlay.classList.remove('open');
    cartDrawer.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');
  }

  function showToast(text,type) {
    var toast = document.getElementById('toast');
    toast.textContent = text;
    toast.className = 'toast show ' + (type || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.className = 'toast'; },3000);
  }

  productGrid.addEventListener('click',function (event) {
    var button = event.target.closest('[data-add-cart]');
    if (button) addToCart(Number(button.dataset.addCart));
  });
  categoryFilter.addEventListener('change',function () { activeCategory=this.value;visibleCount=12;renderProducts(); });
  productSearch.addEventListener('input',function () { visibleCount=12;renderProducts(); });
  sortProducts.addEventListener('change',renderProducts);
  loadMore.addEventListener('click',function () { visibleCount += 12;renderProducts(); });
  document.getElementById('search-focus').addEventListener('click',function () { document.getElementById('products').scrollIntoView({behavior:'smooth'});setTimeout(function(){productSearch.focus();},450); });
  document.getElementById('open-cart').addEventListener('click',openCart);
  document.getElementById('close-cart').addEventListener('click',closeCart);
  overlay.addEventListener('click',closeCart);

  document.getElementById('cart-items').addEventListener('click',function (event) {
    var button = event.target.closest('[data-qty]');
    var line = event.target.closest('[data-cart-line]');
    if (!button || !line) return;
    var id = Number(line.dataset.cartLine);
    var item = cart.find(function (entry) { return entry.id === id; });
    var product = products.find(function (entry) { return entry.id === id; });
    if (!item) return;
    if (button.dataset.qty === 'plus') item.quantity = Math.min(item.quantity + 1,product.stock);
    if (button.dataset.qty === 'minus') item.quantity -= 1;
    if (button.dataset.qty === 'remove' || item.quantity < 1) cart = cart.filter(function (entry) { return entry.id !== id; });
    saveCart();
  });

  var checkoutModal = document.getElementById('checkout-modal');
  document.getElementById('checkout-button').addEventListener('click',function () { closeCart();checkoutModal.showModal(); });
  document.getElementById('close-checkout').addEventListener('click',function () { checkoutModal.close(); });
  document.getElementById('checkout-form').addEventListener('submit',function (event) {
    event.preventDefault();
    var details = cartDetails();
    if (!details.length) return;
    var data = new FormData(event.currentTarget);
    var orders = NM.getOrders();
    var now = new Date();
    var order = {
      id:'NM' + String(now.getTime()).slice(-6),createdAt:now.toISOString(),
      customer:{name:data.get('name'),phone:data.get('phone'),address:data.get('address')},
      payment:data.get('payment'),status:'on-hold',source:'Website',note:data.get('note'),
      items:details.map(function (item) { return {id:item.id,name:item.name,price:item.price,quantity:item.quantity,emoji:item.emoji}; }),
      total:details.reduce(function (sum,item) { return sum + item.price * item.quantity; },0)
    };
    orders.unshift(order);NM.setOrders(orders);
    details.forEach(function (line) { var product=products.find(function(item){return item.id===line.id;});if(product)product.stock=Math.max(0,product.stock-line.quantity); });
    NM.setProducts(products);cart=[];saveCart();renderProducts();checkoutModal.close();event.currentTarget.reset();
    showToast('Đặt hàng thành công! Mã đơn: ' + order.id,'success');
  });

  document.getElementById('ai-form').addEventListener('submit',function (event) {
    event.preventDefault();var data=new FormData(event.currentTarget);var age=Number(data.get('age'));var height=Number(data.get('height'));var weight=Number(data.get('weight'));var gender=data.get('gender');var activity=Number(data.get('activity'));var goal=data.get('goal');
    var bmi=weight/Math.pow(height/100,2);var bmr=10*weight+6.25*height-5*age+(gender==='male'?5:-161);var tdee=bmr*activity;var target=tdee+(goal==='lose'?-400:goal==='muscle'?300:0);var protein=weight*(goal==='muscle'?2:goal==='lose'?1.8:1.5);var classification=bmi<18.5?'Thiếu cân':bmi<23?'Bình thường':bmi<25?'Thừa cân':'Cần kiểm soát cân nặng';
    var result=document.getElementById('ai-result');result.hidden=false;result.innerHTML='<h4>Kết quả: '+classification+'</h4><div class="ai-result-grid"><div><strong>'+bmi.toFixed(1)+'</strong><small>BMI</small></div><div><strong>'+Math.round(bmr)+'</strong><small>BMR (kcal)</small></div><div><strong>'+Math.round(tdee)+'</strong><small>TDEE (kcal)</small></div><div><strong>'+Math.round(target)+'</strong><small>Kcal mục tiêu</small></div><div><strong>'+Math.round(protein)+'g</strong><small>Protein/ngày</small></div><div><strong>'+Math.round(target*.45/4)+'g</strong><small>Carb/ngày</small></div><div><strong>'+Math.round(target*.25/9)+'g</strong><small>Chất béo/ngày</small></div><div><strong>'+Math.round(weight*.4)+'g</strong><small>Chất xơ gợi ý</small></div></div>';
  });

  document.getElementById('newsletter-form').addEventListener('submit',function(event){event.preventDefault();showToast('Đăng ký nhận tin thành công!','success');event.currentTarget.reset();});
  document.getElementById('menu-toggle').addEventListener('click',function(){document.getElementById('main-nav').classList.toggle('open');});
  document.querySelectorAll('.main-nav a').forEach(function(link){link.addEventListener('click',function(){document.getElementById('main-nav').classList.remove('open');});});
  window.addEventListener('storage',function(){products=NM.getProducts();cart=NM.getCart();renderProducts();renderCart();});

  renderCategories();renderProducts();renderCart();
}());
