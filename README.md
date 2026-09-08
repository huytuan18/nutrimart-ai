# NutriMart AI – GitHub Pages

Website bán thực phẩm dinh dưỡng viết hoàn toàn bằng HTML, CSS và JavaScript. Dự án không sử dụng WordPress, PHP, MySQL, XAMPP hay hosting trả phí.

## Các giao diện riêng

| Khu vực | File | Chức năng |
|---|---|---|
| Đăng nhập | `auth.html` | Đăng nhập, đăng ký và khôi phục mật khẩu qua Supabase Auth |
| Khách hàng | `index.html` + `account.html` | 100 sản phẩm ảnh thật, tìm kiếm, lọc, giỏ hàng, đặt hàng, BMI/BMR/TDEE và lịch sử đơn |
| Quản lý | `man/#/DashBoard` | Thanh tiện ích + thanh module kiểu KiotViet; tổng quan, hàng hóa, mua hàng, đơn hàng, khách hàng, nhân viên, sổ quỹ, báo cáo, online, thuế |
| Thu ngân/POS | `sale/#/` | POS ba chế độ: Bán nhanh, Bán thường, Bán giao hàng; tìm hàng F3, khách F4, thanh toán F9 |

Trang quản trị và POS yêu cầu đúng vai trò tài khoản. Đăng ký công khai chỉ tạo tài khoản khách hàng; admin cấp quyền tại **Nhân viên → Phân quyền tài khoản**.

## Đăng nhập và phân quyền thật

Tài khoản được xác thực bởi Supabase Auth. Bảng `profiles` bật Row Level Security:

- `admin`: vào trang quản lý và POS, xem/cấp quyền tài khoản.
- `staff`: chỉ vào POS.
- `customer`: cửa hàng và tài khoản cá nhân.

Xem [SUPABASE-SETUP.md](SUPABASE-SETUP.md) để tạo bảng và admin đầu tiên. Chỉ dùng Publishable/anon key ở frontend; không dùng secret/service-role key.

## Mở trên máy bằng Visual Studio Code

### Cách nhanh

Nhấp đúp file `start-local.bat`. Trình duyệt sẽ mở:

```text
http://localhost:5500
```

Máy cần có Python. Có thể chạy thủ công trong Terminal:

```powershell
python -m http.server 5500
```

## Đưa lên GitHub Pages

1. Đăng nhập GitHub và tạo repository mới, ví dụ `nutrimart-ai`.
2. Không chọn tạo README vì dự án đã có sẵn.
3. Mở thư mục này bằng VS Code.
4. Chọn **Source Control → Initialize Repository**.
5. Commit toàn bộ file với nội dung `NutriMart AI GitHub Pages`.
6. Chọn **Publish Branch** và repository vừa tạo.
7. Chờ workflow `Deploy NutriMart AI to GitHub Pages` hoàn thành. File cấu hình sẽ tự bật GitHub Pages.

Link website có dạng:

```text
https://TEN-TAI-KHOAN.github.io/nutrimart-ai/
```

Link quản trị:

```text
https://TEN-TAI-KHOAN.github.io/nutrimart-ai/admin.html
https://TEN-TAI-KHOAN.github.io/nutrimart-ai/man/#/DashBoard
```

Link bán hàng tại quầy:

```text
https://TEN-TAI-KHOAN.github.io/nutrimart-ai/pos.html
https://TEN-TAI-KHOAN.github.io/nutrimart-ai/sale/#/
```

## Cấu trúc mã nguồn

```text
NutriMart-AI-GitHub/
├── index.html
├── auth.html
├── account.html
├── admin.html
├── pos.html
├── man/index.html
├── sale/index.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── auth.css
│   │   ├── account.css
│   │   ├── admin.css
│   │   └── pos.css
│   └── js/
│       ├── data.js
│       ├── product-images.js
│       ├── auth.js
│       ├── supabase-config.js
│       ├── auth-page.js
│       ├── account.js
│       ├── store.js
│       ├── admin.js
│       └── pos.js
├── .github/workflows/deploy-pages.yml
├── supabase/schema.sql
├── SUPABASE-SETUP.md
├── IMAGE-CREDITS.md
├── .nojekyll
└── start-local.bat
```

## Nơi sửa giao diện

| Muốn sửa | File |
|---|---|
| Nội dung trang khách hàng | `index.html` |
| Đăng nhập, đăng ký và phân quyền | `auth.html`, `assets/js/auth.js`, `assets/js/auth-page.js` |
| Khu vực tài khoản khách hàng | `account.html`, `assets/js/account.js` |
| Màu sắc và responsive trang khách | `assets/css/style.css` |
| Giỏ hàng, đặt hàng và tính dinh dưỡng | `assets/js/store.js` |
| Dữ liệu 100 sản phẩm | `assets/js/data.js` |
| Ảnh thực tế theo từng SKU | `assets/js/product-images.js`, `IMAGE-CREDITS.md` |
| Bố cục trang quản trị | `admin.html` |
| Giao diện quản lý | `assets/css/admin.css` |
| Chức năng quản lý | `assets/js/admin.js` |
| Giao diện thu ngân | `assets/css/pos.css` |
| Chức năng thu ngân | `assets/js/pos.js` |

## Khôi phục dữ liệu mẫu

Vào `man/#/DashBoard → Thiết lập → Khôi phục dữ liệu mẫu`.

## Lưu ý dữ liệu bán hàng

Supabase đang bảo vệ tài khoản và vai trò. Dữ liệu sản phẩm/hóa đơn mẫu vẫn chạy trong trình duyệt để phục vụ đồ án; có thể chuyển tiếp các bảng này lên Supabase khi cần đồng bộ nhiều máy.
