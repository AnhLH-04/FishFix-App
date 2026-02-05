# Google Maps Integration Guide

## ✅ Tính năng đã hoàn thành

### 1. **JobMapScreen** - Màn hình bản đồ cho thợ
📍 **Vị trí:** `src/screens/technician/JobMapScreen.js`

**Chức năng:**
- Hiển thị vị trí thợ bằng marker màu xanh (icon person)
- Hiển thị các jobs gần nhất bằng markers (icon construct)
- Màu viền marker thể hiện độ khẩn cấp (xanh lá = low, cam = medium, đỏ = high/emergency)
- Khi chọn job marker:
  - Tự động gọi Google Directions API để tính đường đi
  - Vẽ route (polyline màu xanh) từ thợ đến job
  - Hiển thị distance và duration từ Google API
  - Bottom sheet hiện chi tiết job: title, description, address, budget, time
- Nút "Xem Chi Tiết" để navigate đến JobDetailScreen
- Auto fit map để hiển thị tất cả markers
- Nút list ở header để quay lại list view

### 2. **Google Maps Service** - Service layer
📍 **Vị trí:** `src/services/googleMapsService.js`

**Functions:**
- `getDirections(originLat, originLng, destLat, destLng)`
  - Gọi Google Directions API
  - Trả về: distance, duration, encoded polyline, steps
  - API Key: AIzaSyCNq3eqK9-9uvzOY0CXtsHnx0oH2eOPdqU

- `decodePolyline(encoded)`
  - Decode Google encoded polyline thành array coordinates
  - Để vẽ Polyline trên MapView

- `getDistanceMatrix(origins, destinations)`
  - Tính khoảng cách/thời gian giữa nhiều điểm
  - Dùng cho batch calculations

### 3. **NearbyJobsScreen** - Cập nhật
📍 **Vị trí:** `src/screens/technician/NearbyJobsScreen.js`

**Thêm mới:**
- Nút "Map" ở header để chuyển sang JobMapScreen
- Pass categoryId filter sang map screen

### 4. **App Configuration**
📍 **Vị trí:** `app.json`

**Đã config:**
```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "AIzaSyCNq3eqK9-9uvzOY0CXtsHnx0oH2eOPdqU"
    }
  },
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "AIzaSyCNq3eqK9-9uvzOY0CXtsHnx0oH2eOPdqU"
      }
    }
  }
}
```

### 5. **Navigation Setup**
📍 **Vị trí:** `src/navigation/AppNavigator.js`

**Đã thêm:**
- Import JobMapScreen
- Thêm Stack.Screen "JobMap" vào TechnicianStack

---

## 🧪 Hướng dẫn Test

### Bước 1: Restart Metro Bundler
```bash
# Tắt terminal đang chạy (Ctrl+C)
# Xóa cache và restart
npx expo start -c
```

### Bước 2: Test trên Emulator (Development)
```bash
# Chọn platform
# Press 'a' cho Android
# Press 'i' cho iOS
```

**Lưu ý:**
- Emulator không có GPS thật → Sẽ dùng mock location (HCM City)
- Markers và routes vẫn hiển thị bình thường
- Test chức năng UI/UX

### Bước 3: Test trên Real Device (Production-like)
```bash
# Build APK cho Android
eas build --platform android --profile preview

# Hoặc dùng Expo Go
# Scan QR code từ terminal
```

**Test flow:**
1. Đăng nhập với role = Technician
2. Từ TechnicianHomeScreen → Navigate đến Jobs hoặc NearbyJobs
3. Tap nút **Map icon** ở header
4. Xem JobMapScreen hiển thị:
   - ✅ Technician marker (màu xanh, icon person)
   - ✅ Job markers (icon construct, viền màu theo urgency)
   - ✅ Job count badge ở góc trên bên phải
5. Tap vào 1 job marker
6. Xem route polyline được vẽ từ thợ đến job
7. Check bottom sheet hiển thị:
   - ✅ Distance (ví dụ: "2.5 km")
   - ✅ Duration (ví dụ: "8 phút")
   - ✅ Budget, address, time
8. Tap "Xem Chi Tiết" → Navigate đến JobDetailScreen

---

## 📦 Packages đã cài

```json
{
  "expo-location": "~19.0.8",
  "react-native-maps": "1.26.6"
}
```

---

## 🔑 Google APIs đã enable

1. **Maps SDK for Android** ✅
2. **Maps SDK for iOS** ✅
3. **Directions API** ✅
4. **Distance Matrix API** ✅ (optional)

**API Key:** `AIzaSyCNq3eqK9-9uvzOY0CXtsHnx0oH2eOPdqU`

---

## 🚨 Troubleshooting

### Issue 1: Map không hiển thị
**Giải pháp:**
- Check internet connection
- Verify API key trong app.json
- Rebuild app sau khi thay đổi config: `npx expo prebuild --clean`

### Issue 2: Route không vẽ được
**Giải pháp:**
- Check console.log xem có error từ Directions API không
- Verify API key có quyền Directions API
- Check quota limits (Google Cloud Console)

### Issue 3: Markers không hiển thị
**Giải pháp:**
- Check jobs có latitude/longitude hợp lệ không
- Verify API endpoint `/api/jobs/available` trả về data đúng format

### Issue 4: "Version mismatch" warning
**Giải pháp:**
- Có thể ignore warning này trong development
- Nếu muốn fix: `npx expo install react-native-maps@1.20.1`

---

## 🎯 Luồng hoạt động (Flow)

```
1. User (Technician) mở app
   ↓
2. App lấy GPS location từ LocationService
   ↓
3. TechnicianHomeScreen → Navigate "Nearby Jobs"
   ↓
4. NearbyJobsScreen hiển thị list
   ↓
5. User tap nút "Map" ở header
   ↓
6. JobMapScreen được mount
   ↓
7. Fetch available jobs từ API
   ↓
8. Tính distance cho mỗi job (client-side)
   ↓
9. Hiển thị technician marker + job markers
   ↓
10. User tap job marker
    ↓
11. Gọi googleMapsService.getDirections()
    ↓
12. Decode polyline và vẽ route
    ↓
13. Hiển thị distance/duration trong bottom sheet
    ↓
14. User tap "Xem Chi Tiết"
    ↓
15. Navigate → JobDetailScreen
```

---

## 📝 Next Steps (Tính năng có thể mở rộng)

### 1. Real-time Location Tracking
- Update technician location mỗi 5-10 giây
- Recalculate route khi thợ di chuyển

```javascript
// Example
useEffect(() => {
    const interval = setInterval(async () => {
        const newLocation = await locationService.getCurrentLocation();
        setTechnicianLocation(newLocation);
        // Recalculate route...
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
}, []);
```

### 2. Clustering cho nhiều markers
- Khi có > 50 jobs, group markers lại
- Dùng `react-native-maps-clustering`

```bash
npm install react-native-maps-clustering
```

### 3. Filter jobs trên map
- Dropdown để filter theo category, urgency, budget
- Update markers real-time

### 4. Custom Marker Info Window
- Khi tap marker, hiện info bubble trên map
- Thay vì dùng bottom sheet

### 5. Navigation Integration
- Thay "Xem Chi Tiết" = "Bắt đầu điều hướng"
- Mở Google Maps app hoặc dùng in-app navigation

```javascript
// Open Google Maps app
const url = locationService.getDirectionsUrl(
    technicianLocation.latitude,
    technicianLocation.longitude,
    job.latitude,
    job.longitude
);
Linking.openURL(url);
```

---

## 🔒 Security Notes

**⚠️ WARNING:** API Key hiện tại không có restrictions!

**Nên làm:**
1. Go to Google Cloud Console
2. Navigate to "Credentials"
3. Chọn API key
4. Add restrictions:
   - **Application restrictions:** iOS apps / Android apps
   - **API restrictions:** Chỉ enable Maps SDK, Directions API
   - **Bundle ID (iOS):** host.exp.exponent (Expo Go) hoặc bundle ID của bạn
   - **Package name (Android):** host.exp.exponent (Expo Go) hoặc package của bạn

**Production:**
- Tạo separate API keys cho iOS và Android
- Enable billing alerts để monitor usage
- Set daily quota limits

---

## 📊 API Usage Estimates

**Free tier:** 
- Directions API: $5 credit/month (~1000 requests)
- Distance Matrix: $5 credit/month (~1000 requests)

**Optimize:**
- Cache directions trong 1 session
- Không gọi API mỗi lần pan/zoom map
- Chỉ calculate route khi user tap marker

---

## ✅ Checklist

- [x] Install expo-location package
- [x] Install react-native-maps package
- [x] Configure Google Maps API key
- [x] Create locationService with GPS utilities
- [x] Create googleMapsService with Directions API
- [x] Create JobMapScreen component
- [x] Add navigation for JobMapScreen
- [x] Update NearbyJobsScreen with map button
- [ ] Test trên Android Emulator
- [ ] Test trên iOS Simulator
- [ ] Test trên real device
- [ ] Verify routes hiển thị đúng
- [ ] Verify distance/duration chính xác
- [ ] Add API key restrictions (Production)

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Console logs cho errors
2. Network tab cho API calls
3. Google Cloud Console cho API quotas
4. Expo documentation: https://docs.expo.dev/versions/latest/sdk/map-view/
5. React Native Maps: https://github.com/react-native-maps/react-native-maps

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** 2024
**Version:** 1.0.0
