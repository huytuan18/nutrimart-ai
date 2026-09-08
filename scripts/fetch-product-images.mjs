import fs from 'node:fs';

const products = [
  ['NMAI001','Bông cải xanh hữu cơ','fresh broccoli vegetable'],
  ['NMAI002','Cải bó xôi baby','fresh spinach leaves'],
  ['NMAI003','Cà rốt Đà Lạt','fresh carrots vegetable'],
  ['NMAI004','Cà chua bi đỏ','red cherry tomatoes'],
  ['NMAI005','Khoai lang mật','fresh sweet potatoes'],
  ['NMAI006','Bí đỏ hồ lô','butternut squash pumpkin'],
  ['NMAI007','Măng tây xanh','fresh green asparagus'],
  ['NMAI008','Rau xà lách xoăn','curly green lettuce'],
  ['NMAI009','Cải kale tươi','fresh kale leaves'],
  ['NMAI010','Ớt chuông ba màu','colorful bell peppers'],
  ['NMAI011','Dưa leo baby','fresh cucumbers'],
  ['NMAI012','Nấm đùi gà','king oyster mushrooms'],
  ['NMAI013','Bắp ngọt hữu cơ','fresh sweet corn'],
  ['NMAI014','Cam vàng mọng nước','fresh oranges fruit'],
  ['NMAI015','Táo xanh giòn','green apples fruit'],
  ['NMAI016','Chuối già Nam Mỹ','ripe bananas fruit'],
  ['NMAI017','Bơ sáp cao nguyên','fresh avocado fruit'],
  ['NMAI018','Dâu tây Đà Lạt','fresh strawberries'],
  ['NMAI019','Nho đỏ không hạt','red grapes fruit'],
  ['NMAI020','Kiwi xanh New Zealand','green kiwi fruit'],
  ['NMAI021','Thanh long ruột đỏ','red dragon fruit pitaya'],
  ['NMAI022','Xoài cát chín','ripe mango fruit'],
  ['NMAI023','Lê Hàn Quốc','Asian pear fruit'],
  ['NMAI024','Dưa lưới ruột cam','cantaloupe melon fruit'],
  ['NMAI025','Bưởi da xanh','pomelo fruit'],
  ['NMAI026','Việt quất tươi','fresh blueberries'],
  ['NMAI027','Ức gà phi lê','chicken breast'],
  ['NMAI028','Đùi gà rút xương','chicken thigh'],
  ['NMAI029','Thăn bò mềm','raw beef tenderloin steak'],
  ['NMAI030','Bắp bò Úc','beef shank'],
  ['NMAI031','Thịt heo thăn','pork tenderloin'],
  ['NMAI032','Sườn non heo','raw pork ribs'],
  ['NMAI033','Gà ta nguyên con','raw whole chicken'],
  ['NMAI034','Ba chỉ bò cuộn','thin sliced rolled beef'],
  ['NMAI035','Thịt bò xay','raw ground beef'],
  ['NMAI036','Cánh gà tươi','raw chicken wings'],
  ['NMAI037','Nạc vai heo','pork shoulder'],
  ['NMAI038','Ức vịt phi lê','duck breast'],
  ['NMAI039','Thịt bê mềm','raw veal meat'],
  ['NMAI040','Cá hồi phi lê','raw salmon fillet'],
  ['NMAI041','Cá basa phi lê','pangasius fish'],
  ['NMAI042','Cá thu cắt khúc','mackerel fish'],
  ['NMAI043','Tôm sú tươi','fresh tiger prawns'],
  ['NMAI044','Mực ống làm sạch','raw squid seafood'],
  ['NMAI045','Cá ngừ đại dương','tuna fish'],
  ['NMAI046','Cá trích phi lê','herring fish'],
  ['NMAI047','Tôm thẻ bóc nõn','shrimp seafood'],
  ['NMAI048','Cá diêu hồng','red tilapia fish'],
  ['NMAI049','Sò điệp Nhật','fresh scallops seafood'],
  ['NMAI050','Cá tuyết phi lê','raw cod fillet'],
  ['NMAI051','Bạch tuộc baby','octopus seafood'],
  ['NMAI052','Sữa tươi không đường','fresh milk glass bottle'],
  ['NMAI053','Sữa chua Hy Lạp','Greek yogurt bowl'],
  ['NMAI054','Trứng gà thả vườn','free range chicken eggs'],
  ['NMAI055','Phô mai mozzarella','mozzarella cheese'],
  ['NMAI056','Sữa hạt hạnh nhân','almond milk glass'],
  ['NMAI057','Sữa chua không đường','plain yogurt bowl'],
  ['NMAI058','Bơ lạt tự nhiên','unsalted butter'],
  ['NMAI059','Phô mai lát ít béo','sliced cheese'],
  ['NMAI060','Trứng cút sạch','quail eggs'],
  ['NMAI061','Sữa tươi tách béo','skim milk'],
  ['NMAI062','Sữa chua uống men sống','yogurt drink'],
  ['NMAI063','Kem sữa whipping','whipping cream'],
  ['NMAI064','Yến mạch nguyên hạt','rolled oats'],
  ['NMAI065','Gạo lứt đỏ','brown rice grains'],
  ['NMAI066','Hạt chia dinh dưỡng','chia seeds'],
  ['NMAI067','Đậu gà sấy khô','dried chickpeas'],
  ['NMAI068','Mì nguyên cám','whole wheat pasta'],
  ['NMAI069','Hạt óc chó','walnuts food'],
  ['NMAI070','Hạnh nhân rang mộc','almonds food'],
  ['NMAI071','Hạt điều không muối','cashew nuts'],
  ['NMAI072','Đậu lăng đỏ','red lentils'],
  ['NMAI073','Ngũ cốc granola','granola cereal'],
  ['NMAI074','Gạo ST25','white rice grains'],
  ['NMAI075','Miến dong nguyên chất','rice noodles'],
  ['NMAI076','Bánh mì nguyên cám','whole wheat bread'],
  ['NMAI077','Nước ép cam nguyên chất','fresh orange juice glass'],
  ['NMAI078','Nước dừa tươi','fresh coconut water'],
  ['NMAI079','Trà xanh không đường','green tea cup'],
  ['NMAI080','Nước ép táo','apple juice glass'],
  ['NMAI081','Kombucha gừng','kombucha'],
  ['NMAI082','Nước ép cà rốt','carrot juice glass'],
  ['NMAI083','Sữa ngô tươi','corn milk drink'],
  ['NMAI084','Sinh tố bơ ít đường','avocado smoothie'],
  ['NMAI085','Nước ép cần tây','celery juice glass'],
  ['NMAI086','Trà ô long thanh nhẹ','oolong tea cup'],
  ['NMAI087','Nước khoáng thiên nhiên','mineral water bottle'],
  ['NMAI088','Nước chanh dây','passion fruit juice'],
  ['NMAI089','Salad ức gà cầu vồng','chicken salad bowl'],
  ['NMAI090','Bowl cá hồi gạo lứt','salmon brown rice bowl'],
  ['NMAI091','Sandwich cá ngừ nguyên cám','tuna sandwich'],
  ['NMAI092','Granola trái cây','granola fruit'],
  ['NMAI093','Súp bí đỏ hạt chia','pumpkin soup bowl'],
  ['NMAI094','Salad quinoa rau củ','quinoa vegetable salad'],
  ['NMAI095','Bowl bò áp chảo','beef rice bowl'],
  ['NMAI096','Wrap gà bơ tươi','chicken wrap'],
  ['NMAI097','Cháo yến mạch thịt bằm','oatmeal porridge'],
  ['NMAI098','Pudding hạt chia','chia seed pudding'],
  ['NMAI099','Protein bar hạt dinh dưỡng','protein bar'],
  ['NMAI100','Bowl đậu gà Địa Trung Hải','chickpea salad']
];

const endpoint = 'https://commons.wikimedia.org/w/api.php';

async function findImage([sku,name,query],attempt = 1) {
  const params = new URLSearchParams({
    action:'query', generator:'search', gsrsearch:query + ' filetype:bitmap -logo -map -diagram',
    gsrnamespace:'6', gsrlimit:'6', prop:'imageinfo',
    iiprop:'url|mime|size|extmetadata', iiurlwidth:'900', format:'json', origin:'*'
  });
  try {
    const response = await fetch(endpoint + '?' + params, {
      headers:{'User-Agent':'NutriMartAI-StudentProject/1.0 (https://github.com/huytuan18/nutrimart-ai)'}
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    const json = await response.json();
    const pages = Object.values(json.query?.pages || {}).sort((a,b)=>(a.index || 0)-(b.index || 0));
    const page = pages.find(item => {
      const info = item.imageinfo?.[0];
      return info && /^image\/(?:jpeg|png|webp)$/.test(info.mime || '') && info.width >= 500 && info.height >= 350;
    }) || pages[0];
    const info = page?.imageinfo?.[0];
    if (!info?.thumburl) throw new Error('Không tìm thấy ảnh');
    return {
      sku, name, query, image:info.thumburl,
      source:info.descriptionurl || '',
      title:String(page.title || '').replace(/^File:/,''),
      license:info.extmetadata?.LicenseShortName?.value || 'Wikimedia Commons',
      artist:String(info.extmetadata?.Artist?.value || '').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim()
    };
  } catch (error) {
    if (attempt < 3) {
      await new Promise(resolve => setTimeout(resolve,attempt * 1200));
      return findImage([sku,name,query],attempt + 1);
    }
    return {sku,name,query,error:error.message};
  }
}

const results = new Array(products.length);
let cursor = 0;

async function worker() {
  while (cursor < products.length) {
    const index = cursor++;
    results[index] = await findImage(products[index]);
    process.stdout.write(results[index].error ? '×' : '✓');
  }
}

await Promise.all(Array.from({length:10},worker));
process.stdout.write('\n');

const failures = results.filter(item => item.error);
if (failures.length) {
  console.error('Không lấy được ảnh:',failures.map(item => item.sku + ' ' + item.error).join(', '));
  process.exitCode = 1;
}

const map = results.reduce((output,item) => {
  if (!item.error) output[item.sku] = {image:item.image,source:item.source,title:item.title,license:item.license};
  return output;
},{});

const js = "/* Ảnh sản phẩm thực tế từ Wikimedia Commons. Xem IMAGE-CREDITS.md. */\nwindow.NM_PRODUCT_PHOTOS = " + JSON.stringify(map,null,2) + ";\n";
fs.writeFileSync('assets/js/product-images.js',js);

const rows = results.filter(item => !item.error).map(item =>
  '| ' + item.sku + ' | ' + item.name.replace(/\|/g,'\\|') + ' | [' + item.title.replace(/\|/g,'\\|') + '](' + item.source + ') | ' + item.license.replace(/\|/g,'\\|') + ' |'
);
fs.writeFileSync('IMAGE-CREDITS.md','# Nguồn ảnh sản phẩm\n\nẢnh được tải trực tiếp từ Wikimedia Commons. Quyền sử dụng của từng ảnh nằm tại trang nguồn liên kết bên dưới.\n\n| SKU | Sản phẩm | Nguồn | Giấy phép |\n|---|---|---|---|\n' + rows.join('\n') + '\n');

console.log('Đã tạo',Object.keys(map).length,'ảnh sản phẩm.');
