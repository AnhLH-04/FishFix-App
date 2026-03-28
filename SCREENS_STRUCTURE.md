# Cấu trúc Màn hình - Smart Home Services

## 📱 Tổng quan

App có 2 loại người dùng chính:
- **Khách hàng (Customer)**: Người cần sửa chữa thiết bị
- **Thợ sửa chữa (Technician)**: Người nhận việc và thực hiện dịch vụ

## 🗂️ Cấu trúc Thư mục

```
src/screens/
├── technician/          # Màn hình dành cho thợ
│   ├── TechnicianHomeScreen.js       # Trang chủ thợ
│   ├── TechnicianProfileScreen.js    # Hồ sơ thợ
│   ├── JobsScreen.js                 # Danh sách công việc
│   ├── JobDetailScreen.js            # Chi tiết công việc
│   ├── EarningsScreen.js             # Quản lý thu nhập
│   └── ScheduleScreen.js             # Lịch làm việc
│
├── customer/            # Màn hình dành cho khách (chưa di chuyển)
│   └── (sẽ di chuyển các màn hình khách vào đây)
│
├── LoginScreen.js       # Đăng nhập
├── RoleSelectionScreen.js  # Chọn vai trò
└── ...các màn hình khác
```

## 👨‍🔧 Màn hình Thợ (Technician)

### 1. **TechnicianHomeScreen** - Trang chủ
- Thống kê công việc hôm nay (đang làm, hoàn thành, thu nhập)
- Thao tác nhanh (Tìm việc, Lịch làm việc, Việc gần đây, Thu nhập)
- Danh sách công việc đang làm và sắp tới
- Có nút đăng xuất

### 2. **JobsScreen** - Quản lý công việc
**3 tab chính:**
- **Có sẵn**: Danh sách việc có thể nhận
  - Hiển thị dịch vụ, địa chỉ, khoảng cách, giá
  - Badge "Gấp" cho việc khẩn cấp
  - Nút "Nhận việc" và "Xem chi tiết"
- **Đã nhận**: Công việc đã accept
  - Nút "Bắt đầu" để vào làm việc
- **Hoàn thành**: Lịch sử công việc đã làm

**Tính năng:**
- Tìm kiếm công việc
- Filter công việc
- Nhận việc nhanh

### 3. **JobDetailScreen** - Chi tiết công việc
**Thông tin chi tiết:**
- Tên dịch vụ và giá tiền
- Mô tả vấn đề từ khách hàng
- Địa chỉ, khách hàng, số điện thoại, thời gian, khoảng cách
- Danh sách thiết bị cần mang theo
- Preview bản đồ (link đến MapView)
- Thông tin khách hàng (tên, rating, nút gọi)

**Hành động:**
- Nhận việc
- Từ chối việc
- Gọi điện cho khách
- Xem bản đồ

### 4. **EarningsScreen** - Quản lý thu nhập
**Thống kê:**
- Thu nhập hôm nay
- Thu nhập tuần này
- Thu nhập tháng này

**Tính năng:**
- Lịch sử giao dịch chi tiết
- Trạng thái giao dịch (Hoàn thành / Đang xử lý)
- Nút "Rút tiền"
- Export báo cáo

### 5. **ScheduleScreen** - Lịch làm việc
**Hiển thị:**
- Lịch theo ngày (Hôm nay, Mai, ...)
- Số công việc mỗi ngày
- Timeline công việc với giờ cụ thể
- Trạng thái: Sắp tới / Đang làm / Hoàn thành

**Hành động nhanh mỗi công việc:**
- Gọi điện
- Chỉ đường
- Nhắn tin

### 6. **TechnicianProfileScreen** - Hồ sơ
**Menu:**
- Thông tin cá nhân
- Phương thức thanh toán
- Đánh giá của tôi
- Thống kê
- Cài đặt
- Trợ giúp
- Đăng xuất

## 👤 Màn hình Khách hàng (Customer)

### Màn hình hiện có:
- **HomeScreen**: Trang chủ với danh mục dịch vụ
- **ServiceDetailScreen**: Chi tiết dịch vụ
- **AIDiagnosisScreen**: Chẩn đoán AI bằng camera
- **TechnicianListScreen**: Danh sách thợ
- **BookingScreen**: Đặt lịch
- **BookingConfirmationScreen**: Xác nhận đặt lịch
- **BookingsScreen**: Quản lý lịch hẹn
- **InstantBookingScreen**: Đặt lịch tức thời
- **NearbyTechniciansScreen**: Thợ gần đây
- **ProfileScreen**: Hồ sơ khách hàng
- **MessagesScreen**: Tin nhắn

## 🔐 Authentication Flow

```
App Start
    ↓
RoleSelectionScreen (Chọn: Khách hàng / Thợ)
    ↓
LoginScreen (form login tùy theo role)
    ↓
    ├─→ Customer → CustomerTabs (Home, Bookings, AI Camera, Messages, Profile)
    └─→ Technician → TechnicianTabs (Home, Jobs, Messages, Profile)
```

## 🎨 Màu sắc theo vai trò

- **Customer**: Xanh dương (#2196F3)
- **Technician**: Cam (#FF6B35)

## 📊 Navigation Structure

### Customer Navigation
```
CustomerTabs (Bottom Tabs)
├── HomeTab → HomeStack
│   ├── Home
│   ├── ServiceDetail
│   ├── AIDiagnosis
│   ├── BookingType
│   ├── TechnicianList
│   ├── Booking
│   └── ...
├── BookingsTab
├── AICameraTab
├── MessagesTab
└── ProfileTab
```

### Technician Navigation
```
TechnicianTabs (Bottom Tabs)
├── TechnicianHomeTab → TechnicianStack
│   ├── TechnicianHome
│   ├── Jobs
│   ├── JobDetail
│   ├── Earnings
│   ├── Schedule
│   └── ...
├── TechnicianJobsTab
├── TechnicianMessagesTab
└── TechnicianProfileTab
```

## 🚀 Các tính năng cần bổ sung cho Thợ

### Đã triển khai ✅
- [x] Trang chủ với thống kê
- [x] Quản lý công việc (available, accepted, completed)
- [x] Chi tiết công việc
- [x] Quản lý thu nhập
- [x] Lịch làm việc
- [x] Hồ sơ thợ

### Cần triển khai 📝
- [ ] Nhận thông báo việc mới (Push Notification)
- [ ] Chat trực tiếp với khách hàng
- [ ] Đánh giá khách hàng sau khi hoàn thành
- [ ] Upload ảnh trước/sau sửa chữa
- [ ] Tạo hóa đơn cho khách
- [ ] Báo cáo sự cố/vấn đề
- [ ] Cập nhật vị trí real-time
- [ ] Quản lý thiết bị và công cụ
- [ ] Lịch sử khách hàng đã phục vụ
- [ ] Training/Học nâng cao kỹ năng

## 💡 Best Practices

1. **Tách biệt code**: Màn hình thợ và khách trong folder riêng
2. **Tái sử dụng**: Components chung trong `src/components/`
3. **Quản lý state**: Sử dụng Context API cho auth
4. **Navigation**: Mỗi role có navigator riêng
5. **Styling**: Sử dụng Colors từ `utils/colors.js`

## 📁 Files cần di chuyển

Sau này nên di chuyển các màn hình customer vào folder `customer/`:
- HomeScreen.js
- ServiceDetailScreen.js
- AIDiagnosisScreen.js
- TechnicianListScreen.js
- BookingScreen.js
- BookingConfirmationScreen.js
- InstantBookingScreen.js
- ... (và cập nhật imports)
