# Supabase của NutriMart AI

Project đang dùng:

```text
https://asmjcentjejcpefkohgt.supabase.co
```

Schema tài khoản, trigger, RLS và URL xác nhận email đã được cài trên project này. File `supabase/schema.sql` được giữ lại để kiểm tra hoặc cài lại trên project khác.

## 1. Cài schema trên project khác

1. Mở https://supabase.com/dashboard và tạo một project miễn phí.
2. Trong project, mở **SQL Editor → New query**.
3. Sao chép toàn bộ `supabase/schema.sql`, dán vào và chọn **Run**.

## 2. Cấu hình frontend

Mở **Connect** hoặc **Project Settings → API Keys**, lấy đúng hai giá trị:

- Project URL: dạng `https://xxxxx.supabase.co`.
- Publishable key: bắt đầu bằng `sb_publishable_` (project cũ có thể dùng `anon` key bắt đầu bằng `eyJ`).

Không bao giờ đưa `secret key` hoặc `service_role key` vào GitHub.

Project hiện tại đã được điền sẵn trong `assets/js/supabase-config.js`. Nếu chuyển sang project khác, thay hai giá trị:

```js
window.NM_SUPABASE = {
  url: 'https://xxxxx.supabase.co',
  publishableKey: 'sb_publishable_xxxxx'
};
```

## 3. Đường dẫn xác nhận email hiện tại

Trong **Authentication → URL Configuration**:

- Site URL: `https://huytuan18.github.io/nutrimart-ai/`
- Redirect URL: `https://huytuan18.github.io/nutrimart-ai/**`

## 4. Tạo admin đầu tiên

1. Mở `https://huytuan18.github.io/nutrimart-ai/auth.html?tab=register` và đăng ký bằng email của bạn.
2. Xác nhận email nếu Supabase yêu cầu.
3. Quay lại **SQL Editor**, chạy câu lệnh sau sau khi thay email:

```sql
update public.profiles
set role = 'admin'
where email = 'EMAIL_CUA_BAN';
```

Đăng xuất rồi đăng nhập lại. Tài khoản này sẽ vào được `/man/` và `/sale/`.

## 5. Tạo nhân viên và khách hàng

- Mỗi người tự đăng ký; tài khoản mới luôn có vai trò `customer`.
- Admin mở **Quản lý → Nhân viên → Phân quyền tài khoản** để đổi `customer` thành `staff`.
- `staff` chỉ vào POS; `customer` chỉ vào cửa hàng và tài khoản cá nhân.

## Bảo mật

`schema.sql` bật Row Level Security. Publishable/anon key được phép xuất hiện ở frontend khi RLS đã bật. Secret/service-role key có thể vượt RLS nên tuyệt đối không đưa vào mã nguồn hoặc gửi qua chat.

Tài liệu Supabase:

- https://supabase.com/docs/guides/database/secure-data
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/auth/passwords
