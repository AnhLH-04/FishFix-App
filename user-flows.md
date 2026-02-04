# User Flows

## Flow 1: Sign up / Sign in

### Registration Flow
1. User chọn vai trò (Customer/Worker)
2. Nhập email, phone và tạo mật khẩu
3. **Hệ thống gửi email xác thực**
4. User click link xác nhận trong email
5. Email được verify → `IsVerified = true`
6. User có thể đăng nhập

### Login Flow
1. User nhập email/phone và mật khẩu
2. Hệ thống xác thực credentials
3. Trả về JWT access token
4. User có thể truy cập các protected endpoints

### Email Verification
- Token hết hạn sau 24 giờ
- User có thể yêu cầu gửi lại email xác nhận
- Sau khi verify, hệ thống gửi welcome email

### API Endpoints
| Action | Endpoint | Method |
|--------|----------|--------|
| Đăng ký | `/api/identity/register` | POST |
| Xác nhận email | `/api/identity/verify-email` | GET |
| Gửi lại email | `/api/identity/resend-verification` | POST |
| Đăng nhập | `/api/identity/login` | POST |
| Xem profile | `/api/identity/me` | GET |
| Cập nhật profile | `/api/identity/me` | PUT |

## Flow 2: Create Job
- Customer nhập mô tả, ảnh lỗi, địa chỉ.
- Hệ thống lưu draft job (status: open) để xử lý AI.
- AI chẩn đoán lỗi và trả về:
  - Loại sự cố (category).
  - Mức độ/độ khó.
  - Khoảng chi phí ước lượng.
- Customer xem kết quả AI, chỉnh sửa nếu cần và xác nhận tạo job.

## Flow 3: Bid → Booking → Payment
- Hệ thống auto đề xuất danh sách thợ phù hợp dựa trên output AI.
- Worker gửi bid cho job.
- Customer chọn bid phù hợp.
- Tạo booking và thực hiện thanh toán đặt cọc/thanh toán cuối.
- Worker đến kiểm tra thực tế, cập nhật chẩn đoán và giải pháp sửa chữa.
- Customer xác nhận chi phí và giải pháp trên app trước khi bắt đầu.
- Thanh toán được thực hiện qua nền tảng (escrow/online) trước hoặc sau khi hoàn tất theo quy định.

## Flow 4: Review
- Sau khi booking hoàn tất, hệ thống nhắc Customer đánh giá.
- Customer chấm điểm và viết nhận xét.
- Hệ thống cập nhật rating_avg, rating_count cho Worker.

## Flow 5: Chat
- Customer mở chat từ job/booking.
- Worker phản hồi, hai bên trao đổi thêm thông tin.
- Thông báo realtime cho tin nhắn mới.

## Flow 6: AI Pre-Diagnosis & Auto-Match
- Customer upload ảnh và mô tả lỗi.
- AI trả về ước lượng chi phí, category gợi ý và mức độ; chưa xác định lỗi chính thức.
- Hệ thống auto lọc thợ phù hợp theo category, khoảng cách, rating, lịch làm việc.
- Customer xem danh sách gợi ý và chọn thợ hoặc mở bidding.