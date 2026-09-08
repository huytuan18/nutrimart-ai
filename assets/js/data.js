(function () {
  'use strict';

  var categories = [
    {slug:'rau-cu-qua',name:'Rau củ quả',emoji:'🥦',color:'#e2f4e8',cal:32,protein:2.3,carbs:6.2,fat:.3,fiber:2.8,price:24000,names:['Bông cải xanh hữu cơ','Cải bó xôi baby','Cà rốt Đà Lạt','Cà chua bi đỏ','Khoai lang mật','Bí đỏ hồ lô','Măng tây xanh','Rau xà lách xoăn','Cải kale tươi','Ớt chuông ba màu','Dưa leo baby','Nấm đùi gà','Bắp ngọt hữu cơ']},
    {slug:'trai-cay',name:'Trái cây',emoji:'🍊',color:'#fff0dc',cal:58,protein:1,carbs:14,fat:.4,fiber:2.4,price:39000,names:['Cam vàng mọng nước','Táo xanh giòn','Chuối già Nam Mỹ','Bơ sáp cao nguyên','Dâu tây Đà Lạt','Nho đỏ không hạt','Kiwi xanh New Zealand','Thanh long ruột đỏ','Xoài cát chín','Lê Hàn Quốc','Dưa lưới ruột cam','Bưởi da xanh','Việt quất tươi']},
    {slug:'thit-gia-cam',name:'Thịt & gia cầm',emoji:'🍗',color:'#ffe8e1',cal:168,protein:24,carbs:0,fat:7,fiber:0,price:79000,names:['Ức gà phi lê','Đùi gà rút xương','Thăn bò mềm','Bắp bò Úc','Thịt heo thăn','Sườn non heo','Gà ta nguyên con','Ba chỉ bò cuộn','Thịt bò xay','Cánh gà tươi','Nạc vai heo','Ức vịt phi lê','Thịt bê mềm']},
    {slug:'ca-hai-san',name:'Cá & hải sản',emoji:'🐟',color:'#e1f1f7',cal:145,protein:21,carbs:0,fat:6.4,fiber:0,price:99000,names:['Cá hồi phi lê','Cá basa phi lê','Cá thu cắt khúc','Tôm sú tươi','Mực ống làm sạch','Cá ngừ đại dương','Cá trích phi lê','Tôm thẻ bóc nõn','Cá diêu hồng','Sò điệp Nhật','Cá tuyết phi lê','Bạch tuộc baby']},
    {slug:'sua-trung',name:'Sữa & trứng',emoji:'🥛',color:'#fff6d9',cal:105,protein:7,carbs:8,fat:4.6,fiber:0,price:33000,names:['Sữa tươi không đường','Sữa chua Hy Lạp','Trứng gà thả vườn','Phô mai mozzarella','Sữa hạt hạnh nhân','Sữa chua không đường','Bơ lạt tự nhiên','Phô mai lát ít béo','Trứng cút sạch','Sữa tươi tách béo','Sữa chua uống men sống','Kem sữa whipping']},
    {slug:'thuc-pham-kho',name:'Thực phẩm khô',emoji:'🌾',color:'#f2eadc',cal:344,protein:10,carbs:64,fat:5,fiber:7,price:59000,names:['Yến mạch nguyên hạt','Gạo lứt đỏ','Hạt chia dinh dưỡng','Đậu gà sấy khô','Mì nguyên cám','Hạt óc chó','Hạnh nhân rang mộc','Hạt điều không muối','Đậu lăng đỏ','Ngũ cốc granola','Gạo ST25','Miến dong nguyên chất','Bánh mì nguyên cám']},
    {slug:'do-uong',name:'Đồ uống',emoji:'🧃',color:'#e2f5ef',cal:46,protein:1.2,carbs:10,fat:.2,fiber:1,price:29000,names:['Nước ép cam nguyên chất','Nước dừa tươi','Trà xanh không đường','Nước ép táo','Kombucha gừng','Nước ép cà rốt','Sữa ngô tươi','Sinh tố bơ ít đường','Nước ép cần tây','Trà ô long thanh nhẹ','Nước khoáng thiên nhiên','Nước chanh dây']},
    {slug:'lanh-manh',name:'Thực phẩm lành mạnh',emoji:'🥗',color:'#e5f6e8',cal:210,protein:16,carbs:24,fat:6.5,fiber:5,price:69000,names:['Salad ức gà cầu vồng','Bowl cá hồi gạo lứt','Sandwich cá ngừ nguyên cám','Granola trái cây','Súp bí đỏ hạt chia','Salad quinoa rau củ','Bowl bò áp chảo','Wrap gà bơ tươi','Cháo yến mạch thịt bằm','Pudding hạt chia','Protein bar hạt dinh dưỡng','Bowl đậu gà Địa Trung Hải']}
  ];

  var photoPools = {
    'rau-cu-qua': [
      'photo-1542838132-92c53300491e','photo-1598170845058-32b9d6a5da37','photo-1546094096-0df4bcaaa337',
      'photo-1601493700631-2b16ec4b4716','photo-1563565375-f3fdfdbefa83','photo-1504545102780-26774c1bb073',
      'photo-1557844352-761f2565b576','photo-1518977676601-b53f82aba655','photo-1587334207407-deb137a955ba'
    ],
    'trai-cay': [
      'photo-1547514701-42782101795e','photo-1560806887-1e4cd0b6cbd6','photo-1571771894821-ce9b6c11b08e',
      'photo-1523049673857-eb18f1d7b578','photo-1464965911861-746a04b4bca6','photo-1537640538966-79f369143f8f',
      'photo-1585059895524-72359e06133a','photo-1553279768-865429fa0078','photo-1592924357228-91a4daadcfea'
    ],
    'thit-gia-cam': [
      'photo-1604503468506-a8da13d82791','photo-1603048297172-c92544798d5a','photo-1529692236671-f1f6cf9683ba',
      'photo-1615937657715-bc7b4b7962c1','photo-1602470520998-f4a52199a3d6','photo-1588347818036-558601350947',
      'photo-1432139555190-58524dae6a55','photo-1529193591184-b1d58069ecdd'
    ],
    'ca-hai-san': [
      'photo-1599084993091-1cb5c0721cc6','photo-1544943910-4c1dc44aab44','photo-1559847844-5315695dadae',
      'photo-1565680018434-b513d5e5fd47','photo-1559737558-2f5a35f4523b','photo-1510130387422-82bed34b37e9',
      'photo-1534482421-64566f976cfa','photo-1498654077810-12c21d4d6dc3'
    ],
    'sua-trung': [
      'photo-1550583724-b2692b85b150','photo-1506976785307-8732e854ad03','photo-1486297678162-eb2a19b0a32d',
      'photo-1571212515416-fef01fc43637','photo-1563636619-e9143da7973b','photo-1584278860047-22db9ff82bed',
      'photo-1564149504298-00c351fd7f16','photo-1587486913049-53fc88980cfc'
    ],
    'thuc-pham-kho': [
      'photo-1517673132405-a56a62b18caf','photo-1586201375761-83865001e31c','photo-1508061253366-f7da158b6d46',
      'photo-1563412885-139e4045ae80','photo-1514733670139-4d87a1941d55','photo-1515543904379-3d757afe72e4',
      'photo-1505253716362-afaea1d3d1af','photo-1612257416648-ee7a6c533444'
    ],
    'do-uong': [
      'photo-1600271886742-f049cd451bba','photo-1556679343-c7306c1976bc','photo-1530053969600-caed2596d242',
      'photo-1622597467836-f3285f2131b8','photo-1544145945-f90425340c7e','photo-1570197788417-0e82375c9371',
      'photo-1546173159-315724a31696','photo-1523362628745-0c100150b504'
    ],
    'lanh-manh': [
      'photo-1540420773420-3366772f4999','photo-1512621776951-a57141f2eefd','photo-1490645935967-10de6ba17061',
      'photo-1528735602780-2552fd46c7af','photo-1511690656952-34342bb7c2f2','photo-1547592166-23ac45744acd',
      'photo-1505253716362-afaea1d3d1af','photo-1626700051175-6818013e1d4f','photo-1543362906-acfc16c67564'
    ]
  };

  function photoUrl(id) {
    return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=720&h=540&q=82';
  }

  var productPhotos = window.NM_PRODUCT_PHOTOS || {};

  var productEmojis = ['🥦','🥬','🥕','🍅','🍠','🎃','🌱','🥗','🌿','🫑','🥒','🍄','🌽','🍊','🍏','🍌','🥑','🍓','🍇','🥝','🐉','🥭','🍐','🍈','🍊','🫐','🍗','🍖','🥩','🥩','🥓','🍖','🐔','🥓','🍔','🍗','🥩','🦆','🥩','🐟','🐠','🐟','🦐','🦑','🐟','🐟','🍤','🐟','🦪','🐟','🐙','🥛','🥣','🥚','🧀','🥛','🥣','🧈','🧀','🥚','🥛','🥤','🍦','🌾','🍚','🌱','🫘','🍝','🌰','🌰','🥜','🫘','🥣','🍚','🍜','🍞','🍊','🥥','🍵','🧃','🍹','🥕','🥤','🥑','🌿','🍵','💧','🍹','🥗','🍱','🥪','🥣','🍲','🥗','🍱','🌯','🥣','🍮','🍫','🥗'];

  function buildProducts() {
    var products = [];
    var number = 0;
    var goals = ['healthy','lose','muscle','maintain'];
    categories.forEach(function (category) {
      category.names.forEach(function (name, position) {
        number += 1;
        var price = category.price + (position % 5) * 7000;
        var sku = 'NMAI' + String(number).padStart(3,'0');
        var productPhoto = productPhotos[sku] || {};
        products.push({
          id:number,
          sku:sku,
          name:name,
          category:category.slug,
          categoryName:category.name,
          emoji:productEmojis[number - 1] || category.emoji,
          image:productPhoto.image || photoUrl(photoPools[category.slug][position % photoPools[category.slug].length]),
          imageSource:productPhoto.source || 'https://unsplash.com',
          color:category.color,
          price:price,
          oldPrice:number % 7 === 0 ? Math.round(price / .9 / 1000) * 1000 : 0,
          calories:Math.max(1,category.cal + (position % 4) * 7 - 6),
          protein:Number(Math.max(0,category.protein + (position % 3) * 1.2).toFixed(1)),
          carbs:Number(Math.max(0,category.carbs + (position % 4) * 1.5).toFixed(1)),
          fat:Number(Math.max(0,category.fat + (position % 3) * .5).toFixed(1)),
          fiber:Number(Math.max(0,category.fiber + (position % 4) * .4).toFixed(1)),
          healthy:number % 3 === 0 || category.slug === 'lanh-manh',
          goal:goals[(number - 1) % goals.length],
          stock:18 + (number % 27),
          status:'active'
        });
      });
    });
    return products;
  }

  function isoDaysAgo(days,hour) {
    var date = new Date();
    date.setDate(date.getDate() - days);
    date.setHours(hour || 10,18,0,0);
    return date.toISOString();
  }

  function buildDemoOrders(products) {
    var names = ['Khách mẫu 01','Khách mẫu 02','Khách mẫu 03','Khách mẫu 04','Khách mẫu 05','Khách mẫu 06','Khách mẫu 07','Khách mẫu 08','Khách tại quầy','Khách mẫu 10','Khách mẫu 11','Khách mẫu 12'];
    var statuses = ['completed','completed','processing','completed','on-hold','completed','processing','completed','completed','completed','processing','on-hold'];
    return names.map(function (name,index) {
      var first = products[(index * 7 + 2) % products.length];
      var second = products[(index * 11 + 9) % products.length];
      var items = [{id:first.id,name:first.name,price:first.price,quantity:(index % 2) + 1,emoji:first.emoji,image:first.image},{id:second.id,name:second.name,price:second.price,quantity:1,emoji:second.emoji,image:second.image}];
      return {
        id:'NM' + String(24001 + index),
        createdAt:isoDaysAgo(index % 7,9 + index % 8),
        customer:{name:name,phone:'DEMO-' + String(index + 1).padStart(3,'0'),address:'Địa chỉ minh họa'},
        payment:index % 3 === 0 ? 'Chuyển khoản ngân hàng' : 'Thanh toán khi nhận hàng',
        status:statuses[index],
        source:index === 8 ? 'POS' : 'Website',
        items:items,
        total:items.reduce(function (sum,item) { return sum + item.price * item.quantity; },0),
        note:''
      };
    });
  }

  function buildCashbook() {
    return [
      {id:'PT000106',type:'income',createdAt:isoDaysAgo(0,9),partner:'Khách tại quầy',reason:'Thu tiền bán hàng tại quầy',amount:486000},
      {id:'PT000105',type:'income',createdAt:isoDaysAgo(1,15),partner:'Khách mẫu 03',reason:'Thu tiền hóa đơn website',amount:327000},
      {id:'PC000104',type:'expense',createdAt:isoDaysAgo(2,10),partner:'Nhà cung cấp mẫu',reason:'Thanh toán tiền nhập rau củ',amount:850000},
      {id:'PT000103',type:'income',createdAt:isoDaysAgo(3,16),partner:'Khách mẫu 07',reason:'Thu tiền hóa đơn giao hàng',amount:618000},
      {id:'PC000102',type:'expense',createdAt:isoDaysAgo(4,11),partner:'Đơn vị vận chuyển',reason:'Chi phí giao hàng',amount:180000},
      {id:'PT000101',type:'income',createdAt:isoDaysAgo(5,14),partner:'Khách mẫu 01',reason:'Thu tiền bán hàng',amount:264000}
    ];
  }

  function save(key,value) { localStorage.setItem(key,JSON.stringify(value)); }
  function load(key,fallback) { try { var value=JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch (error) { return fallback; } }
  function initialize(force) {
    var products = buildProducts();
    var previousVersion = localStorage.getItem('nm_data_version');
    var currentProducts = load('nm_products',[]);
    if (force || !currentProducts.length) {
      save('nm_products',products);
    } else if (previousVersion !== '9.1.0') {
      currentProducts = currentProducts.map(function (product) {
        var model = products.find(function (item) { return item.id === product.id; });
        return model ? Object.assign({},model,product,{image:model.image}) : product;
      });
      save('nm_products',currentProducts);
    }
    if (force || !localStorage.getItem('nm_orders')) save('nm_orders',buildDemoOrders(products));
    else if (previousVersion !== '9.1.0') {
      var productById = {};
      products.forEach(function (product) { productById[product.id] = product; });
      var migratedOrders = load('nm_orders',[]).map(function (order) {
        order.items = (order.items || []).map(function (item) {
          var model = productById[item.id];
          return model ? Object.assign({},item,{image:model.image,emoji:item.emoji || model.emoji}) : item;
        });
        return order;
      });
      save('nm_orders',migratedOrders);
      var posCart = load('nm_pos_cart',{});
      Object.keys(posCart).forEach(function (key) {
        var model = productById[posCart[key].id];
        if (model) posCart[key] = Object.assign({},posCart[key],{image:model.image});
      });
      save('nm_pos_cart',posCart);
    }
    if (force || !localStorage.getItem('nm_customers')) save('nm_customers',[
      {id:1,name:'Khách mẫu A',phone:'DEMO-001',email:'demo01@example.invalid',address:'Địa chỉ minh họa',createdAt:isoDaysAgo(18,8)},
      {id:2,name:'Khách mẫu B',phone:'DEMO-002',email:'demo02@example.invalid',address:'Địa chỉ minh họa',createdAt:isoDaysAgo(12,9)},
      {id:3,name:'Khách mẫu C',phone:'DEMO-003',email:'demo03@example.invalid',address:'Địa chỉ minh họa',createdAt:isoDaysAgo(6,14)}
    ]);
    if (force || !localStorage.getItem('nm_cashbook')) save('nm_cashbook',buildCashbook());
    if (force || !localStorage.getItem('nm_cart')) save('nm_cart',[]);
    localStorage.setItem('nm_data_version','9.1.0');
  }

  initialize(false);
  window.NM = {
    categories:categories.map(function (category) { return {slug:category.slug,name:category.name,emoji:category.emoji,color:category.color,image:photoUrl(photoPools[category.slug][0]),count:category.names.length}; }),
    getProducts:function () { return load('nm_products',[]); },
    setProducts:function (value) { save('nm_products',value); },
    getOrders:function () { return load('nm_orders',[]); },
    setOrders:function (value) { save('nm_orders',value); },
    getCustomers:function () { return load('nm_customers',[]); },
    setCustomers:function (value) { save('nm_customers',value); },
    getCashbook:function () { return load('nm_cashbook',[]); },
    setCashbook:function (value) { save('nm_cashbook',value); },
    getCart:function () { return load('nm_cart',[]); },
    setCart:function (value) { save('nm_cart',value); },
    reset:function () { initialize(true); },
    formatMoney:function (value) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(value)||0); },
    escape:function (value) { var node=document.createElement('div'); node.textContent=value == null ? '' : String(value); return node.innerHTML; },
    orderStatus:{completed:'Hoàn thành',processing:'Đang xử lý','on-hold':'Chờ xác nhận',cancelled:'Đã hủy'},
    orderStatusClass:{completed:'green',processing:'blue','on-hold':'amber',cancelled:'red'}
  };
}());
