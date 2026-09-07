# NutriMart AI – GitHub Pages

Website bán thực phẩm dinh dưỡng viết hoàn toàn bằng HTML, CSS và JavaScript. Dự án không sử dụng WordPress, PHP, MySQL, XAMPP hay hosting trả phí.

## Ba giao diện riêng

| Khu vực | File | Chức năng |
|---|---|---|
| Khách hàng | `index.html` | Trang chủ, 100 sản phẩm, tìm kiếm, lọc, giỏ hàng, đặt hàng, BMI/BMR/TDEE |
| Quản lý | `man/#/DashBoard` | Thanh tiện ích + thanh module kiểu KiotViet; tổng quan, hàng hóa, mua hàng, đơn hàng, khách hàng, nhân viên, sổ quỹ, báo cáo, online, thuế |
| Thu ngân/POS | `sale/#/` | POS ba chế độ: Bán nhanh, Bán thường, Bán giao hàng; tìm hàng F3, khách F4, thanh toán F9 |

Trang quản trị là bản trình diễn công khai và mở trực tiếp từ `man/#/DashBoard` (`admin.html` là trang nội dung gốc).

> GitHub Pages là hosting tĩnh nên dự án không nhúng mật khẩu quản trị vào mã nguồn. Dữ liệu dùng `localStorage`, chỉ tồn tại trên từng trình duyệt và không ảnh hưởng dữ liệu của người xem khác.

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
├── admin.html
├── pos.html
├── man/index.html
├── sale/index.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   ├── admin.css
│   │   └── pos.css
│   └── js/
│       ├── data.js
│       ├── store.js
│       ├── admin.js
│       └── pos.js
├── .github/workflows/deploy-pages.yml
├── .nojekyll
└── start-local.bat
```

## Nơi sửa giao diện

| Muốn sửa | File |
|---|---|
| Nội dung trang khách hàng | `index.html` |
| Màu sắc và responsive trang khách | `assets/css/style.css` |
| Giỏ hàng, đặt hàng và tính dinh dưỡng | `assets/js/store.js` |
| Dữ liệu 100 sản phẩm | `assets/js/data.js` |
| Bố cục trang quản trị | `admin.html` |
| Giao diện quản lý | `assets/css/admin.css` |
| Chức năng quản lý | `assets/js/admin.js` |
| Giao diện thu ngân | `assets/css/pos.css` |
| Chức năng thu ngân | `assets/js/pos.js` |

## Khôi phục dữ liệu mẫu

Vào `man/#/DashBoard → Thiết lập → Khôi phục dữ liệu mẫu`.

## Khi cần sử dụng thật

Để dữ liệu đồng bộ giữa nhiều máy và tài khoản admin bảo mật, giữ giao diện GitHub Pages này nhưng kết nối thêm Supabase hoặc Firebase cho đăng nhập và cơ sở dữ liệu.
