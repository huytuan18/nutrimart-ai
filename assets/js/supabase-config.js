/*
 * Dùng Publishable key (sb_publishable_...) hoặc anon key cũ.
 * TUYỆT ĐỐI không đặt secret key / service_role key trong file này.
 */
window.NM_SUPABASE = {
  url: 'https://asmjcentjejcpefkohgt.supabase.co',
  publishableKey: 'sb_publishable_Vy_saSbB9tBDoRu8IVgAPA_sQbhjpp3'
};

/*
 * Thông tin nhận thanh toán công khai do chủ cửa hàng xác nhận ngày 08/09/2026.
 * Đây là cấu hình dự phòng để VietQR vẫn hoạt động nếu bảng cài đặt Supabase
 * chưa được tạo hoặc tạm thời không truy cập được. Khi Supabase trả về dữ liệu,
 * cấu hình trong cơ sở dữ liệu sẽ được ưu tiên.
 */
window.NM_PUBLIC_PAYMENT_SETTINGS = {
  enabled: true,
  bankCode: '970423',
  bankName: 'TPBank',
  accountNumber: '63369191205',
  accountName: 'CAO HUY TUAN',
  shippingFee: 30000,
  freeShippingThreshold: 499000
};
