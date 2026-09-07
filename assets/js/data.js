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

  var productEmojis = ['🥦','🥬','🥕','🍅','🍠','🎃','🌱','🥗','🌿','🫑','🥒','🍄','🌽','🍊','🍏','🍌','🥑','🍓','🍇','🥝','🐉','🥭','🍐','🍈','🍊','🫐','🍗','🍖','🥩','🥩','🥓','🍖','🐔','🥓','🍔','🍗','🥩','🦆','🥩','🐟','🐠','🐟','🦐','🦑','🐟','🐟','🍤','🐟','🦪','🐟','🐙','🥛','🥣','🥚','🧀','🥛','🥣','🧈','🧀','🥚','🥛','🥤','🍦','🌾','🍚','🌱','🫘','🍝','🌰','🌰','🥜','🫘','🥣','🍚','🍜','🍞','🍊','🥥','🍵','🧃','🍹','🥕','🥤','🥑','🌿','🍵','💧','🍹','🥗','🍱','🥪','🥣','🍲','🥗','🍱','🌯','🥣','🍮','🍫','🥗'];

  function buildProducts() {
    var products = [];
    var number = 0;
    var goals = ['healthy','lose','muscle','maintain'];
    categories.forEach(function (category) {
      category.names.forEach(function (name, position) {
        number += 1;
        var price = category.price + (position % 5) * 7000;
        products.push({
          id:number,
          sku:'NMAI' + String(number).padStart(3,'0'),
          name:name,
          category:category.slug,
          categoryName:category.name,
          emoji:productEmojis[number - 1] || category.emoji,
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
      var items = [{id:first.id,name:first.name,price:first.price,quantity:(index % 2) + 1,emoji:first.emoji},{id:second.id,name:second.name,price:second.price,quantity:1,emoji:second.emoji}];
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

  function save(key,value) { localStorage.setItem(key,JSON.stringify(value)); }
  function load(key,fallback) { try { var value=JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; } catch (error) { return fallback; } }
  function initialize(force) {
    var products = buildProducts();
    if (force || !localStorage.getItem('nm_products')) save('nm_products',products);
    if (force || !localStorage.getItem('nm_orders')) save('nm_orders',buildDemoOrders(products));
    if (force || !localStorage.getItem('nm_customers')) save('nm_customers',[
      {id:1,name:'Khách mẫu A',phone:'DEMO-001',email:'demo01@example.invalid',address:'Địa chỉ minh họa',createdAt:isoDaysAgo(18,8)},
      {id:2,name:'Khách mẫu B',phone:'DEMO-002',email:'demo02@example.invalid',address:'Địa chỉ minh họa',createdAt:isoDaysAgo(12,9)},
      {id:3,name:'Khách mẫu C',phone:'DEMO-003',email:'demo03@example.invalid',address:'Địa chỉ minh họa',createdAt:isoDaysAgo(6,14)}
    ]);
    if (force || !localStorage.getItem('nm_cart')) save('nm_cart',[]);
    localStorage.setItem('nm_data_version','3.0.0');
  }

  initialize(false);
  window.NM = {
    categories:categories.map(function (category) { return {slug:category.slug,name:category.name,emoji:category.emoji,color:category.color,count:category.names.length}; }),
    getProducts:function () { return load('nm_products',[]); },
    setProducts:function (value) { save('nm_products',value); },
    getOrders:function () { return load('nm_orders',[]); },
    setOrders:function (value) { save('nm_orders',value); },
    getCustomers:function () { return load('nm_customers',[]); },
    setCustomers:function (value) { save('nm_customers',value); },
    getCart:function () { return load('nm_cart',[]); },
    setCart:function (value) { save('nm_cart',value); },
    reset:function () { initialize(true); },
    formatMoney:function (value) { return new Intl.NumberFormat('vi-VN',{style:'currency',currency:'VND',maximumFractionDigits:0}).format(Number(value)||0); },
    escape:function (value) { var node=document.createElement('div'); node.textContent=value == null ? '' : String(value); return node.innerHTML; },
    orderStatus:{completed:'Hoàn thành',processing:'Đang xử lý','on-hold':'Chờ xác nhận',cancelled:'Đã hủy'},
    orderStatusClass:{completed:'green',processing:'blue','on-hold':'amber',cancelled:'red'}
  };
}());
